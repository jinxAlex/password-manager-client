import { app, BrowserWindow, BrowserView, ipcMain } from "electron";
import keytar from "keytar";
import path from "path";
import { SERVICE_MASTER_KEY, SERVICE_AUTH_KEY, SERVICE_EMAIL } from "./config/config.js";
import Store from "electron-store";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow, modal;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        icon: path.join(__dirname, "resources/safe-box.ico"),
        title: "BlackVault",
        show: false, // La ventana se crea oculta
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"), // Carga el script de precarga
            contextIsolation: true, // Mantiene el aislamiento de contexto (seguridad)
            enableRemoteModule: false, // Evita acceso remoto no seguro
            nodeIntegration: false, // Bloquea acceso directo a Node.js en el renderizador
            sandbox: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, "views", "login.html"));

    //mainWindow.setMenu(null);
    mainWindow.maximize();
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    modal = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: false
        }
    });

    modal.webContents.loadFile(path.join(__dirname, "views", "actions", "credential.html"));
    modal.webContents.openDevTools();
}

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

ipcMain.on("refresh-vault", (event) => {
    mainWindow.webContents.send("refresh-vault");
});

ipcMain.handle("show-modal", async (event, show, data) => {
    if (show) {
        const [mainWidth, mainHeight] = mainWindow.getSize();

        const modalWidth = 800;
        const modalHeight = 600;

        const x = Math.floor((mainWidth - modalWidth) / 2);
        const y = Math.floor((mainHeight - modalHeight) / 2);

        mainWindow.setBrowserView(modal);
        modal.setBounds({ x: x, y: y, width: 800, height: 600 });
        modal.setAutoResize({ width: false, height: false });
        if (modal.webContents.isLoading()) {
            modal.webContents.once('did-finish-load', () => {
              modal.webContents.send('dataSent', data);
            });
          } else {
            modal.webContents.send('dataSent', data);
          }
    } else {
        mainWindow.setBrowserView(null);
    }
});

ipcMain.handle("store-master-key", async (event, email, masterPassword) => {
    await storeMasterPassword(email, masterPassword);
});

ipcMain.handle("store-auth-key", async (event, email, authKey) => {
    await storeAuthKey(email, authKey);
    await new Promise(resolve => setTimeout(resolve, 500)); //It is not stored on keytar inmediately, it has a delay
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

ipcMain.on("refresh-vault", (event) => {

    if (mainWindow) {
        mainWindow.webContents.send('mensaje-desde-secundaria');
    }
});

function deleteMasterPassowrd() {
    try {
        const email = store.get("userEmail");
        keytar.deletePassword(SERVICE_MASTER_KEY, email);
        keytar.deletePassword(SERVICE_AUTH_KEY, email);
    } catch (error) {
        console.error("Error al eliminar la contraseña maestra:", error);
    }
}

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