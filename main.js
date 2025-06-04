/**
 * @file main.js
 * @description Aplicación principal de Electron para BlackVault. Maneja la creación de ventanas, la gestión de eventos IPC y la interacción con el sistema de almacenamiento seguro.
 * @module main
 * @requires config/config.js
 * @requires electron
 * @requires keytar
 * @requires electron-store
 * @requires electron-ipc
 * @requires electron-url
 * @requires electron-ajv
 * @requires electron-ajv-formats
 * @requires electron-fs
 * @requires electron-path
 */

import { app, BrowserWindow, dialog, ipcMain, screen } from "electron";
import keytar from "keytar";
import path from "path";
import { SERVICE_MASTER_KEY, SERVICE_AUTH_KEY, SERVICE_EMAIL, TIMING } from "./config/config.js";
import Store from "electron-store";
import { fileURLToPath } from "url";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

// Variables para las modales y la ventana principal
let mainWindow, credentialModal, utilitiesModal, loadingWindow;

/**
 * Crea la ventana principal de la aplicación.
 * Esta ventana se utiliza para mostrar la interfaz de usuario principal.
 * @memberof module:main
 * 
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 400,
        minHeight: 300,
        icon: path.join(__dirname, "resources/vault.ico"),
        title: "BlackVault",
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, "views", "login.html"));

    mainWindow.setMenu(null);
    
    mainWindow.maximize();

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    utilitiesModal = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        show: false,
        resizable: false,
        level: 'floating',
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: false
        }
    });
    mainWindow.webContents.openDevTools({ mode: "detach" });

}

/**
 * Función para verificar si una ventana está viva.
 * @memberof module:main
 * @param {BrowserWindow} win - La ventana a verificar.
 * @returns {boolean} Retorna true si la ventana está viva, false si está destruida.
 */
function isWindowAlive(win) {
    return win && !win.isDestroyed();
}

// Evento para mostrar las alertas de tipo error
ipcMain.handle("show-error-alert", async (_event, data) => {
    const toastWidth = 400;
    const toastHeight = 100;
    const margin = 20;

    const { workArea } = screen.getPrimaryDisplay();

    const x = Math.round(workArea.x + (workArea.width - toastWidth) / 2);
    const y = Math.round(workArea.y + (workArea.height - toastHeight) - margin);

    const errorAlert = new BrowserWindow({
        width: toastWidth,
        height: toastHeight,
        x: x,
        y: y,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focusable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: false
        }
    });
    errorAlert.setIgnoreMouseEvents(true, { forward: true });

    errorAlert.loadFile(path.join(__dirname, 'views', 'alert', 'error.html'));

    // Espera a que el HTML y el preload estén listos
    errorAlert.webContents.on('did-finish-load', () => {
        errorAlert.webContents.send('show-error-message', data);
        errorAlert.show();
        setTimeout(() => errorAlert.close(), TIMING);
    });
});

// Evento para mostrar las alertas de tipo success
ipcMain.handle("show-success-alert", async (_event, data) => {
    const toastWidth = 400;
    const toastHeight = 100;
    const margin = 20;

    const { workArea } = screen.getPrimaryDisplay();

    const x = Math.round(workArea.x + (workArea.width - toastWidth) / 2);
    const y = Math.round(workArea.y + (workArea.height - toastHeight) - margin);

    const successAlert = new BrowserWindow({
        width: toastWidth,
        height: toastHeight,
        x: x,
        y: y,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focusable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: false
        }
    });
    successAlert.setIgnoreMouseEvents(true, { forward: true });

    successAlert.loadFile(path.join(__dirname, 'views', 'alert', 'success.html'));

    // Espera a que el HTML y el preload estén listos
    successAlert.webContents.on('did-finish-load', () => {
        successAlert.webContents.send('show-success-message', data);
        successAlert.show();
        setTimeout(() => successAlert.close(), TIMING);
    });
});


