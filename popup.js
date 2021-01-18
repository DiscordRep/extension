let scanBtn = document.getElementById("scanButton")

scanBtn.onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0].url.startsWith('https://discord.com/channels/@me/')) {
            scanBtn.disabled = true
            scanBtn.innerHTML = "Nothing to Scan."
            scanBtn.style.backgroundColor = "red";
            return setTimeout(() => {
                scanBtn.disabled = false
                scanBtn.innerHTML = "Scan"
                scanBtn.style.backgroundColor = "#2a2d31";
            }, 1500);
        }
        scanBtn.innerHTML = "Refreshing..."
        chrome.tabs.reload(tabs[0].id)
        let stillWaiting = true
        chrome.tabs.onUpdated.addListener(function (tabId, info) {
            if (info.status === 'complete' && tabId == tabs[0].id && stillWaiting) {
                setTimeout(() => {
                    chrome.tabs.executeScript(tabs[0].id, { code: "let interval=setInterval(function(){if(document.readyState==='complete'){clearInterval(interval); setTimeout(() => {chrome.runtime.sendMessage({action: 'iWasRefreshed'})}, 3000);}},200);", runAt: 'document_end' })
                }, 500);
                stillWaiting = false
            }
        });
    });
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "iWasRefreshed") scan()
    }
);


function scan() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        scanBtn.disabled = true
        scanBtn.style.backgroundColor = "lightblue";
        scanBtn.style.color = "black";
        scanBtn.innerHTML = "Scanning..."
        chrome.tabs.sendMessage(tabs[0].id, { action: "scan" }, async function (response) {
            let css = await downloadCss(response.cssLink)
            var htmlCode = `<html><head><meta charset="UTF-8"><style>${css} body,html{background:#36393f;color: white;overflow:auto!important;}body{padding:20px}.drep-scanned {font-size:2rem;font-weight:700;text-align:center;color:#7289DA}</style></head><body><h1 class="drep-scanned">Scanned By <a style="color:#7289DA" href="https://discordrep.com">DiscordRep</a><br><small style="color:orangered;">Date of scan: ${new Date()}</small></h1><br><br>${response.output}</body></html>`
            scanBtn.style.backgroundColor = "lightgreen";
            scanBtn.innerHTML = "Uploading..."
            let uploadedTo = await uploadProof(htmlCode)
            let parsed = JSON.parse(uploadedTo)
            var url = `https://discordrep-paste.glitch.me/proof/${parsed.key}`
            chrome.tabs.create({ url: url })
            scanBtn.innerHTML = "Scan"
            scanBtn.style.backgroundColor = "#2a2d31";
            scanBtn.style.color = "white";
            scanBtn.disabled = false
        });
    });
}

function downloadCss(link) {
    return new Promise(function (resolve, reject) {
        var xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else { // for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.open("GET", link, true);
        xmlhttp.send();
        xmlhttp.onerror = function () {
            reject({
                status: this.status,
                statusText: xmlhttp.statusText
            });
        };
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                resolve(xmlhttp.responseText)
            }
        };
    })
}

function uploadProof(data) {
    return new Promise(function (resolve, reject) {
        var xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.open("POST", "https://discordrep-paste.glitch.me/documents", true);
        xmlhttp.withCredentials = false;
        xmlhttp.setRequestHeader('Accept', 'application/json');
        xmlhttp.send(data);
        xmlhttp.onerror = function () {
            reject({
                status: this.status,
                statusText: xmlhttp.statusText
            });
            scanBtn.innerHTML = "Failed."
            scanBtn.style.backgroundColor = "red";
        };
        xmlhttp.onreadystatechange = function () {
            console.log(xmlhttp)
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                resolve(xmlhttp.responseText)
            }
        };
    })
}