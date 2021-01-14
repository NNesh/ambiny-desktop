const { ipcRenderer, desktopCapturer } = require('electron');

if (!window.electronApi) {
    window.electronApi = {};
}

window.electronApi.sendUpdateColorsRequest = function(colors) {
    ipcRenderer.send('request-update-colors', colors);
};

window.electronApi.getPrimaryDisplayId = function() {
    return ipcRenderer.invoke('get-primary-screen-id');
}

window.electronApi.getScreenSources = function() {
    return desktopCapturer.getSources({
        types: ['screen'],
    });
}