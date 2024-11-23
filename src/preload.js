// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  onOnlineStatusChange: (callback) => ipcRenderer.on('online-status-changed', (_, status) => callback(status)),
  getInitialOnlineStatus: () => ipcRenderer.invoke('get-initial-online-status'),
  hashPassword: (password) => ipcRenderer.invoke('hash-password', password),
  verifyPassword: (hashedPassword, password) => ipcRenderer.invoke('verify-password', hashedPassword, password),
    requestCameraPermission: () => ipcRenderer.invoke('request-camera-permission'),
    checkCameraPermission: () => ipcRenderer.invoke('check-camera-permission'),
  saveImageLocally: (imageUrl, fileName) => ipcRenderer.invoke('save-image-locally', imageUrl, fileName),
});
  // getLocalImage: (fileName) => ipcRenderer.invoke('get-local-image', fileName),
  // getAllLocalImages: () => ipcRenderer.invoke('get-all-local-images'),
  // removeLocalImage: (fileName) => ipcRenderer.invoke('remove-local-image', fileName),
// fetchImage: (url) => ipcRenderer.invoke('fetch-image', url),
// saveImage: (url, username) => ipcRenderer.invoke('save-image', { url, username }),