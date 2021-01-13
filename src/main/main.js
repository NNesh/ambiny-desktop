const { app, BrowserWindow, Tray, Menu, protocol, screen, ipcMain } = require('electron');
const path = require('path');

const APP_PROTOCOL = 'ambinight';
const APP_SCHEMA = `${APP_PROTOCOL}://`;

const isDev = process.env.NODE_ENV === 'development';

const trayIcon = 'icon64x64.png';
let appTray,
    mainWindow,
    appWillClose = false;

function createWindow() {
  const openScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const windowWidth = openScreen.bounds.width * 0.75;
  const windowHeight = openScreen.bounds.height * 0.75;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor(openScreen.bounds.x + openScreen.bounds.width / 2 - windowWidth / 2),
    y: Math.floor(openScreen.bounds.y + openScreen.bounds.height / 2 - windowHeight / 2),
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      nodeIntegrationInWorker: false,
    },
  });

  if (!isDev) {
    mainWindow.setMenu(null);
  }
  
  mainWindow.on('close', function(ev) {
    if (appWillClose) {
      return;
    }
  
    ev.preventDefault();
    mainWindow.hide();
  });

  mainWindow.loadURL(isDev ? 'http://localhost:8080/' : `${APP_SCHEMA}/index.html`);
}

function prepareApp() {
  protocol.registerFileProtocol(APP_PROTOCOL, function (request, callback) {
    const { groups: url } = /^(?<protocol>[-\w]+):\/\/\/(?<path>.*)$/.exec(request.url) || {};
    callback({
      path: path.resolve(__dirname, url.path),
    });
  });

  if (!app.requestSingleInstanceLock()) {
    app.exit();
    return false;
  }

  appTray = new Tray(path.resolve(__dirname, 'images', trayIcon));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open window',
      click: function() {
        mainWindow.show();
      },
    },
    {
      label: 'Exit',
      click: function() {
        app.quit();
      },
    },
  ]);
  appTray.setContextMenu(contextMenu);
  appTray.on('click', function() {
    mainWindow.show();
  });

  ipcMain.handle('get-primary-screen-id', function() {
    return screen.getPrimaryDisplay().id;
  });

  return true;
}

app.whenReady().then(() => {
  const prepared = prepareApp();

  if (!prepared) {
    return;
  }

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', function() {
  appWillClose = true;
});