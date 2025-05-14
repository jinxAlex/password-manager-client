
import { contextBridge, ipcRenderer} from "electron";
import { generateMasterKey, encryptCredential, decryptCredential } from "./scripts/crypto.js";

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
  refreshVault: () => ipcRenderer.send("refresh-vault"),
  onRefreshVault: (callback) => {
    ipcRenderer.on("refresh-vault", (event) => {
      callback();
    });
  },
  //generatePasswordToCredential: () => ipcRenderer.send("generate-password-to-credential"),
  onGeneratePasswordToCredential: (callback) => {
    ipcRenderer.on("generate-password-to-credential", (event) => {
      callback();
    });
  },
  generatePassword: (data) => ipcRenderer.send("generated-password",data),
  onGeneratedPassword: (callback) => {
    ipcRenderer.on("generated-password", (event,payload) => {
      callback(payload);
    });
  },
  onShowOverlay: (callback) => {
    ipcRenderer.on("show-overlay", (event) => {
      callback();
    });
  },
  onDataSent: (callback) => {
    ipcRenderer.on("dataSent", (event, payload) =>{ 
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
  }
});