// Evento para mostrar la modal de credenciales
ipcMain.handle("show-loading-window", async (event, show) => {
    const toastWidth = 100;
    const toastHeight = 100;
    const margin = 20;

    if (show) {
        // Si ya existe, no la volvemos a crear
        if (loadingWindow && !loadingWindow.isDestroyed()) return;

        const { workArea } = screen.getPrimaryDisplay();

        const x = Math.round(workArea.x + (workArea.width - toastWidth) / 2);
        const y = Math.round(toastHeight + margin);

        loadingWindow = new BrowserWindow({
            width: toastWidth,
            height: toastHeight,
            x: x,
            y: y,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            focusable: false,
            webPreferences: {
                preload: path.join(__dirname, "preload.mjs"),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false,
                sandbox: false
            }
        });

        loadingWindow.setIgnoreMouseEvents(true, { forward: true });

        await loadingWindow.loadFile(path.join(__dirname, 'views', 'alert', 'loadingWindow.html'));
        loadingWindow.show();
    } else {
        // Cerrar si existe
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.close();
            loadingWindow = null;
        }
    }
});


// Evento para mostrar la modal de credenciales
ipcMain.handle("show-credential-modal", async (event, show, data) => {
    mainWindow.webContents.send('show-overlay');
    if (show) {

        if (isWindowAlive(credentialModal)) {
            credentialModal.destroy();
            credentialModal = null;
        }

        credentialModal = new BrowserWindow({
            parent: mainWindow,
            modal: true,
            frame: false,
            transparent: true,
            backgroundColor: '#00000000',
            show: false,
            resizable: false,
            webPreferences: {
                preload: path.join(__dirname, "preload.mjs"),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false,
                sandbox: false
            }
        });
        // Carga el HTML de la modal y espera
        await credentialModal.webContents.loadFile(path.join(__dirname, "views", "actions", "credential.html"));

        // Mándale los datos
        credentialModal.webContents.send('dataSent', data);

        // Centra y muestra
        credentialModal.center();
        credentialModal.show();

    } else {
        if (isWindowAlive(credentialModal)) {
            credentialModal.destroy();
            credentialModal = null;
        }
    }
});

// Evento para mostrar la modal de utilidades
ipcMain.handle("show-utilities-modal", async (event, typeModal, show) => {

    if (!mainWindow.webContents.getURL().endsWith("index.html")) {
        await new Promise(resolve => {
            const handler = () => {
                mainWindow.webContents.removeListener('did-finish-load', handler);
                resolve();
            };
            mainWindow.webContents.on('did-finish-load', handler);
        });
    }

    if (isWindowAlive(credentialModal)) {
        credentialModal.hide();
    } else {
        mainWindow.webContents.send('show-overlay');
    }
    if (show) {
        if (!isWindowAlive(utilitiesModal)) {
            utilitiesModal = new BrowserWindow({
                parent: mainWindow,
                modal: true,
                frame: false,
                transparent: true,
                backgroundColor: '#00000000',
                show: false,
                resizable: false,
                webPreferences: {
                    preload: path.join(__dirname, "preload.mjs"),
                    contextIsolation: true,
                    enableRemoteModule: false,
                    nodeIntegration: false,
                    sandbox: false
                }
            });
        }

        let utilityFile;
        switch (typeModal) {
            case "password":
                utilityFile = "password.html";
                break;
            case "export/import":
                utilityFile = "export-import.html";
                break;
            case "folder":
                utilityFile = "folder.html";
                break;
            case "welcome":
                utilityFile = "welcome.html";
                break;
            default:
                return;
        }
        await utilitiesModal.loadFile(path.join(__dirname, "views", "actions", utilityFile));
        utilitiesModal.webContents.openDevTools({ mode: "detach" });
        utilitiesModal.center();
        utilitiesModal.show();
        utilitiesModal.moveTop();
        utilitiesModal.focus();
    } else {
        if (isWindowAlive(utilitiesModal)) {
            console.log("Cerrando modal de utilidades");
            utilitiesModal.destroy();
            utilitiesModal = null;
        }

        if (isWindowAlive(credentialModal)) {
            credentialModal.show();
        }
    }
});

//Fuerza a Electron a escribir su caché en userdata/, dentro de tu proyecto, evitando problemas de permisos.
app.setPath("userData", path.join(__dirname, "userdata"));

// Evento cuando Electron está listo
app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    ipcMain.handle("change-view", async (event, viewPath) => {
        const fullPath = path.join(__dirname, viewPath);
        await mainWindow.loadFile(fullPath);
    });
});

// Evento para cerrar la aplicación correctamente
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        deleteMasterPassword();
        app.quit();
    }
});

