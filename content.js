function scan() {
    let output = ""
    document.querySelectorAll('div[class^="message-"]').forEach(tag => {
        output += tag.outerHTML
    })
    let cssLink = document.querySelector('link[rel="stylesheet"]').href;
    return { output, cssLink }
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "scan") sendResponse(scan())
    }
);