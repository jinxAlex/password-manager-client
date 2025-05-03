
import { contextBridge, ipcRenderer} from "electron";
import { generateMasterKey, encryptCredential, decryptCredential } from "./scripts/crypto.js";

contextBridge.exposeInMainWorld("api", {
  generateMasterKey: (email, masterKey) => generateMasterKey(email, masterKey),
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  changeView: (viewPath) => ipcRenderer.invoke("change-view", viewPath),
  showModal: (show, data) => ipcRenderer.invoke("show-modal", show, data),
  storeMasterKey: (email, masterKey) => ipcRenderer.invoke("store-master-key", email, masterKey),
  storeAuthKey: (email, authKey) => ipcRenderer.invoke("store-auth-key", email, authKey),
  getMasterKey: () => ipcRenderer.invoke("get-master-key"),
  getAuthKey: () => ipcRenderer.invoke("get-auth-key"),
  getEmail: () => ipcRenderer.invoke("get-email"),
  decryptCredential: (salt, encryptedData) => decryptCredential(salt, encryptedData),
  encryptCredential: (data) => encryptCredential(data),
  refreshVault: () => ipcRenderer.send("refresh-vault"),
  onRefreshVault: (callback) => {
    ipcRenderer.on("refresh-vault", (event) => {
      callback();
    });
  },
  onDataSent: (callback) => {
    ipcRenderer.on('dataSent', (event, payload) =>{ 
      callback(payload)
    });
  }
});