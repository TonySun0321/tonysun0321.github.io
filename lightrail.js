var station = Number(getUrlParameter('id')) || 260; // Default to station 260 if not specified
// --- ADVANCED MODE HANDLING WITH LOCALSTORAGE ---
function getAdvFromStorageOrUrl() {
    // Check URL parameter first
    const aParam = getUrlParameter('a');
    if (aParam === "1") {
        localStorage.setItem('a', '1'); // Save to localStorage if valid in URL
        return true;
    } else if (aParam === "0") {
        localStorage.setItem('a', '0');
        return false;
    }
    // If not in URL, check localStorage
    let advStored = localStorage.getItem('a');
    if (advStored === "1") {
        // Optionally, activate hidden info here if needed
        return true;
    }
    return false;
}

var adv = getAdvFromStorageOrUrl(); // adv is now a boolean
var response_json = "";
var result = "";
var ReloadDelay = 10000; // 10 seconds

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
    return undefined;
}

function GetStationName() {
    const stations = {
        // --- 第1收費區 (Fare Zone 1) ---
        "蝴蝶": 15, "Butterfly": 15,
        "豐景園": 260, "Goodview Garden": 260,
        "輕鐵車廠": 20, "Light Rail Depot": 20,
        "龍門": 30, "Lung Mun": 30,
        "美樂": 10, "Melody Garden": 10,
        "三聖": 920, "Sam Shing": 920,
        "兆禧": 240, "Siu Hei": 240,
        "兆麟": 265, "Siu Lun": 265,
        "屯門碼頭": 1, "Tuen Mun Ferry Pier": 1,
        "屯門泳池": 250, "Tuen Mun Swimming Pool": 250,

        // --- 第2收費區 (Fare Zone 2) ---
        "澤豐": 80, "Affluence": 80,
        "蔡意橋": 75, "Choy Yee Bridge": 75,
        "河田": 70, "Ho Tin": 70,
        "何福堂": 310, "Hoh Fuk Tong": 310,
        "建安": 60, "Kin On": 60,
        "鳴琴": 200, "Ming Kum": 200,
        "銀圍": 230, "Ngan Wai": 230,
        "安定": 270, "On Ting": 270,
        "景峰": 330, "Prime View": 330,
        "杯渡": 300, "Pui To": 300,
        "新墟": 320, "San Hui": 320,
        "山景（北）": 180, "Shan King (North)": 180,
        "山景（南）": 190, "Shan King (South)": 190,
        "石排": 170, "Shek Pai": 170,
        "大興（北）": 212, "Tai Hing (North)": 212,
        "大興（南）": 220, "Tai Hing (South)": 220,
        "市中心": 280, "Town Centre": 280,
        "青山村": 40, "Tsing Shan Tsuen": 40,
        "青雲": 50, "Tsing Wun": 50,
        "屯門": 295, "Tuen Mun": 295,
        "友愛": 275, "Yau Oi": 275,

        // --- 第3收費區 (Fare Zone 3) ---
        "青松": 120, "Ching Chung": 120,
        "鍾屋村": 370, "Chung Uk Tsuen": 370,
        "鳳地": 340, "Fung Tei": 340,
        "麒麟": 110, "Kei Lun": 110,
        "建生": 130, "Kin Sang": 130,
        "藍地": 350, "Lam Tei": 350,
        "良景": 150, "Leung King": 150,
        "泥圍": 360, "Nai Wai": 360,
        "新圍": 160, "San Wai": 160,
        "兆康": 100, "Siu Hong": 100,
        "田景": 140, "Tin King": 140,
        "屯門醫院": 90, "Tuen Mun Hospital": 90,

        // --- 第4收費區 (Fare Zone 4) ---
        "翠湖": 490, "Chestwood": 490,
        "銀座": 455, "Ginza": 455,
        "坑尾村": 425, "Hang Mei Tsuen": 425,
        "洪水橋": 380, "Hung Shui Kiu": 380,
        "樂湖": 448, "Locwood": 448,
        "屏山": 400, "Ping Shan": 400,
        "天瑞": 460, "Tin Shui": 460,
        "天水圍": 430, "Tin Shui Wai": 430,
        "天慈": 435, "Tin Tsz": 435,
        "天榮": 500, "Tin Wing": 500,
        "天湖": 450, "Tin Wu": 450,
        "天耀": 445, "Tin Yiu": 445,
        "塘坊村": 390, "Tong Fong Tsuen": 390,

        // --- 第5收費區 (Fare Zone 5) ---
        "豐年路": 570, "Fung Nin Road": 570,
        "康樂路": 580, "Hong Lok Road": 580,
        "水邊圍": 560, "Shui Pin Wai": 560,
        "大棠路": 590, "Tai Tong Road": 590,
        "元朗": 600, "Yuen Long": 600,

        // --- 第5A收費區 (Fare Zone 5A) ---
        "頌富": 468, "Chung Fu": 468,
        "天富": 480, "Tin Fu": 480,
        "天恆": 540, "Tin Heng": 540,
        "天秀": 520, "Tin Sau": 520,
        "天逸": 550, "Tin Yat": 550,
        "天悅": 510, "Tin Yuet": 510,
        "濕地公園": 530, "Wetland Park": 530
    };


    return {
        getStationNumber: (name) => stations[name] || "Station not found",
        getStationNames: (number) => {
            const names = Object.keys(stations).filter(key => stations[key] === number);
            return names.length > 0 ? names : ["Station number not found"];
        }
    };
}

