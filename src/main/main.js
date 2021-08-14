import { parseLocale } from '@shared/helpers/locales';
import { en, ru } from '@shared/i18n';
import { app, BrowserWindow, Tray, Menu, protocol, screen, ipcMain } from 'electron';
import path from 'path';


const LANGS_MESSAGES = {
  en,
  ru,
};

const APP_PROTOCOL = 'ambinight';
const APP_SCHEMA = `${APP_PROTOCOL}://`;

const isDev = process.env.NODE_ENV === 'development';

const trayIcon = 'icon64x64.png';
const windowIcon = 'icon64x64.png';
let appTray,
    mainWindow,
    appWillClose = false;

let lang_messages = LANGS_MESSAGES['en'];


function trayOpenWindow() {
  if (mainWindow && (!mainWindow.isVisible() || !mainWindow.isFocused())) {
    mainWindow.show();
  }
}

function createWindow() {
  const openScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const windowWidth = openScreen.bounds.width * 0.75;
  const windowHeight = openScreen.bounds.height * 0.75;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor(openScreen.bounds.x + openScreen.bounds.width / 2 - windowWidth / 2),
    y: Math.floor(openScreen.bounds.y + openScreen.bounds.height / 2 - windowHeight / 2),
    icon: path.resolve(__dirname, 'images', windowIcon),
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      nodeIntegrationInWorker: false,
    },
  });

  console.log(path.resolve(__dirname, 'preload.js'));

  // if (!isDev) {
  //   mainWindow.setMenu(null);
  // }
  mainWindow.webContents.openDevTools()
  
  mainWindow.on('close', function(ev) {
    if (appWillClose) {
      return;
    }
  
    ev.preventDefault();
    mainWindow.hide();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080/');
  } else {
    mainWindow.loadFile('index.html');
  }
}

function prepareApp() {
  app.allowRendererProcessReuse = false;
  app.commandLine.appendSwitch("disable-background-timer-throttling");

  protocol.registerFileProtocol(APP_PROTOCOL, function (request, callback) {
    const { groups: url } = /^(?<protocol>[-\w]+):\/\/(?<path>.*)$/.exec(request.url) || {};
    callback({
      path: path.resolve(__dirname, url.path),
    });
  });

  if (!app.requestSingleInstanceLock()) {
    app.exit();
    return false;
  }

  const lang = parseLocale(app.getLocale());
  lang_messages = LANGS_MESSAGES[lang] || LANGS_MESSAGES['en'];

  appTray = new Tray(path.resolve(__dirname, 'images', trayIcon));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: lang_messages['open-window'] || 'Open window',
      click: trayOpenWindow,
    },
    {
      label: lang_messages['exit'] || 'Exit',
      click: function() {
        app.quit();
      },
    },
  ]);
  appTray.setContextMenu(contextMenu);
  appTray.on('click', trayOpenWindow);

  ipcMain.handle('get-primary-screen-id', function() {
    return screen.getPrimaryDisplay().id;
  });

  ipcMain.on('request-update-colors', function(ev, colors) {
    console.log('COLORS:', colors.length, colors[0]);
  });

  return true;
}

if (!isDev) {
  protocol.registerSchemesAsPrivileged([
    { scheme: APP_PROTOCOL, privileges: { secure: true, stream: true, standard: true } }
  ]);
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