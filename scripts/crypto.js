/**
 * @file crypto.js
 * @description Funciones criptográficas para BlackVault. Maneja la generación y almacenamiento de claves maestras y de autenticación, así como el cifrado y descifrado de credenciales.
 * @module crypto
 * @requires electron
 * @requires crypto
 */

/* Importa el módulo ipcRenderer de Electron para la comunicación entre procesos y el módulo crypto para operaciones criptográficas. */
import { ipcRenderer } from "electron";
import crypto from "crypto";

/** Número de iteraciones para PBKDF2. */
const ITERATIONS_PBKDF2 = 600000;
/** Longitud de la clave derivada en bytes. */
const keyLength = 32;
/** Algoritmo de hash utilizado para PBKDF2. */
const digest = "sha256";

/**
 * Genera y almacena la clave de autenticación (authKey) derivada de la contraseña maestra y la clave maestra.
 * @memberof module:crypto
 * @async
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} masterPassword - Contraseña maestra del usuario.
 * @param {string} masterKey - Clave maestra derivada.
 * @returns {Promise<string>} La clave de autenticación generada en formato hexadecimal.
 */
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

/**
 * Genera y almacena la clave maestra (masterKey) derivada del correo y la contraseña maestra.
 * También genera y almacena la clave de autenticación.
 * @memberof module:crypto
 * @async
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} masterPassword - Contraseña maestra del usuario.
 * @returns {Promise<void>}
 */
export async function generateMasterKey(email, masterPassword) {
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

/**
 * Descifra una credencial utilizando la clave maestra almacenada y el IV proporcionado.
 * @memberof module:crypto
 * @async
 * @param {string} salt - IV en formato hexadecimal.
 * @param {string} encryptedData - Datos cifrados en formato hexadecimal.
 * @returns {Promise<string>} Datos descifrados en texto plano.
 */
export async function decryptCredential(salt, encryptedData) {
  const masterKey = await ipcRenderer.invoke("get-master-key");
  console.log(masterKey)
  const masterKeyBuffer = Buffer.from(masterKey, 'hex');
  const iv = Buffer.from(salt, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", masterKeyBuffer, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Cifra una credencial utilizando la clave maestra almacenada y un IV aleatorio.
 * @memberof module:crypto
 * @async
 * @param {string} data - Datos a cifrar en texto plano.
 * @returns {Promise<{ encryptedData: string, iv: string }>} Objeto con los datos cifrados y el IV en hexadecimal.
 */
export async function encryptCredential(data) {
  const masterkey = await ipcRenderer.invoke("get-master-key");
  const key = Buffer.from(masterkey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encryptedData: encrypted, iv: iv.toString('hex') }; 
}