window.GetETA = GetETA;

function getSelectedStation() {
    var stationSelect = document.getElementById('station');
    if (!stationSelect) return station; // fallback to global station
    return parseInt(stationSelect.value);
}

function decodeJson(data) {
    response_json = JSON.stringify(data, null, 2);
    console.log("Extracted JSON Text:");
    console.log(response_json);
    return data;
}

function formatSchedule(data) {
    if (!data || !data.platform_list)
        return;

    result = ""; // Clear previous results
    document.getElementById('StaIntro').innerHTML =
        `<p>車站:  ${GetStationName().getStationNames(station).join("/")}  <br>
        ${data.system_time}</p>`;

    data.platform_list.forEach(function (platform) {
        let flexResult = `<div class="flex">`;
        flexResult += `<p style="font-size:1.6em;font-weight:bold;" class="platform-title">${platform.platform_id} 號月台:</p>`;
        flexResult += `<table style="table-layout:fixed;width:100%;">`;
        if (adv) {
            flexResult += `
                <tr style="height:0%">
                    <th style="width:12%;"></th>
                    <th style="width:25%;"></th>
                    <th style="width:15%;"></th>
                    <th style="width:20%;"></th>
                    <th style="width:18%;"></th>
                </tr>
            `;
        } else {
            flexResult += `
                <tr>
                    <th style="width:12%;"></th>
                    <th style="width:38%;"></th>
                    <th style="width:20%;"></th>
                    <th style="width:30%;"></th>
                </tr>
            `;
        }
        if (platform.route_list && platform.route_list.length > 0) {
            platform.route_list.forEach(function (route) {
                if (route.stop) {
                    flexResult +=
                        `
                            <tr>
                                <td style="width:12%;padding:0.2em;">${route.route_no}</td>
                                <td style="width:38%;padding:0.2em;">此路線暫停服務</td>
                                <td style="width:30%;padding:0.2em;">N/A</td>
                                <td style="width:20%;padding:0.2em;">N/A</td>
                            </tr>
                        `;
                } else {
                    let targetPhoto = "";
                    if (route.train_length === 1) {
                        targetPhoto = "LightRailIcon.svg";
                    } else if (route.train_length === 2) {
                        targetPhoto = "LightRailIcon2.svg";
                    }
                    if (adv) {
                        flexResult +=
                            `
                                <tr>
                                    <td style="width:7%;padding:0.2em;font-size:90%;">${route.route_no}</td>
                                    <td style="width:20%;padding:0.2em;font-size:90%;">${route.dest_ch}</td>
                                    <td style="width:33%;padding:0.2em;font-size:90%;">${route.time_ch}</td>
                                    <td style="width:25%;padding:0.2em;"><img src="${targetPhoto}" style="height:2vh;"></td>
                                    <td style="width:15%;padding:0.2em;font-size:90%;">${route.trip_no}</td>
                                </tr>
                            `;
                    } else {
                        flexResult +=
                            `
                                <tr>
                                    <td style="width:12%;padding:0.2em;">${route.route_no}</td>
                                    <td style="width:38%;padding:0.2em;">${route.dest_ch}</td>
                                    <td style="width:30%;padding:0.2em;">${route.time_ch}</td>
                                    <td style="width:20%;padding:0.2em;"><img src="${targetPhoto}" style="height:2vh;"></td>
                                </tr>
                            `;
                    }
                }
            });
        } else {
            flexResult += '<tr><th colspan="4">是日列車服務已經中止</th></tr>';
        }
        flexResult += `</table>
        </div>`;
        result += flexResult;
    });

    document.getElementById('text').innerHTML = result;
}

