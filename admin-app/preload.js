const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  on(channel, listener) {
    const subscription = (event, ...args) => listener(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  removeAllListeners(channel) {
    ipcRenderer.removeAllListeners(channel);
  }
});

console.log('Preload script loaded - IPC bridge ready');

