// src/main.js
const { app, BrowserWindow, net, ipcMain, protocol, session } = require('electron');
const isDev = process.env.NODE_ENV === 'development';
const path = require('node:path');
const axios = require('axios');
const argon2 = require('argon2');
const dns = require('dns');
const fsPromises = require('fs/promises');
const fs = require('fs');

// Add these constants after your existing API_URL constant
const USER_DATA_PATH = app.getPath('userData');
const IMAGES_DIR = path.join(USER_DATA_PATH, 'cached-images');
async function ensureImagesDirExists() {
  try {
    await fsPromises.access(IMAGES_DIR);
  } catch (error) {
    try {
      await fsPromises.mkdir(IMAGES_DIR, { recursive: true });
    } catch (mkdirError) {
      console.error('Error creating images directory:', mkdirError);
      throw mkdirError;
    }
  }
}

// Configuration
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:9000'
  : 'https://corvseller.com/apix/';

let mainWindow;
let networkCheckInterval;
// Enhanced network status checking
const checkNetworkStatus = async () => {
  try {
    const online = net.isOnline();
    if (!online) return false;

    // First check DNS
    const dnsLookupPromise = new Promise((resolve) => {
      dns.lookup('corvseller.appspot.com', (err) => {
        resolve(!err);
      });
    });

    const isDnsResolved = await dnsLookupPromise;
    if (!isDnsResolved) return false;

    // Then try to reach the server
    const checkServerPromise = new Promise((resolve) => {
      const request = net.request({
        method: 'HEAD',
        protocol: 'https:',
        hostname: 'corvseller.appspot.com',
        path: '/',
        timeout: 5000 // 5 seconds timeout
      });

      request.on('response', (response) => {
        resolve(response.statusCode >= 200 && response.statusCode < 400);
      });

      request.on('error', (error) => {
        console.error('Server check error:', error);
        resolve(false);
      });

      request.on('timeout', () => {
        request.abort();
        resolve(false);
      });

      request.end();
    });

    return await checkServerPromise;

  } catch (error) {
    console.error('Network status check error:', error);
    return false;
  }
};
const checkServerWithAxios = async () => {
  try {
    const response = await axios.head('https://corvseller.appspot.com', {
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 400
    });
    return true;
  } catch (error) {
    console.error('Axios server check error:', error);
    return false;
  }
};
function sendOnlineStatus(online) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('online-status-changed', online);
  }
}
// Password handling
ipcMain.handle('hash-password', async (event, password) => {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
});
ipcMain.handle('verify-password', async (event, hashedPassword, password) => {
  try {
    hashedPassword = hashedPassword.trim();
    if (!hashedPassword.startsWith('$argon2id$')) {
      throw new Error('Invalid hash format');
    }
    const isValid = await argon2.verify(hashedPassword, password);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
});

// Window creation
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      permissions: {
        media: true
      }
    },
  });
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  mainWindow.webContents.openDevTools();
  // Initialize network status checking
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
      // Try primary check method first
      let currentOnlineStatus = await checkNetworkStatus();
      
      // If primary method fails, try backup method
      if (!currentOnlineStatus) {
        currentOnlineStatus = await checkServerWithAxios();
      }

      if (currentOnlineStatus !== lastOnlineStatus) {
        sendOnlineStatus(currentOnlineStatus);
        lastOnlineStatus = currentOnlineStatus;
        
        console.log(`Network status changed to: ${currentOnlineStatus ? 'online' : 'offline'}`);
        
        // If status changes to offline, trigger immediate recheck after short delay
        if (!currentOnlineStatus) {
          setTimeout(async () => {
            const recheckStatus = await checkNetworkStatus() || await checkServerWithAxios();
            if (recheckStatus !== lastOnlineStatus) {
              sendOnlineStatus(recheckStatus);
              lastOnlineStatus = recheckStatus;
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Network check interval error:', error);
      sendOnlineStatus(false);
      lastOnlineStatus = false;
    }
  }, 3000);
};

// Add this function before createWindow()
async function installDevTools() {
  if (isDev) {
    try {
      const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer');
      await installExtension(VUEJS_DEVTOOLS);
      console.log('Vue DevTools installed successfully');
    } catch (e) {
      console.error('Vue DevTools failed to install:', e);
    }
  }
}

// Application setup
app.whenReady().then(async () => {
  try {
    // Install DevTools first
    await installDevTools();

    // Ensure images directory exists
    await ensureImagesDirExists();

    // Register custom protocol for local images
    protocol.registerFileProtocol('local-image', (request, callback) => {
      const filePath = request.url.replace('local-image://', '');
      callback({ path: path.join(IMAGES_DIR, filePath) });
    });

    // Existing camera permissions code
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media', 'camera'];
      callback(allowedPermissions.includes(permission));
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      const allowedPermissions = ['media', 'camera'];
      return allowedPermissions.includes(permission);
    });

    createWindow();
    // Development-specific window settings
    if (isDev && mainWindow) {
      mainWindow.webContents.openDevTools();
      
      // Optional: Add keyboard shortcut to reload app
      mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.key.toLowerCase() === 'r') {
          mainWindow.reload();
        }
      });
    }
    // Add these new IPC handlers
    ipcMain.handle('save-image-locally', async (event, imageUrl, fileName) => {
      try {
        const response = await axios({
          url: imageUrl,
          responseType: 'arraybuffer'
        });

        const filePath = path.join(IMAGES_DIR, fileName);
        await fsPromises.writeFile(filePath, response.data);
        
        return `local-image://${fileName}`;
      } catch (error) {
        console.error('Error saving image:', error);
        throw error;
      }
    });

    //   try {
    //     const filePath = path.join(IMAGES_DIR, fileName);
    //     await fsPromises.access(filePath);
    //     return `local-image://${fileName}`;
    //   } catch {
    //     return null;
    //   }
    // });

    // ipcMain.handle('get-all-local-images', async () => {
    //   try {
    //     const files = await fsPromises.readdir(IMAGES_DIR);
    //     return files.map(file => `local-image://${file}`);
    //   } catch (error) {
    //     console.error('Error getting local images:', error);
    //     return [];
    //   }
    // });

    // ipcMain.handle('remove-local-image', async (event, fileName) => {
    //   try {
    //     const filePath = path.join(IMAGES_DIR, fileName);
    //     await fsPromises.unlink(filePath);
    //     return true;
    //   } catch (error) {
    //     console.error('Error removing image:', error);
    //     return false;
    //   }
    // });

    // Your existing camera permission handlers
    ipcMain.handle('request-camera-permission', async () => {
      try {
        return await mainWindow.webContents.executeJavaScript(`
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => true)
            .catch(() => false)
        `);
      } catch (error) {
        console.error('Camera permission error:', error);
        return false;
      }
    });

    ipcMain.handle('check-camera-permission', async () => {
      try {
        return await mainWindow.webContents.executeJavaScript(`
          navigator.permissions.query({ name: 'camera' })
            .then(result => result.state)
        `);
      } catch (error) {
        console.error('Camera permission check error:', error);
        return 'denied';
      }
    });

    // Network status handlers
    ipcMain.handle('get-initial-online-status', async () => {
      return await checkNetworkStatus();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
});



// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.includes('corvseller.appspot.com')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Cleanup
app.on('window-all-closed', () => {
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
  }
});

// Security headers
app.on('web-contents-created', (event, contents) => {
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: blob: file: local-image: *;",
          "media-src 'self' blob:;",
          `connect-src 'self' ${API_URL} ${API_URL}/apix/ ws://localhost:24678 wss://localhost:24678;`,
          "font-src 'self' data: file: asset: fonts:;", // Updated this line
        ].join(' ')
      }
    });
  });
});



// app.on('web-contents-created', (event, contents) => {
//   contents.session.webRequest.onHeadersReceived((details, callback) => {
//     callback({
//       responseHeaders: {
//         ...details.responseHeaders,
//         'Content-Security-Policy': [
//           "default-src 'self';",
//           "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
//           "style-src 'self' 'unsafe-inline';",
//           "img-src 'self' data: blob: file: local-image: *;",
//           "media-src 'self' blob:;",
//           `connect-src 'self' ${API_URL} ${API_URL}/apix/;`,
//           "font-src 'self' data: asset: file:;", 
//         ].join(' ')
//       }
//     });
//   });
// });

// // src/main.js
// const { app, BrowserWindow, net, ipcMain, protocol, session } = require('electron');
// const path = require('node:path');
// const axios = require('axios');
// const argon2 = require('argon2');
// const dns = require('dns');
// // Configuration
// const API_URL = process.env.NODE_ENV === 'development' 
//   ? 'http://localhost:9000'
//   : 'https://corvseller.com/apix/';

