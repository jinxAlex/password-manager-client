import { contextBridge, ipcRenderer } from "electron";
import { generateMasterKey, encryptCredential, decryptCredential } from "./scripts/crypto.js";
import fs from 'fs';

contextBridge.exposeInMainWorld("api", {
  generateMasterKey: (email, masterKey) => generateMasterKey(email, masterKey),
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  changeView: (viewPath) => ipcRenderer.invoke("change-view", viewPath),
  showCredentialModal: (show, data) => ipcRenderer.invoke("show-credential-modal", show, data),
  storeMasterKey: (email, masterKey) => ipcRenderer.invoke("store-master-key", email, masterKey),
  storeAuthKey: (email, authKey) => ipcRenderer.invoke("store-auth-key", email, authKey),
  getMasterKey: () => ipcRenderer.invoke("get-master-key"),
  getAuthKey: () => ipcRenderer.invoke("get-auth-key"),
  getEmail: () => ipcRenderer.invoke("get-email"),
  decryptCredential: (salt, encryptedData) => decryptCredential(salt, encryptedData),
  encryptCredential: (data) => encryptCredential(data),
  showUtilitiesModal: (typeModal, show) => ipcRenderer.invoke("show-utilities-modal", typeModal, show),
  showErrorModal: (data) => ipcRenderer.invoke("show-error-alert", data),
  onShowErrorMessage: (callback) => {
    ipcRenderer.on('show-error-message', (event, payload) => callback(payload));
  },
  showSuccessModal: (data) => ipcRenderer.invoke("show-success-alert", data),
  onShowSuccessMessage: (callback) => {
    ipcRenderer.on('show-success-message', (event, payload) => callback(payload));
  },
  refreshVault: () => ipcRenderer.send("refresh-vault"),
  onRefreshVault: (callback) => {
    ipcRenderer.on("refresh-vault", (event) => {
      callback();
    });
  },
  showLoadingWindow: (data) => ipcRenderer.invoke("show-loading-window", data),
  //generatePasswordToCredential: () => ipcRenderer.send("generate-password-to-credential"),
  onGeneratePasswordToCredential: (callback) => {
    ipcRenderer.on("generate-password-to-credential", (event) => {
      callback();
    });
  },
  generatePassword: (data) => ipcRenderer.send("generated-password", data),
  onGeneratedPassword: (callback) => {
    ipcRenderer.on("generated-password", (event, payload) => {
      callback(payload);
    });
  },
  onShowOverlay: (callback) => {
    ipcRenderer.on("show-overlay", (event) => {
      callback();
    });
  },
  onDataSent: (callback) => {
    ipcRenderer.on("dataSent", (event, payload) => {
      callback(payload)
    });
  },
  saveFolder: (folderName) => {
    ipcRenderer.invoke("save-folder", folderName);
  },
  onSaveFolder: (callback) => {
    ipcRenderer.on('save-folder', (event, folderName) => {
      callback(folderName);
    });
  },
  sendFolders: (folderList) => {
    console.log("Se envian las carpetas:")
    console.log(folderList)
    ipcRenderer.invoke('send-folders', folderList);
  },
  onSendFolders: (callback) => {
    ipcRenderer.on('send-folders', (event, folderList) => {
      console.log("Se reciben las carpetas:")
      console.log(folderList)
      callback(folderList);
    });
  },
  obtainAllCredentials: async () => {
    ipcRenderer.invoke('obtain-credentials');
  },
  onObtainAllCredentials: (callback) => {
    ipcRenderer.on('obtain-credentials', (event) => {
      callback();
    });
  },
  exportCredentials: async (credentialList) => {
    ipcRenderer.invoke('export-credentials', credentialList);
  },
  onExportCredentials: (callback) => {
    ipcRenderer.on('export-credentials', (event, credentialList) => {
      console.log("Se reciben las credenciales:")
      console.log(credentialList)
      callback(credentialList);
    });
  },
  importJSON: async () => {
    const data = await ipcRenderer.invoke('show-open-dialog');
    return data;
  },
  exportJSON: async (payload) => {
    const filePath = await ipcRenderer.invoke('show-save-dialog')
    if (!filePath) return false
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
    return true
  }
});