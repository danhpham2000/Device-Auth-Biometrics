const { app, BrowserWindow, ipcMain, systemPreferences } = require("electron");

let mainWindow;
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Prevent security risks
      contextIsolation: true, // Required for `preload.js`
      preload: __dirname + "/preload.js",
    },
  });

  mainWindow.loadURL("http://localhost:3000"); // Adjust for React app
});

// Handle biometric authentication in the main process
ipcMain.handle("trigger-biometric", async () => {
  try {
    const success = await systemPreferences.promptTouchID(
      "Authenticate using Touch ID"
    );
    return success;
  } catch (error) {
    return { error: error.message };
  }
});