ipcMain.handle('show-open-dialog', async () => {
    console.log('[show-open-dialog] Abriendo diálogo para seleccionar archivo JSON');
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Seleccionar archivo JSON',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    });
    if (canceled) {
        console.log('[show-open-dialog] Selección cancelada por el usuario');
        return null;
    }
    const rawDataPath = filePaths[0];
    console.log('[show-open-dialog] Archivo seleccionado:', rawDataPath);

    let rawData;
    try {
        rawData = fs.readFileSync(rawDataPath, 'utf-8');
        console.log('[show-open-dialog] Contenido leído correctamente');
    } catch (err) {
        console.error('[show-open-dialog] Error leyendo el archivo:', err);
        return null;
    }

    let data;
    try {
        data = JSON.parse(rawData);
        console.log('[show-open-dialog] JSON parseado correctamente');
    } catch (err) {
        console.error('[show-open-dialog] Error parseando el JSON:', err);
        return null;
    }

    const schemaPath = path.resolve(__dirname, './config/credentialSchema.json');
    let schemaText, schema;
    try {
        schemaText = fs.readFileSync(schemaPath, 'utf-8');
        schema = JSON.parse(schemaText);
        console.log('[show-open-dialog] Esquema cargado:', schemaPath);
    } catch (err) {
        console.error('[show-open-dialog] Error cargando el esquema:', err);
        return null;
    }

    const ajv = new Ajv({
        allErrors: true,
        removeAdditional: 'failing',
        strict: false
    });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        console.error('[show-open-dialog] Errores de validación:', validate.errors);
        return null;
    }
    console.log('[show-open-dialog] Validación exitosa');
    return data;
})

ipcMain.handle('show-save-dialog', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Guardar archivo JSON',
        defaultPath: 'credenciales.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled) return null
    return filePath
})

ipcMain.handle("obtain-credentials", async (event) => {
    console.log("Se ha solicitado la obtención de las credenciales");
    mainWindow.webContents.send("obtain-credentials");
});

ipcMain.handle("export-credentials", async (event, credentialList) => {
    console.log("Se ha solicitado la exportación de las credenciales");
    utilitiesModal.webContents.send("export-credentials", credentialList);
});

/**
 * Reenvía el evento 'refresh-vault' al proceso de renderizado principal.
 * @memberof module:main
 * @param {Electron.IpcMainEvent} event - Evento IPC recibido.
 */
function handleRefreshVault(event) {
    mainWindow.webContents.send("refresh-vault");
}

ipcMain.on("refresh-vault", handleRefreshVault);

/**
 * Envía los datos de la carpeta al proceso de renderizado.
 * @memberof module:main
 * @param {Electron.IpcMainInvokeEvent} event - Evento IPC.
 * @param {String} data - Nombre de la carpeta a guardar.
 */
function handleSaveFolder(event, data) {
    mainWindow.webContents.send("save-folder", data);
}

ipcMain.handle("save-folder", handleSaveFolder);

/**
 * Envía los datos de las carpetas al modal de credenciales una vez que se carga.
 * @memberof module:main
 * @param {Electron.IpcMainInvokeEvent} event - Evento IPC.
 * @param {List} data - Nombres de las carpetas.
 */
function handleSendFolders(event, data) {
    credentialModal.webContents.once("did-finish-load", () => {
        credentialModal.webContents.send("send-folders", data);
    });
}

ipcMain.handle("send-folders", handleSendFolders);

/**
 * Solicita al modal de utilidades que genere una contraseña, una vez cargado.
 * @memberof module:main
 * @param {Electron.IpcMainEvent} event - Evento IPC.
 */
function handleGeneratePasswordToCredential(event) {
    utilitiesModal.webContents.once("did-finish-load", () => {
        utilitiesModal.webContents.send("generate-password-to-credential");
    });
}

ipcMain.on("generate-password-to-credential", handleGeneratePasswordToCredential);

/**
 * Reenvía la contraseña generada al modal de credenciales.
 * @memberof module:main
 * @param {Electron.IpcMainEvent} event - Evento IPC.
 * @param {String} data - Contraseña generada.
 */
function handleGeneratedPassword(event, data) {
    credentialModal.webContents.send("generated-password", data);
}

ipcMain.on("generated-password", handleGeneratedPassword);

/**
 * Almacena la clave maestra de un usuario.
 * @memberof module:main
 * @async
 * @param {Electron.IpcMainInvokeEvent} event - Evento IPC.
 * @param {string} email - Correo del usuario.
 * @param {string} masterPassword - Clave maestra a almacenar.
 * @returns {Promise<void>}
 */
