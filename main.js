import { app, BrowserWindow, BrowserView, ipcMain, screen  } from "electron";
import keytar from "keytar";
import path from "path";
import { SERVICE_MASTER_KEY, SERVICE_AUTH_KEY, SERVICE_EMAIL, TIMING } from "./config/config.js";
import Store from "electron-store";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

// Variables para las modales y la ventana principal
let mainWindow, credentialModal, utilitiesModal, errorAlert;

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
    //mainWindow.webContents.openDevTools();

    mainWindow.setMenu(null);

    mainWindow.maximize();

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    credentialModal = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: false
        }
    });

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
    credentialModal.webContents.loadFile(path.join(__dirname, "views", "actions", "credential.html"));
}

// Evento para mostrar las alertas de tipo error
ipcMain.handle("show-error-alert", async (_event, data) => {
    const toastWidth  = 400;
    const toastHeight = 80;
    const margin      = 20;

    const { workArea } = screen.getPrimaryDisplay();

    const x = Math.round(workArea.x + (workArea.width  - toastWidth ) / 2);
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

// Evento para mostrar la modal de credenciales
ipcMain.handle("show-credential-modal", async (event, show, data) => {
    mainWindow.webContents.send('show-overlay');
    if (show) {
        const [mainWidth, mainHeight] = mainWindow.getSize();

        const modalWidth = 800;
        const modalHeight = 600;

        const x = Math.floor((mainWidth - modalWidth) / 2);
        const y = Math.floor((mainHeight - modalHeight) / 2);

        mainWindow.setBrowserView(credentialModal);
        credentialModal.setBounds({ x: x, y: y, width: 800, height: 600 });
        credentialModal.setAutoResize({ width: false, height: false });
        //credentialModal.webContents.openDevTools()
        if (credentialModal.webContents.isLoading()) {
            credentialModal.webContents.once('did-finish-load', () => {
                credentialModal.webContents.send('dataSent', data);
            });
        } else {
            credentialModal.webContents.send('dataSent', data);
        }
    } else {
        mainWindow.setBrowserView(null);
    }
});

// Evento para mostrar la modal de utilidades
ipcMain.handle("show-utilities-modal", async (event, typeModal, show) => {
    if (mainWindow.getBrowserView()  != credentialModal) {
        mainWindow.webContents.send('show-overlay');
    }
    let utilityFile;
    switch (typeModal) {
        case "password":
            utilityFile = "password.html";
            break;
        case "export/import":
            utilityFile = "export-import.html";
            break;
        default:
            return;
    }
    await utilitiesModal.loadFile(path.join(__dirname, "views", "actions", utilityFile));
    if (show) {
        utilitiesModal.center();
        utilitiesModal.show();
        //utilitiesModal.webContents.openDevTools({ mode: "undocked" });
    } else {
        utilitiesModal.hide();
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