// let mainWindow;
// let networkCheckInterval;
// // Enhanced network status checking
// const checkNetworkStatus = async () => {
//   try {
//     const online = net.isOnline();
//     if (!online) return false;

//     // First check DNS
//     const dnsLookupPromise = new Promise((resolve) => {
//       dns.lookup('corvseller.appspot.com', (err) => {
//         resolve(!err);
//       });
//     });

//     const isDnsResolved = await dnsLookupPromise;
//     if (!isDnsResolved) return false;

//     // Then try to reach the server
//     const checkServerPromise = new Promise((resolve) => {
//       const request = net.request({
//         method: 'HEAD',
//         protocol: 'https:',
//         hostname: 'corvseller.appspot.com',
//         path: '/',
//         timeout: 5000 // 5 seconds timeout
//       });

//       request.on('response', (response) => {
//         resolve(response.statusCode >= 200 && response.statusCode < 400);
//       });

//       request.on('error', (error) => {
//         console.error('Server check error:', error);
//         resolve(false);
//       });

//       request.on('timeout', () => {
//         request.abort();
//         resolve(false);
//       });

//       request.end();
//     });

//     return await checkServerPromise;

//   } catch (error) {
//     console.error('Network status check error:', error);
//     return false;
//   }
// };
// const checkServerWithAxios = async () => {
//   try {
//     const response = await axios.head('https://corvseller.appspot.com', {
//       timeout: 5000,
//       validateStatus: (status) => status >= 200 && status < 400
//     });
//     return true;
//   } catch (error) {
//     console.error('Axios server check error:', error);
//     return false;
//   }
// };
// function sendOnlineStatus(online) {
//   if (mainWindow && !mainWindow.isDestroyed()) {
//     mainWindow.webContents.send('online-status-changed', online);
//   }
// }
// // Password handling
// ipcMain.handle('hash-password', async (event, password) => {
//   try {
//     const hash = await argon2.hash(password);
//     return hash;
//   } catch (error) {
//     console.error('Error hashing password:', error);
//     throw error;
//   }
// });
// ipcMain.handle('verify-password', async (event, hashedPassword, password) => {
//   try {
//     hashedPassword = hashedPassword.trim();
//     if (!hashedPassword.startsWith('$argon2id$')) {
//       throw new Error('Invalid hash format');
//     }
//     const isValid = await argon2.verify(hashedPassword, password);
//     return isValid;
//   } catch (error) {
//     console.error('Error verifying password:', error);
//     throw error;
//   }
// });
// // Window creation
// const createWindow = () => {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true,
//       webSecurity: true,
//       permissions: {
//         media: true
//       }
//     },
//   });
//   if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//     mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
//   } else {
//     mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
//   }
//   mainWindow.webContents.openDevTools();
//   // Initialize network status checking
//   initializeNetworkChecking();
// };