function GetETA(station_id) {
    station = station_id || getSelectedStation() || station;
    if (station < 0) {
        console.error("Invalid station ID");
        return;
    }
    console.log("Fetching ETA for station ID: ".concat(station));
    result = "";

    fetch(`https://lrtapi.lightcatcube.com/api/schedule?station_id=${station}`)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Couldn't fetch API!!");
            }
            return response.json();
        })
        .then(function (data) {
            let decodedData = decodeJson(data);
            formatSchedule(decodedData);
        })
        .catch(function (error) { console.error(error); });
}

function ScheduleFormatList(stationArray, destArray, route_num) { //not used
    result = "";
    let orderedResults = {};

    let fetchPromises = stationArray.map(station_id =>
        fetch(`https://lrtapi.lightcatcube.com/api/schedule?station_id=${station_id}`)
            .then(response => {
                if (!response.ok) throw new Error("Couldn't fetch API!");
                return response.json();
            })
            .then(data => {
                let decodedData = decodeJson(data);
                let stationName = GetStationName().getStationNames(station_id).join("/");
                let groupedRoutes = {};

                decodedData.platform_list.forEach(platform => {
                    platform.route_list.forEach(route => {
                        if (route.route_no === String(route_num) && destArray.includes(route.dest_ch)) {
                            if (!groupedRoutes[route.dest_ch]) {
                                groupedRoutes[route.dest_ch] = `${route.route_no} // ${route.dest_ch} //`;
                            }
                            groupedRoutes[route.dest_ch] += ` ${route.time_ch} (${route.train_length}卡) ||`;
                        }
                    });
                });

                orderedResults[station_id] = groupedRoutes && Object.keys(groupedRoutes).length > 0
                    ? `**車站: ${stationName}**<br>` + Object.values(groupedRoutes).map(routeLine => routeLine.slice(0, -2)).join("<br>") + "<br>"
                    : `**車站: ${stationName}**<br>沒有可用的列車信息<br>`;
            })
            .catch(error => console.error(error))
    );

    Promise.all(fetchPromises).then(() => {
        stationArray.forEach(station_id => {
            if (orderedResults[station_id]) {
                result += orderedResults[station_id];
            }
        });
        document.getElementById('text').innerHTML = result;
    });
}

// Populate line select dropdown for current station
async function populateLineSelect(currentStationID) {
    const data = await loadLRStations();
    const lines = data.lines.filter(line =>
        line.stationIDs && line.stationIDs.includes(String(currentStationID))
    );
    const select = document.getElementById('LineSelect');
    select.innerHTML = '';
    lines.forEach(line => {
        const name = line.name || `Line ${line.ID}`;
        const option = document.createElement('option');
        option.value = line.ID;
        option.textContent = name;
        select.appendChild(option);
    });
    if (lines.length === 0) {
        const option = document.createElement('option');
        option.textContent = '此站沒有路線';
        option.disabled = true;
        select.appendChild(option);
    }

    // --- Keep the line selected from the URL ---
    const params = new URLSearchParams(window.location.search);
    const lineID = params.get('line');
    if (lineID && select.querySelector(`option[value="${lineID}"]`)) {
        select.value = lineID;
    }
}

