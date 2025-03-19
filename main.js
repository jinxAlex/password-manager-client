const { app, BrowserWindow, ipcMain } = require("electron");
const keytar = require("keytar");
const path = require("path");
const SERVICE = "passwordManager";

let mainWindow;
let userEmail;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        icon: path.join(__dirname, "resources/safe-box.ico"),
        title: "Password manager",
        show: false, // La ventana se crea oculta
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // Carga el script de precarga
            contextIsolation: true, // Mantiene el aislamiento de contexto (seguridad)
            enableRemoteModule: false, // Evita acceso remoto no seguro
            nodeIntegration: false, // Bloquea acceso directo a Node.js en el renderizador
            sandbox: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'views', 'login.html'));

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
    ipcMain.handle('change-view', async (event, viewPath) => {
        const fullPath = path.join(__dirname, viewPath);
        await mainWindow.loadFile(fullPath);
    });
});

// Evento para cerrar la aplicación correctamente
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        deleteMasterPassowrd();
        app.quit();
    }
});

ipcMain.handle('store-master-password', async (event, email, masterPassword) => {
    storeMasterPassword(email, masterPassword);
    await getMasterPassword();
});


function deleteMasterPassowrd() {
    const SERVICE = "passwordManager";
    const userEmail = "user@example.com";
    try {
        keytar.deletePassword(SERVICE, userEmail);
    } catch (error) {
        console.error("Error al eliminar la contraseña maestra:", error);
    }
}

function storeMasterPassword(email, masterPassword) {
    userEmail = email;
    try {
        keytar.setPassword(SERVICE, userEmail, masterPassword);
        
    } catch (error) {
        console.error("Error al almacenar la contraseña maestra:", error);
    }
}

async function getMasterPassword() {
    try {
        const storedPassword = await keytar.getPassword(SERVICE, userEmail);
        console.log("Contraseña maestra recuperada:", storedPassword);
        return storedPassword;
    } catch (error) {
        console.error("Error al recuperar la contraseña maestra:", error);
    }
}
