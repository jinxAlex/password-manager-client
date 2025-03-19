const { contextBridge, ipcRenderer } = require("electron");
const crypto = require("crypto");

const iterations = 600000;
const keyLength = 32;
const digest = "sha256";

function generateHash(email, masterPassword) {
  ipcRenderer.invoke('store-master-password', email, masterPassword);
  const masterKey = crypto.pbkdf2Sync(masterPassword, email, iterations, keyLength, digest);
  const hash = masterKey.toString("hex");
  return hash;
}

contextBridge.exposeInMainWorld("api", {
  generateHash: (email, masterPassword) => generateHash(email, masterPassword),
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  changeView: (viewPath) => ipcRenderer.invoke("change-view", viewPath),
  storeMasterPassword: (email, masterPassword) => ipcRenderer.invoke("store-master-password", email, masterPassword)
});