window.onload = function () {
    GetETA(station);
    ReloadDelay = 10000;
    setInterval(() => GetETA(station), ReloadDelay);

    populateLineSelect(station);

    // Station input button logic
    const stationInput = document.getElementById('station_id_input');
    const stationBtn = document.getElementById('StationUpdate');
    if (stationInput && stationBtn) {
        stationBtn.onclick = function () {
            const newStation = parseInt(stationInput.value, 10);
            if (!isNaN(newStation) && newStation > 0) {
                const params = new URLSearchParams(window.location.search);
                params.set('id', newStation);
                if (adv) {
                    params.set('a', '1');
                    localStorage.setItem('a', '1');
                } else {
                    params.delete('a');
                    localStorage.removeItem('a');
                }
                window.location.search = params.toString();
            } else {
                alert("Please enter a valid station ID.");
            }
        };
    }

    // Button event listeners (move these inside window.onload)
    document.getElementById('NearestStationBtn').onclick = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                lockToNearestStation(pos.coords.latitude, pos.coords.longitude);
            }, function() {
                alert('無法取得您的位置');
            });
        } else {
            alert('您的瀏覽器不支援定位功能');
        }
    };

    document.getElementById('NextStationBtn').onclick = async function() {
        const currentStationID = station;
        const lineID = document.getElementById('LineSelect').value;
        const nextStation = await getAdjacentStation(currentStationID, lineID, 'next');
        if (nextStation) {
            // Update URL with both station and line
            const params = new URLSearchParams(window.location.search);
            params.set('id', nextStation.ID);
            params.set('line', lineID);
            window.location.search = params.toString();
        } else {
            alert('已到達終點站');
        }
    };

    document.getElementById('PrevStationBtn').onclick = async function() {
        const currentStationID = station;
        const lineID = document.getElementById('LineSelect').value;
        const prevStation = await getAdjacentStation(currentStationID, lineID, 'prev');
        if (prevStation) {
            // Update URL with both station and line
            const params = new URLSearchParams(window.location.search);
            params.set('id', prevStation.ID);
            params.set('line', lineID);
            window.location.search = params.toString();
        } else {
            alert('已到達起點站');
        }
    };

    document.getElementById('ShowAdjacentStationsBtn').onclick = async function() {
        const currentStationID = station;
        const lineID = document.getElementById('LineSelect').value;
        const adj = await listAdjacentStations(currentStationID, lineID);

        let msg = '';
        msg += '上一站列表:<br>' + adj.prev.map(st => `${st.nameTC} (${st.nameEN})`).join(' → ') + '<br>';
        msg += '下一站列表:<br>' + adj.next.map(st => `${st.nameTC} (${st.nameEN})`).join(' → ');

        document.getElementById('AdjacentStationsText').innerHTML = msg;
    };
};

// Optionally, allow toggling adv and saving to localStorage elsewhere in your code if needed

// Helper: Calculate distance between two lat/lng points (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Find nearest station from LRStations.json
async function lockToNearestStation(userLat, userLon) {
    const res = await fetch('LRStations.json');
    const data = await res.json();
    let nearest = null, minDist = Infinity;
    data.stations.forEach(st => {
        const [lat, lon] = st.coordinate.split(',').map(Number);
        const dist = getDistance(userLat, userLon, lat, lon);
        if (dist < minDist) {
            minDist = dist;
            nearest = st;
        }
    });
    if (nearest) {
        // Jump to nearest station by updating URL and reloading
        const params = new URLSearchParams(window.location.search);
        params.set('id', nearest.ID);
        window.location.search = params.toString();
    }
}

