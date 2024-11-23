"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  onOnlineStatusChange: (callback) => ipcRenderer.on("online-status-changed", (_, status) => callback(status)),
  getInitialOnlineStatus: () => ipcRenderer.invoke("get-initial-online-status"),
  hashPassword: (password) => ipcRenderer.invoke("hash-password", password),
  verifyPassword: (hashedPassword, password) => ipcRenderer.invoke("verify-password", hashedPassword, password),
  requestCameraPermission: () => ipcRenderer.invoke("request-camera-permission"),
  checkCameraPermission: () => ipcRenderer.invoke("check-camera-permission"),
  saveImageLocally: (imageUrl, fileName) => ipcRenderer.invoke("save-image-locally", imageUrl, fileName)
});