// const initializeNetworkChecking = async () => {
//   let lastOnlineStatus = await checkNetworkStatus();
//   sendOnlineStatus(lastOnlineStatus);

//   if (networkCheckInterval) {
//     clearInterval(networkCheckInterval);
//   }

//   networkCheckInterval = setInterval(async () => {
//     try {
//       // Try primary check method first
//       let currentOnlineStatus = await checkNetworkStatus();
      
//       // If primary method fails, try backup method
//       if (!currentOnlineStatus) {
//         currentOnlineStatus = await checkServerWithAxios();
//       }

//       if (currentOnlineStatus !== lastOnlineStatus) {
//         sendOnlineStatus(currentOnlineStatus);
//         lastOnlineStatus = currentOnlineStatus;
        
//         console.log(`Network status changed to: ${currentOnlineStatus ? 'online' : 'offline'}`);
        
//         // If status changes to offline, trigger immediate recheck after short delay
//         if (!currentOnlineStatus) {
//           setTimeout(async () => {
//             const recheckStatus = await checkNetworkStatus() || await checkServerWithAxios();
//             if (recheckStatus !== lastOnlineStatus) {
//               sendOnlineStatus(recheckStatus);
//               lastOnlineStatus = recheckStatus;
//             }
//           }, 1000);
//         }
//       }
//     } catch (error) {
//       console.error('Network check interval error:', error);
//       sendOnlineStatus(false);
//       lastOnlineStatus = false;
//     }
//   }, 3000);
// };

// // Application setup
// app.whenReady().then(() => {
//   // Camera permissions
//   session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
//     const allowedPermissions = ['media', 'camera'];
//     callback(allowedPermissions.includes(permission));
//   });

//   session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
//     const allowedPermissions = ['media', 'camera'];
//     return allowedPermissions.includes(permission);
//   });

//   createWindow();

//   // Camera permission handlers
//   ipcMain.handle('request-camera-permission', async () => {
//     try {
//       return await mainWindow.webContents.executeJavaScript(`
//         navigator.mediaDevices.getUserMedia({ video: true })
//           .then(() => true)
//           .catch(() => false)
//       `);
//     } catch (error) {
//       console.error('Camera permission error:', error);
//       return false;
//     }
//   });

//   ipcMain.handle('check-camera-permission', async () => {
//     try {
//       return await mainWindow.webContents.executeJavaScript(`
//         navigator.permissions.query({ name: 'camera' })
//           .then(result => result.state)
//       `);
//     } catch (error) {
//       console.error('Camera permission check error:', error);
//       return 'denied';
//     }
//   });

//   // Network status handlers
//   ipcMain.handle('get-initial-online-status', async () => {
//     return await checkNetworkStatus();
//   });

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });
// });

// // Handle certificate errors
// app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
//   if (url.includes('corvseller.appspot.com')) {
//     event.preventDefault();
//     callback(true);
//   } else {
//     callback(false);
//   }
// });

// // Cleanup
// app.on('window-all-closed', () => {
//   if (networkCheckInterval) {
//     clearInterval(networkCheckInterval);
//   }
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('before-quit', () => {
//   if (networkCheckInterval) {
//     clearInterval(networkCheckInterval);
//   }
// });

// // Security headers
// app.on('web-contents-created', (event, contents) => {
//   contents.session.webRequest.onHeadersReceived((details, callback) => {
//     callback({
//       responseHeaders: {
//         ...details.responseHeaders,
//         'Content-Security-Policy': [
//           "default-src 'self';",
//           "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
//           "style-src 'self' 'unsafe-inline';",
//           "img-src 'self' data: blob: file: local-image: *;",
//           "media-src 'self' blob:;",
//           `connect-src 'self' ${API_URL} ${API_URL}/apix/;`,
//           "font-src 'self' data:;",
//         ].join(' ')
//       }
//     });
//   });
// });