// Next/Previous station on a line
async function getAdjacentStation(currentStationID, lineID, direction = 'next') {
    const res = await fetch('LRStations.json');
    const data = await res.json();
    const line = data.lines.find(l => l.ID === lineID);
    if (!line) return null;
    const idx = line.stationIDs.indexOf(String(currentStationID));
    if (idx === -1) return null;
    let adjIdx = direction === 'next' ? idx + 1 : idx - 1;
    if (adjIdx < 0 || adjIdx >= line.stationIDs.length) return null;
    const adjID = line.stationIDs[adjIdx];
    return data.stations.find(st => st.ID === adjID);
}

// Utility: Load LRStations.json and cache it
let LRStationsData = null;
async function loadLRStations() {
    if (LRStationsData) return LRStationsData;
    const res = await fetch('LRStations.json');
    LRStationsData = await res.json();
    return LRStationsData;
}

// List all next/previous stations for a given station and line
async function listAdjacentStations(currentStationID, lineID) {
    const data = await loadLRStations();
    const line = data.lines.find(l => l.ID === lineID);
    if (!line) return { prev: [], next: [] };

    const idx = line.stationIDs.indexOf(String(currentStationID));
    if (idx === -1) return { prev: [], next: [] };

    // Previous stations (from start to current-1)
    const prevIDs = line.stationIDs.slice(0, idx);
    // Next stations (from current+1 to end)
    const nextIDs = line.stationIDs.slice(idx + 1);

    const prevStations = prevIDs.map(id => data.stations.find(st => st.ID === id)).filter(Boolean);
    const nextStations = nextIDs.map(id => data.stations.find(st => st.ID === id)).filter(Boolean);

    return {
        prev: prevStations,
        next: nextStations
    };
}

// Example usage: List all next/previous stations for current station and line
async function showAdjacentStations() {
    const currentStationID = station;
    const lineID = '505'; // You may want to get this dynamically
    const adj = await listAdjacentStations(currentStationID, lineID);

    let msg = '';
    msg += '上一站列表:<br>' + adj.prev.map(st => `${st.nameTC} (${st.nameEN})`).join(' → ') + '<br>';
    msg += '下一站列表:<br>' + adj.next.map(st => `${st.nameTC} (${st.nameEN})`).join(' → ');

    document.getElementById('AdjacentStationsText').innerHTML = msg;
}

// Example usage for nearest station button
document.getElementById('NearestStationBtn').onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            lockToNearestStation(pos.coords.latitude, pos.coords.longitude);
        }, function() {
            alert('無法取得您的位置');
        });
    } else {
        alert('您的瀏覽器不支援定位功能');
    }
};

// Example usage for next/previous station button
document.getElementById('NextStationBtn').onclick = async function() {
    const currentStationID = station;
    const lineID = '507'; // You may want to get this dynamically
    const nextStation = await getAdjacentStation(currentStationID, lineID, 'next');
    if (nextStation) {
        GetETA(Number(nextStation.ID));
        alert(`下一站: ${nextStation.nameTC} (${nextStation.nameEN})`);
    } else {
        alert('已到達終點站');
    }
};

document.getElementById('PrevStationBtn').onclick = async function() {
    const currentStationID = station;
    const lineID = '507'; // You may want to get this dynamically
    const prevStation = await getAdjacentStation(currentStationID, lineID, 'prev');
    if (prevStation) {
        // Jump to previous station by updating URL and reloading
        const params = new URLSearchParams(window.location.search);
        params.set('id', prevStation.ID);
        window.location.search = params.toString();
    } else {
        alert('已到達起點站');
    }
};

// Add a button and a div in your HTML:
// <button id="ShowAdjacentStationsBtn">顯示前後車站列表</button>
// <div id="AdjacentStationsText"></div>

document.getElementById('ShowAdjacentStationsBtn').onclick = showAdjacentStations;