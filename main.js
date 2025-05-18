import { app, BrowserWindow, BrowserView, ipcMain, screen } from "electron";
import keytar from "keytar";
import path from "path";
import { SERVICE_MASTER_KEY, SERVICE_AUTH_KEY, SERVICE_EMAIL, TIMING } from "./config/config.js";
import Store from "electron-store";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

// Variables para las modales y la ventana principal
let mainWindow, credentialModal, utilitiesModal;

// Crea la ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        icon: path.join(__dirname, "resources/safe-box.ico"),
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
    mainWindow.webContents.openDevTools();

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

}

// Evento para mostrar las alertas de tipo error
ipcMain.handle("show-error-alert", async (_event, data) => {
    const toastWidth = 400;
    const toastHeight = 80;
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
    const toastHeight = 80;
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
ipcMain.handle("show-credential-modal", async (event, show, data) => {
    mainWindow.webContents.send('show-overlay');
    if (show) {
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
        credentialModal.webContents.openDevTools();
        // Carga el HTML de la modal y espera
        await credentialModal.webContents.loadFile(path.join(__dirname, "views", "actions", "credential.html"));

        // Mándale los datos
        credentialModal.webContents.send('dataSent', data);

        // Centra y muestra
        credentialModal.center();
        credentialModal.show();

    } else {
        credentialModal.destroy();
    }
});

// Evento para mostrar la modal de utilidades
ipcMain.handle("show-utilities-modal", async (event, typeModal, show) => {
    
    if (credentialModal != null) {
        credentialModal.hide(); 
    }else{
        mainWindow.webContents.send('show-overlay');
    }
    if (show) {
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
            default:
                return;
        }
        await utilitiesModal.loadFile(path.join(__dirname, "views", "actions", utilityFile));

        utilitiesModal.center();
        utilitiesModal.show();
        utilitiesModal.moveTop();
        utilitiesModal.focus();
        utilitiesModal.webContents.openDevTools({ mode: "undocked" });
    } else {
        utilitiesModal.hide();
        if (credentialModal != null) {
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
        deleteMasterPassowrd();
        app.quit();
    }
});

// Evento para refrescar las credenciales
ipcMain.on("refresh-vault", (event) => {
    mainWindow.webContents.send("refresh-vault");
});

ipcMain.handle("save-folder", (event, data) => {+
    mainWindow.webContents.send("save-folder", data );
});

ipcMain.handle("send-folders", (event, data) => {+
    console.log("ENVIO")
    credentialModal.webContents.once('did-finish-load', () => {
        credentialModal.webContents.send("send-folders", data );
    });
});

ipcMain.on("generate-password-to-credential", (event) => {
    utilitiesModal.webContents.on('did-finish-load', () => {
        utilitiesModal.webContents.send("generate-password-to-credential");
    });
});

ipcMain.on("generated-password", (event,data) => {
    credentialModal.webContents.send("generated-password", data)
});

ipcMain.handle("store-master-key", async (event, email, masterPassword) => {
    await storeMasterPassword(email, masterPassword);
});

ipcMain.handle("store-auth-key", async (event, email, authKey) => {
    await storeAuthKey(email, authKey);
    await new Promise(resolve => setTimeout(resolve, 500)); //Will look into this
});

ipcMain.handle("get-master-key", async (event) => {
    return await getMasterPassword();
});

ipcMain.handle("get-auth-key", async (event) => {
    return await getAuthKey();
});

ipcMain.handle("get-email", async (event) => {
    return getEmail();
});

async function storeMasterPassword(email, masterPassword) {
    store.set(SERVICE_EMAIL, email);
    console.log(email)
    try {
        await keytar.setPassword(SERVICE_MASTER_KEY, email, masterPassword);

    } catch (error) {
        console.error("Error al almacenar la contraseña maestra:", error);
    }
}

async function storeAuthKey(email, authKey) {
    try {
        await keytar.setPassword(SERVICE_AUTH_KEY, email, authKey);

    } catch (error) {
        console.error("Error al almacenar el authKey:", error);
    }
}

function deleteMasterPassowrd() {
    try {
        const email = store.get("userEmail");
        keytar.deletePassword(SERVICE_MASTER_KEY, email);
        keytar.deletePassword(SERVICE_AUTH_KEY, email);
    } catch (error) {
        console.error("Error al eliminar la contraseña maestra:", error);
    }
}

async function getMasterPassword() {
    try {
        const email = store.get(SERVICE_EMAIL);
        const storedPassword = await keytar.getPassword(SERVICE_MASTER_KEY, email);
        console.log("Contraseña maestra recuperada:", storedPassword);
        return storedPassword;
    } catch (error) {
        console.error("Error al recuperar la contraseña maestra:", error);
    }
}

async function getAuthKey() {
    try {
        const email = store.get(SERVICE_EMAIL);
        const storedPassword = await keytar.getPassword(SERVICE_AUTH_KEY, email);
        console.log("AuthKey recuperado:", storedPassword);
        return storedPassword;
    } catch (error) {
        console.error("Error al recuperar el authKey:", error);
    }
}

async function getEmail() {
    try {
        const email = store.get(SERVICE_EMAIL);
        console.log("email " + email)
        return email;
    } catch (error) {
        console.error("Error al recuperar el email:", error);
    }
}