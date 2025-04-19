const { app, BrowserWindow, ipcMain } = require("electron");
const keytar = require("keytar");
const path = require("path");

let store;

const storeReady = (async () => {
    const module = await import('electron-store');
    const Store = module.default;
    store = new Store();
})();
const SERVICE_MASTER_KEY = "passwordManager_MasterKey";
const SERVICE_AUTH_KEY = "passwordManager_AuthKey";




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
            preload: path.join(__dirname, "preload.js"), // Carga el script de precarga
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

ipcMain.handle("store-master-key", async (event, email, masterPassword) => {
    await storeMasterPassword(email, masterPassword);
});

ipcMain.handle("store-auth-key", async (event,email, authKey) => {
    await storeAuthKey(email, authKey);
    await new Promise(resolve => setTimeout(resolve, 500)); //No se guarda inmediatamente en Keytar, tiene un pequeño retraso
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
    await storeReady; // asegurate de que 'store' esté listo
    store.set("userEmail", email);
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
        const email = store.get("userEmail");
        const storedPassword = await keytar.getPassword(SERVICE_MASTER_KEY, email);
        console.log("Contraseña maestra recuperada:", storedPassword);
        return storedPassword;
    } catch (error) {
        console.error("Error al recuperar la contraseña maestra:", error);
    }
}

async function getAuthKey() {
    try {
        await storeReady;
        const email = store.get("userEmail");
        const storedPassword = await keytar.getPassword(SERVICE_AUTH_KEY, email);
        console.log("AuthKey recuperado:", storedPassword);
        return storedPassword;
    } catch (error) {
        console.error("Error al recuperar el authKey:", error);
    }
}