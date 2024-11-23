"use strict";
const { app, BrowserWindow, net, ipcMain, protocol, session } = require("electron");
const isDev = process.env.NODE_ENV === "development";
const path = require("node:path");
const axios = require("axios");
const argon2 = require("argon2");
const dns = require("dns");
const fsPromises = require("fs/promises");
require("fs");
const USER_DATA_PATH = app.getPath("userData");
const IMAGES_DIR = path.join(USER_DATA_PATH, "cached-images");
async function ensureImagesDirExists() {
  try {
    await fsPromises.access(IMAGES_DIR);
  } catch (error) {
    try {
      await fsPromises.mkdir(IMAGES_DIR, { recursive: true });
    } catch (mkdirError) {
      console.error("Error creating images directory:", mkdirError);
      throw mkdirError;
    }
  }
}
const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:9000" : "https://corvseller.com/apix/";
let mainWindow;
let networkCheckInterval;
const checkNetworkStatus = async () => {
  try {
    const online = net.isOnline();
    if (!online) return false;
    const dnsLookupPromise = new Promise((resolve) => {
      dns.lookup("corvseller.appspot.com", (err) => {
        resolve(!err);
      });
    });
    const isDnsResolved = await dnsLookupPromise;
    if (!isDnsResolved) return false;
    const checkServerPromise = new Promise((resolve) => {
      const request = net.request({
        method: "HEAD",
        protocol: "https:",
        hostname: "corvseller.appspot.com",
        path: "/",
        timeout: 5e3
        // 5 seconds timeout
      });
      request.on("response", (response) => {
        resolve(response.statusCode >= 200 && response.statusCode < 400);
      });
      request.on("error", (error) => {
        console.error("Server check error:", error);
        resolve(false);
      });
      request.on("timeout", () => {
        request.abort();
        resolve(false);
      });
      request.end();
    });
    return await checkServerPromise;
  } catch (error) {
    console.error("Network status check error:", error);
    return false;
  }
};
const checkServerWithAxios = async () => {
  try {
    const response = await axios.head("https://corvseller.appspot.com", {
      timeout: 5e3,
      validateStatus: (status) => status >= 200 && status < 400
    });
    return true;
  } catch (error) {
    console.error("Axios server check error:", error);
    return false;
  }
};
function sendOnlineStatus(online) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("online-status-changed", online);
  }
}
ipcMain.handle("hash-password", async (event, password) => {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
});
ipcMain.handle("verify-password", async (event, hashedPassword, password) => {
  try {
    hashedPassword = hashedPassword.trim();
    if (!hashedPassword.startsWith("$argon2id$")) {
      throw new Error("Invalid hash format");
    }
    const isValid = await argon2.verify(hashedPassword, password);
    return isValid;
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
});
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      permissions: {
        media: true
      }
    }
  });
  {
    mainWindow.loadURL("http://localhost:3000");
  }
  mainWindow.webContents.openDevTools();
  initializeNetworkChecking();
};
const initializeNetworkChecking = async () => {
  let lastOnlineStatus = await checkNetworkStatus();
  sendOnlineStatus(lastOnlineStatus);
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
  }
  networkCheckInterval = setInterval(async () => {
    try {
      let currentOnlineStatus = await checkNetworkStatus();
      if (!currentOnlineStatus) {
        currentOnlineStatus = await checkServerWithAxios();
      }
      if (currentOnlineStatus !== lastOnlineStatus) {
        sendOnlineStatus(currentOnlineStatus);
        lastOnlineStatus = currentOnlineStatus;
        console.log(`Network status changed to: ${currentOnlineStatus ? "online" : "offline"}`);
        if (!currentOnlineStatus) {
          setTimeout(async () => {
            const recheckStatus = await checkNetworkStatus() || await checkServerWithAxios();
            if (recheckStatus !== lastOnlineStatus) {
              sendOnlineStatus(recheckStatus);
              lastOnlineStatus = recheckStatus;
            }
          }, 1e3);
        }
      }
    } catch (error) {
      console.error("Network check interval error:", error);
      sendOnlineStatus(false);
      lastOnlineStatus = false;
    }
  }, 3e3);
};
async function installDevTools() {
  if (isDev) {
    try {
      const { default: installExtension, VUEJS_DEVTOOLS } = require("electron-devtools-installer");
      await installExtension(VUEJS_DEVTOOLS);
      console.log("Vue DevTools installed successfully");
    } catch (e) {
      console.error("Vue DevTools failed to install:", e);
    }
  }
}
app.whenReady().then(async () => {
  try {
    await installDevTools();
    await ensureImagesDirExists();
    protocol.registerFileProtocol("local-image", (request, callback) => {
      const filePath = request.url.replace("local-image://", "");
      callback({ path: path.join(IMAGES_DIR, filePath) });
    });
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ["media", "camera"];
      callback(allowedPermissions.includes(permission));
    });
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      const allowedPermissions = ["media", "camera"];
      return allowedPermissions.includes(permission);
    });
    createWindow();
    if (isDev && mainWindow) {
      mainWindow.webContents.openDevTools();
      mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.control && input.key.toLowerCase() === "r") {
          mainWindow.reload();
        }
      });
    }
    ipcMain.handle("save-image-locally", async (event, imageUrl, fileName) => {
      try {
        const response = await axios({
          url: imageUrl,
          responseType: "arraybuffer"
        });
        const filePath = path.join(IMAGES_DIR, fileName);
        await fsPromises.writeFile(filePath, response.data);
        return `local-image://${fileName}`;
      } catch (error) {
        console.error("Error saving image:", error);
        throw error;
      }
    });
    ipcMain.handle("request-camera-permission", async () => {
      try {
        return await mainWindow.webContents.executeJavaScript(`
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => true)
            .catch(() => false)
        `);
      } catch (error) {
        console.error("Camera permission error:", error);
        return false;
      }
    });
    ipcMain.handle("check-camera-permission", async () => {
      try {
        return await mainWindow.webContents.executeJavaScript(`
          navigator.permissions.query({ name: 'camera' })
            .then(result => result.state)
        `);
      } catch (error) {
        console.error("Camera permission check error:", error);
        return "denied";
      }
    });
    ipcMain.handle("get-initial-online-status", async () => {
      return await checkNetworkStatus();
    });
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
});
app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
  if (url.includes("corvseller.appspot.com")) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
app.on("window-all-closed", () => {
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("before-quit", () => {
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
  }
});
app.on("web-contents-created", (event, contents) => {
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self';",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: blob: file: local-image: *;",
          "media-src 'self' blob:;",
          `connect-src 'self' ${API_URL} ${API_URL}/apix/ ws://localhost:24678 wss://localhost:24678;`,
          "font-src 'self' data: file: asset: fonts:;"
          // Updated this line
        ].join(" ")
      }
    });
  });
});
