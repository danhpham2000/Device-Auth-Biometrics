const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  triggerBiometric: () => ipcRenderer.invoke("trigger-biometric"),
});
