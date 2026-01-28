<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>輕鐵行蹤報導站 Pro - 751L 特製版</title>
    
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getDatabase, ref, set, onValue, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBErRYvF2got2vrwY0-a8KSc8JVWKdeksQ",
            authDomain: "lr-whereabout-report.firebaseapp.com",
            projectId: "lr-whereabout-report",
            storageBucket: "lr-whereabout-report.firebasestorage.app",
            messagingSenderId: "939888577145",
            appId: "1:939888577145:web:b4b51b3a2f3b8bd685e2a8",
            databaseURL: "https://lr-whereabout-report-default-rtdb.firebaseio.com"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const liveRef = ref(db, 'live_reports');

        window.db = db;
        window.user = null;
        window.reportGroups = {};
        window.favorites = new Set();
        window.isAdmin = false;

        // 登入功能
        window.login = () => {
            signInWithPopup(auth, provider).catch(error => alert("登入失敗: " + error.message));
        };

        // 登出功能
        window.logout = () => {
            signOut(auth).then(() => {
                window.favorites = new Set();
                window.renderAll();
            });
        };

        // 監聽登入狀態
        onAuthStateChanged(auth, (user) => {
            window.user = user;
            const loginBtn = document.getElementById('loginBtn');
            if (user) {
                loginBtn.innerText = `已登入 (${user.displayName.split(' ')[0]})`;
                loginBtn.onclick = window.logout;
                // 從 Firebase 載入用戶收藏
                const favRef = ref(db, `users/${user.uid}/favs`);
                onValue(favRef, (snap) => {
                    window.favorites = new Set(snap.val() || []);
                    window.renderAll();
                });
            } else {
                loginBtn.innerText = "Google 登入";
                loginBtn.onclick = window.login;
                window.renderAll();
            }
        });

        onValue(liveRef, (snapshot) => {
            window.reportGroups = snapshot.val() || {};
            window.renderAll();
            if(window.currentDetailCarId) window.showCarHistory(window.currentDetailCarId);
        });

        window.publishToFirebase = function(inputIds, newTrace) {
            const fullId = inputIds.toString().replace(/\s+/g, ''); 
            const carIds = fullId.split('-');
            const now = Date.now();
            
            carIds.forEach(carId => {
                if (!carId) return;
                const nodeRef = ref(db, 'live_reports/' + carId);
                get(nodeRef).then(snap => {
                    let group = snap.val() || { carId: carId, traces: [] };
                    if (!Array.isArray(group.traces)) group.traces = [];
                    group.traces.unshift({ ...newTrace, fullId: fullId, timestamp: now });
                    group.traces = group.traces.slice(0, 50);
                    set(nodeRef, group);
                });
            });
            alert("報導成功！");
            switchTab('livePage', document.querySelectorAll('.tab-btn')[1]);
        };

        window.deleteTrace = function(carId, timestamp) {
            if(!confirm("確定要刪除此紀錄嗎？")) return;
            const nodeRef = ref(db, 'live_reports/' + carId);
            get(nodeRef).then(snap => {
                let group = snap.val();
                if(group && group.traces) {
                    group.traces = group.traces.filter(t => t.timestamp !== timestamp);
                    if(group.traces.length === 0) remove(nodeRef);
                    else set(nodeRef, group);
                }
            });
        };

        // 修改後的收藏功能：儲存到 Firebase
        window.toggleFav = (id) => {
            if (!window.user) return alert("請先登入以儲存收藏");
            if (window.favorites.has(id)) window.favorites.delete(id);
            else window.favorites.add(id);
            
            set(ref(db, `users/${window.user.uid}/favs`), Array.from(window.favorites));
        };
    </script>

    <style>
        :root { --mtr-red: #c0392b; --mtr-blue: #2980b9; --mtr-green: #27ae60; --mtr-dark: #34495e; --mtr-yellow: #f1c40f; }
        body { font-family: -apple-system, sans-serif; background: #f0f2f5; margin: 0; padding-bottom: 20px; }
        .header { background: var(--mtr-red); color: white; padding: 15px; text-align: center; font-weight: bold; position: relative; display: flex; justify-content: space-between; align-items: center; }
        .admin-trigger { font-size: 0.8em; opacity: 0.3; cursor: pointer; }
        #loginBtn { background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.8em; cursor: pointer; }
        .tabs { display: flex; background: white; border-bottom: 2px solid #ddd; position: sticky; top: 0; z-index: 100; }
        .tab-btn { flex: 1; padding: 15px; border: none; background: white; font-weight: bold; color: #7f8c8d; cursor: pointer; }
        .tab-btn.active { color: var(--mtr-red); border-bottom: 4px solid var(--mtr-red); }
        .container { max-width: 600px; margin: auto; padding: 10px; }
        .report-form { background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .form-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .form-group { flex: 1; display: flex; flex-direction: column; position: relative; }
        label { font-size: 0.75em; color: #666; margin-bottom: 4px; font-weight: bold; }
        input, select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; }
        .suggestion-box { position: absolute; top: 100%; left: 0; right: 0; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 10px; z-index: 50; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .timeline-card { background: white; border-radius: 12px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.08); border-left: 6px solid var(--mtr-dark); }
        .timeline-header { padding: 12px 15px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .car-group-title { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-weight: bold; font-size: 1.4em; }
        .trace-item { padding: 8px 0; border-left: 2px solid #ddd; margin-left: 10px; padding-left: 15px; position: relative; }
        .trace-item::before { content: ""; width: 8px; height: 8px; background: #bbb; border-radius: 50%; position: absolute; left: -5px; top: 15px; }
        .trace-item.latest { border-left-color: var(--mtr-green); }
        .trace-item.latest::before { background: var(--mtr-green); }
        .route-badge { padding: 2px 6px; border-radius: 4px; color: white; font-size: 0.85em; font-weight: bold; }
        .run-no-badge { background: #222; color: #f1c40f; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.85em; margin-right: 5px; font-weight: bold; }
        .page { display: none; } .page.active { display: block; }
        #detailOverlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #f0f2f5; z-index: 1000; display: none; overflow-y: auto; padding: 20px; }
        .car-link { cursor: pointer; text-decoration: underline; }
        .del-btn { color: #e74c3c; font-size: 0.8em; cursor: pointer; margin-left: 10px; border: 1px solid #e74c3c; padding: 1px 4px; border-radius: 4px; }
    </style>
</head>
<body>

<div class="header">
    <span class="admin-trigger" onclick="loginAdmin()">🔒</span>
    <span>輕鐵行蹤報導站</span>
    <button id="loginBtn">載入中...</button>
</div>

<div class="tabs">
    <button class="tab-btn active" onclick="switchTab('mainPage', this)">報導</button>
    <button class="tab-btn" onclick="switchTab('livePage', this)">行蹤</button>
    <button class="tab-btn" onclick="switchTab('favPage', this)">收藏</button>
</div>

<div class="container">
    <div id="mainPage" class="page active">
        <div class="report-form">
            <div class="form-row">
                <div class="form-group" style="flex:2;"><label>車卡</label><input type="text" id="carId" placeholder="1066-1001"></div>
                <div class="form-group" style="flex:1;"><label>車序</label><input type="number" id="runNo" placeholder="901" oninput="checkRunNo()">
                    <div id="runSuggestion" class="suggestion-box">
                        <div id="suggestionText" style="font-size:12px; color:#856404;"></div>
                        <button onclick="applySuggestion()" style="background:var(--mtr-blue); color:white; border:none; padding:6px; border-radius:4px; font-size:12px; width:100%; cursor:pointer; margin-top:5px;">套用</button>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>路綫</label><select id="routeSelect" onchange="onRouteUpdate()"></select></div>
                <div class="form-group"><label>往</label><select id="directionSelect"></select></div>
            </div>
            <div class="form-group"><label>位置</label><select id="stationSelect"></select></div>
            <div class="form-group" style="margin-top:10px;"><label>備註</label><input type="text" id="memo"></div>
            <button onclick="addReport()" style="background:var(--mtr-green); color:white; border:none; padding:15px; border-radius:10px; width:100%; font-weight:bold; margin-top:10px; cursor:pointer;">提交報導</button>
        </div>
    </div>
    <div id="livePage" class="page"><div id="masterList">同步中...</div></div>
    <div id="favPage" class="page"><div id="favList"></div></div>
</div>

<div id="detailOverlay">
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 id="detailTitle">紀錄詳情</h2>
        <button onclick="closeDetail()" style="padding:10px 20px; background:#333; color:white; border:none; border-radius:8px;">返回</button>
    </div>
    <div id="detailList"></div>
</div>

<script>
// --- 基礎數據 ---
const colorMap = { "505":"#D92329", "506P":"#000000", "507":"#00A551", "507P":"#00A551", "610":"#541B15", "614":"#541B15", "614P":"#541B15", "615":"#FFDD00", "615P":"#006585", "705":"#6EBF45", "706":"#B17AB5", "720":"#000000", "751":"#F48221", "751P":"#000000", "751L":"#F48221", "761P":"#6E2C91", "不載客":"#000000" };
const routeCfg = { "505": ["三聖", "兆康"], "506P": ["兆康"], "507": ["田景", "屯門碼頭"], "507P": ["屯門碼頭"], "610": ["元朗", "屯門碼頭"], "614": ["元朗", "屯門碼頭"], "614P": ["兆康", "屯門碼頭"], "615": ["元朗", "屯門碼頭"], "615P": ["兆康", "屯門碼頭"], "705": ["天水圍循環綫", "天水圍"], "706": ["天水圍循環綫", "天水圍"], "720": ["天榮"], "751": ["友愛", "天逸"], "751P": ["天水圍", "天逸"], "751L": ["屯門碼頭"], "761P": ["元朗", "天逸"], "不載客": ["-"] };
const stationDB = [{id:1, zh:"屯門碼頭", r:["506P","507","507P","610","614","614P","615","615P"]}, {id:10, zh:"美樂", r:["506P","610","615","615P"]}, {id:15, zh:"蝴蝶", r:["506P","610","615","615P"]}, {id:20, zh:"輕鐵車廠", r:["506P","610","615","615P"]}, {id:30, zh:"龍門", r:["506P","610","615","615P"]}, {id:40, zh:"青山村", r:["506P","610","615","615P"]}, {id:50, zh:"青雲", r:["506P","610","615","615P"]}, {id:60, zh:"建安", r:["505","506P"]}, {id:70, zh:"河田", r:["507","751"]}, {id:75, zh:"蔡意橋", r:["507","751"]}, {id:80, zh:"澤豐", r:["610","751"]}, {id:90, zh:"屯門醫院", r:["610","751"]}, {id:100, zh:"兆康", r:["505","506P","507P","610","614","614P","615","615P","720"]}, {id:110, zh:"麒麟", r:["505","615P"]}, {id:120, zh:"青松", r:["505","507P","615","615P"]}, {id:130, zh:"建生", r:["505","507P","615","615P"]}, {id:140, zh:"田景", r:["505","507","507P","615","615P"]}, {id:150, zh:"良景", r:["505","507","615","615P"]}, {id:160, zh:"新圍", r:["505","507","615","615P"]}, {id:170, zh:"石排", r:["505","610","615","615P"]}, {id:180, zh:"山景 (北)", r:["505"]}, {id:190, zh:"山景 (南)", r:["505"]}, {id:200, zh:"鳴琴", r:["505","610","615","615P"]}, {id:212, zh:"大興 (北)", r:["507","610"]}, {id:220, zh:"大興 (南)", r:["507","610"]}, {id:230, zh:"銀圍", r:["507","610"]}, {id:240, zh:"兆禧", r:["507","614","614P"]}, {id:250, zh:"屯門泳池", r:["507","614","614P"]}, {id:260, zh:"豐景園", r:["507","614","614P"]}, {id:265, zh:"兆麟", r:["505","507","614","614P"]}, {id:270, zh:"安定", r:["505","507","614","614P","751"]}, {id:275, zh:"友愛", r:["751"]}, {id:280, zh:"市中心", r:["505","507","614","614P","751"]}, {id:295, zh:"屯門", r:["505","506P","507","751"]}, {id:300, zh:"杯渡", r:["506P","614","614P"]}, {id:310, zh:"何福堂", r:["506P","614","614P"]}, {id:320, zh:"新墟", r:["506P","614","614P"]}, {id:330, zh:"景峰", r:["506P","614","614P"]}, {id:340, zh:"鳳地", r:["506P","614","614P"]}, {id:350, zh:"藍地", r:["610","614","615","720","751"]}, {id:360, zh:"泥圍", r:["610","614","615","720","751"]}, {id:370, zh:"鍾屋村", r:["610","614","615","720","751"]}, {id:380, zh:"洪水橋", r:["610","614","615","720","751"]}, {id:390, zh:"塘坊村", r:["610","614","615","761P"]}, {id:400, zh:"屏山", r:["610","614","615","761P"]}, {id:425, zh:"坑尾村", r:["751","761P"]}, {id:430, zh:"天水圍", r:["705","706","751","751P"]}, {id:435, zh:"天慈", r:["705","706","751","751P"]}, {id:445, zh:"天耀", r:["705","706","720","761P"]}, {id:448, zh:"樂湖", r:["705","706","720","761P"]}, {id:450, zh:"天湖", r:["705","706","751","751P"]}, {id:455, zh:"銀座", r:["705","706","751","751P"]}, {id:460, zh:"天瑞", r:["705","706","720","761P"]}, {id:468, zh:"頌富", r:["705","706","751","751P"]}, {id:480, zh:"天富", r:["705","706","751","751P"]}, {id:490, zh:"翠湖", r:["720","751","751P"]}, {id:500, zh:"天榮", r:["705","706","751","751P","761P"]}, {id:510, zh:"天悅", r:["705","706"]}, {id:520, zh:"天秀", r:["705","706"]}, {id:530, zh:"濕地公園", r:["705","706"]}, {id:540, zh:"天恒", r:["705","706"]}, {id:550, zh:"天逸", r:["705","706","751","751P"]}, {id:560, zh:"水邊圍", r:["610","614","615","761P"]}, {id:570, zh:"豐年路", r:["610","614","615","761P"]}, {id:580, zh:"康樂路", r:["610","614","615","761P"]}, {id:590, zh:"大棠路", r:["610","614","615","761P"]}, {id:600, zh:"元朗", r:["610","614","615","761P"]}, {id:920, zh:"三聖", r:["505"]}];

window.customRteKey = null;
const specialTips = { "901": "到達兆康站後改為615前往屯門碼頭", "902": "到達兆康站後改為507P前往屯門碼頭", "903": "到達澤豐站後改為507前往屯門碼頭" };

function loginAdmin() {
    const pw = prompt("請輸入管理員密碼:");
    if(pw === "123") {
        window.isAdmin = true;
        alert("已開啟管理員模式");
        window.renderAll();
    }
}

function checkRunNo() {
    const runStr = document.getElementById('runNo').value;
    const run = parseInt(runStr);
    const box = document.getElementById('runSuggestion');
    if (specialTips[runStr]) {
        document.getElementById('suggestionText').innerText = `💡 ${specialTips[runStr]}`;
        box.style.display = 'block';
    } else { box.style.display = 'none'; }
    let autoRoute = null;
    if (run >= 1 && run <= 20) autoRoute = "505";
    else if (run >= 21 && run <= 40) autoRoute = "507";
    else if (run >= 51 && run <= 70) autoRoute = "610";
    else if (run >= 71 && run <= 90) autoRoute = "614";
    else if (run >= 201 && run <= 230) autoRoute = "614P";
    else if ((run >= 91 && run <= 100) || (run >= 191 && run <= 200)) autoRoute = "761P";
    else if (run >= 171 && run <= 187) autoRoute = "751";
    if (autoRoute) { document.getElementById('routeSelect').value = autoRoute; onRouteUpdate(); }
}

function applySuggestion() {
    const rno = document.getElementById('runNo').value;
    if (rno === "903") {
        document.getElementById('routeSelect').value = "751L";
        window.customRteKey = "751L";
        document.getElementById('directionSelect').innerHTML = `<option>屯門碼頭</option>`;
        document.getElementById('memo').value = specialTips[rno];
        const extraIds = [425, 380, 370, 350, 360, 100, 90, 80];
        const list = stationDB.filter(s => s.r.includes("751P") || extraIds.includes(s.id)).sort((a,b)=>a.id-b.id);
        document.getElementById('stationSelect').innerHTML = list.map(s => `<option value="${s.zh}">${s.id} ${s.zh}</option>`).join('');
        document.getElementById('runSuggestion').style.display = 'none';
    } else {
        const config = { "901": { r:"751P", k:"751x615" }, "902": { r:"751P", k:"751x507P" } }[rno];
        if (config) {
            document.getElementById('routeSelect').value = config.r;
            window.customRteKey = config.k;
            document.getElementById('memo').value = specialTips[rno];
            onRouteUpdate();
            document.getElementById('runSuggestion').style.display = 'none';
        }
    }
}

function onRouteUpdate() {
    const r = document.getElementById('routeSelect').value;
    document.getElementById('directionSelect').innerHTML = routeCfg[r].map(d => `<option>${d}</option>`).join('');
    const list = stationDB.filter(s => s.r.includes(r)).sort((a,b)=>a.id-b.id);
    document.getElementById('stationSelect').innerHTML = list.map(s => `<option value="${s.zh}">${s.id} ${s.zh}</option>`).join('');
}

function addReport() {
    const cid = document.getElementById('carId').value.trim(), rno = document.getElementById('runNo').value.trim();
    if(!cid || !rno) return alert("必填項目缺失");
    window.publishToFirebase(cid, {
        dRte: `${window.customRteKey || document.getElementById('routeSelect').value} 往 ${document.getElementById('directionSelect').value}`,
        rteKey: window.customRteKey || document.getElementById('routeSelect').value,
        loc: document.getElementById('stationSelect').value,
        mem: document.getElementById('memo').value,
        rno: rno.padStart(3, '0'),
        tStr: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12:false})
    });
}

window.renderAll = function() {
    const mList = document.getElementById('masterList');
    if(!mList) return;
    const compositionMap = {};
    Object.values(window.reportGroups).forEach(group => {
        group.traces.forEach(t => {
            const fid = t.fullId || group.carId;
            if (!compositionMap[fid]) compositionMap[fid] = [];
            if (!compositionMap[fid].some(exist => exist.timestamp === t.timestamp)) {
                compositionMap[fid].push(t);
            }
        });
    });
    const sortedComps = Object.keys(compositionMap).map(fid => ({
        fid: fid,
        traces: compositionMap[fid].sort((a,b) => b.timestamp - a.timestamp)
    })).sort((a,b) => b.traces[0].timestamp - a.traces[0].timestamp);

    const buildHTML = (comp) => {
        const latest = comp.traces[0];
        const hex = colorMap[latest.rteKey?.split('x')[0]] || "#333";
        const carLinks = comp.fid.split('-').map(c => `<span class="car-link" onclick="showCarHistory('${c}')">#${c}</span>`).join('-');
        const isFav = window.favorites.has(comp.fid);
        return `
        <div class="timeline-card" style="border-left-color:${hex}">
            <div class="timeline-header">
                <b class="car-group-title" style="color:${hex};">${carLinks}</b>
                <span onclick="toggleFav('${comp.fid}')" style="cursor:pointer; color:${isFav?'#f1c40f':'#ccc'}">★</span>
            </div>
            <div class="timeline-body">
                ${comp.traces.slice(0, 5).map((t, idx) => `
                    <div class="trace-item ${idx===0?'latest':''}">
                        <div style="display:flex; justify-content:space-between;">
                            <div><span class="run-no-badge">${t.rno}</span><span class="route-badge" style="background:${colorMap[t.rteKey?.split('x')[0]] || '#333'}">${t.dRte}</span><b> ${t.loc}</b></div>
                            <small>
                                ${t.tStr}
                                ${window.isAdmin ? `<span class="del-btn" onclick="deleteTrace('${comp.fid.split('-')[0]}', ${t.timestamp})">刪除</span>` : ''}
                            </small>
                        </div>
                        ${t.mem ? `<div style="color:orange; font-size:0.85em; margin-top:3px;">📝 ${t.mem}</div>` : ''}
                    </div>`).join('')}
            </div>
        </div>`;
    };
    mList.innerHTML = sortedComps.map(buildHTML).join('') || "暫無紀錄";
    document.getElementById('favList').innerHTML = (window.user ? sortedComps.filter(c => window.favorites.has(c.fid)).map(buildHTML).join('') : "<p style='text-align:center;color:grey;margin-top:20px;'>請先登入以查看收藏</p>") || "暫無收藏";
};

window.showCarHistory = (cid) => {
    window.currentDetailCarId = cid;
    document.getElementById('detailOverlay').style.display = 'block';
    document.getElementById('detailTitle').innerText = `#${cid} 歷史紀錄`;
    const traces = window.reportGroups[cid]?.traces || [];
    document.getElementById('detailList').innerHTML = traces.map(t => `
        <div class="trace-item">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <div style="color:#666; font-size:0.8em; margin-bottom:2px; font-family: Helvetica, Arial, sans-serif;">編組狀態：${t.fullId || cid}</div>
                    <b>[${t.rno}] ${t.dRte}</b><br>${t.loc} (${t.tStr})
                </div>
                ${window.isAdmin ? `<span class="del-btn" onclick="deleteTrace('${cid}', ${t.timestamp})">刪除</span>` : ''}
            </div>
        </div>`).join('');
};

window.closeDetail = () => { document.getElementById('detailOverlay').style.display = 'none'; window.currentDetailCarId = null; };
function switchTab(pid, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(pid).classList.add('active'); btn.classList.add('active');
}
window.onload = () => {
    const rs = document.getElementById('routeSelect');
    Object.keys(routeCfg).sort().forEach(r => rs.innerHTML += `<option value="${r}">${r}</option>`);
    onRouteUpdate();
};
</script>
</body>
</html>
