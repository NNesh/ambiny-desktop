const { ipcRenderer, desktopCapturer } = require('electron');
const SerialPort = require('serialport');

function SerialPortProvider() {
    this.conn = null;
}

SerialPortProvider.prototype.open = function(portPath, options) {
    let self = this;
    return new Promise(function(resolve, reject) {
        if (self.conn && self.conn.isOpen) {
            reject('Please, close the last connection');
            return;
        }

        self.conn = new SerialPort(portPath, { ...options, autoOpen: false });
        self.conn.open(function(err) {
            if (err) {
                self.conn = null;
                reject(err);
                return;
            }

            resolve();
        });
    });
};

SerialPortProvider.prototype.isOpen = function() {
    return this.conn && this.conn.isOpen;
};

SerialPortProvider.prototype.close = function() {
    if (!this.conn) {
        return Promise.resolve();
    }

    const connection = this.conn;

    return new Promise(function(resolve, reject) {
        connection.close(function(error) {
            if (error) {
                reject(error);
            } else {
                this.conn = null;
                resolve();
            }
        });
    });
};

SerialPortProvider.prototype.send = function(data) {
    let self = this;
    return new Promise(function(resolve, reject) {
        if (!self.conn) {
            reject(new Error('No connection. Please, create it'));
            return;
        }

        self.conn.write(data, function(err) {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
};

SerialPortProvider.prototype.flush = function() {
    return new Promise((resolve, reject) => {
        this.conn.flush(function(err) {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

SerialPortProvider.prototype.list = function() {
    return SerialPort.list();
};

SerialPortProvider.prototype.on = function(event, callback) {
    this.conn.on(event, callback);
    return this;
}

if (!window.electronApi) {
    window.electronApi = {};
}

window.electronApi.SerialPortProvider = SerialPortProvider;

window.electronApi.getPrimaryDisplayId = function() {
    return ipcRenderer.invoke('get-primary-screen-id');
};

window.electronApi.getScreenSources = function() {
    return desktopCapturer.getSources({
        types: ['screen'],
    });
};
