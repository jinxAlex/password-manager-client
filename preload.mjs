
import { contextBridge, ipcRenderer} from "electron";
import crypto from "crypto";

const ITERATIONS_PBKDF2 = 600000;
const keyLength = 32;
const digest = "sha256";

async function generateAuthKey(email, masterPassword, masterKey) {
  return new Promise((resolve, reject) => {
    const passwordBuffer = Buffer.from(String(masterPassword), "utf-8");
    const saltBuffer = Buffer.from(String(masterKey), "utf-8");
    
    crypto.pbkdf2(passwordBuffer, saltBuffer, ITERATIONS_PBKDF2, keyLength, digest, async (err, key) => {
      if (err) {
        console.error('Error al derivar la clave authKey:', err);
        return reject(err);
      }
      const authKey = key.toString("hex");

      try {
        await ipcRenderer.invoke("store-auth-key", email, authKey);
        resolve(authKey);
      } catch (error) {
        console.error("Error almacenando authKey:", error);
        reject(error);
      }
    });
  });
}

async function generateMasterKey(email, masterPassword) {
  return new Promise((resolve, reject) => {
    const saltBuffer = Buffer.from(String(email), "utf-8");
    const passwordBuffer = Buffer.from(String(masterPassword), "utf-8");
    
    crypto.pbkdf2(saltBuffer, passwordBuffer, ITERATIONS_PBKDF2, keyLength, digest, async (err, key) => {
      if (err) {
        console.error('Error al derivar la clave maestra:', err);
        return reject(err);
      }

      const masterKey = key.toString("hex");

      try {
        await ipcRenderer.invoke("store-master-key", email, masterKey);
        await generateAuthKey(email, masterPassword, masterKey);
        resolve();
      } catch (error) {
        console.error("Error almacenando authKey:", error);
        reject(error);
      }
    });
  });
}


async function decryptCredential(salt, encryptedData) {
  const masterKey = await ipcRenderer.invoke("get-master-key");
  console.log(masterKey)
  const masterKeyBuffer = Buffer.from(masterKey, 'hex');
  const iv = Buffer.from(salt, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", masterKeyBuffer, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function encryptCredential(data) {
  const masterkey = await ipcRenderer.invoke("get-master-key");
  const key = Buffer.from(masterkey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encryptedData: encrypted, iv: iv.toString('hex') }; 
}

contextBridge.exposeInMainWorld("api", {
  generateMasterKey: (email, masterKey) => generateMasterKey(email, masterKey),
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  changeView: (viewPath) => ipcRenderer.invoke("change-view", viewPath),
  showModal: (show) => ipcRenderer.invoke("show-modal", show),
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
  }
});