async function handleStoreMasterKey(event, email, masterPassword) {
    await storeMasterPassword(email, masterPassword);
}

ipcMain.handle("store-master-key", handleStoreMasterKey);

ipcMain.handle("store-auth-key", async (event, email, authKey) => {
    await storeAuthKey(email, authKey);
    await new Promise(resolve => setTimeout(resolve, 500));
});

/**
 * Handler del canal "get-master-key".
 * Devuelve la master key almacenada de forma segura.
 * @memberof module:main
 * @async
 * @param {Electron.IpcMainInvokeEvent} event - El evento de IPC.
 * @returns {Promise<string>} La clave maestra.
 */
async function handleGetMasterKey(event) {
    return await getMasterPassword();
}

ipcMain.handle("get-master-key", handleGetMasterKey);


/**
 * Handler del canal "get-auth-key".
 * Devuelve la master key almacenada de forma segura.
 * @memberof module:main
 * @async
 * @param {Electron.IpcMainInvokeEvent} event - El evento de IPC.
 * @returns {Promise<string>} La clave de autenticación.
 */
async function handleGetAuthKey(event) {
    return await getAuthKey();
}

ipcMain.handle("get-auth-key", handleGetAuthKey);



/**
 * Handler del canal "get-email".
 * Devuelve el email del usuario.
 * @memberof module:main
 * @param {Electron.IpcMainInvokeEvent} event - El evento de IPC.
 * @returns {Promise<string>} El email.
 */
async function handleGetEmail(event) {
    return getEmail();
}

ipcMain.handle("get-email", handleGetEmail);

/**
 * Almacena la contraseña maestra del usuario en keytar.
 * @memberof module:main
 * @param {email} email - El correo electrónico del usuario.
 * @param {masterPassword} masterPassword - La contraseña maestra del usuario.
 */
async function storeMasterPassword(email, masterPassword) {
    store.set(SERVICE_EMAIL, email);
    console.log(email)
    try {
        await keytar.setPassword(SERVICE_MASTER_KEY, email, masterPassword);

    } catch (error) {
        console.error("Error al almacenar la contraseña maestra:", error);
    }
}

/**
 * Almacena la clave de autenticación del usuario en keytar.
 * @memberof module:main
 * @async
 * @param {email} email - El correo electrónico del usuario.
 * @param {authKey} authKey - La clave de autenticación del usuario.
 */
async function storeAuthKey(email, authKey) {
    try {
        await keytar.setPassword(SERVICE_AUTH_KEY, email, authKey);

    } catch (error) {
        console.error("Error al almacenar el authKey:", error);
    }
}

/**
 * Elimina la contraseña maestra y la clave de autenticación del usuario almacenados en keytar.
 * @memberof module:main
 */
function deleteMasterPassword() {
    try {
        const email = store.get("userEmail");
        keytar.deletePassword(SERVICE_MASTER_KEY, email);
        keytar.deletePassword(SERVICE_AUTH_KEY, email);
    } catch (error) {
        console.error("Error al eliminar la contraseña maestra:", error);
    }
}

/**
 * Retorna la contraseña maestra del usuario alamcenado en keytar.
 * @memberof module:main
 * @async
 * @returns {string} Retorna la contraseña maestra del usuario.
 */
async function getMasterPassword() {
    try {
        const email = store.get(SERVICE_EMAIL);
        const storedPassword = await keytar.getPassword(SERVICE_MASTER_KEY, email);
        return storedPassword;
    } catch (error) {
        console.error("Error al recuperar la contraseña maestra:", error);
    }
}

/**
 * Retorna la clave de autenticación del usuario alamcenado en keytar.
 * @memberof module:main
 * @async
 * @returns {string} Retorna la clave de autenticación  del usuario.
 */
async function getAuthKey() {
    try {
        const email = store.get(SERVICE_EMAIL);
        const storedPassword = await keytar.getPassword(SERVICE_AUTH_KEY, email);
        return storedPassword;
    } catch (error) {
        console.error("Error al recuperar el authKey:", error);
    }
}

/**
 * Retorna el email almacenado del usuario.
 * @memberof module:main
 * @async
 * @returns {string} Retorna el email del usuario.
 */
async function getEmail() {
    try {
        const email = store.get(SERVICE_EMAIL);
        return email;
    } catch (error) {
        console.error("Error al recuperar el email:", error);
    }
}