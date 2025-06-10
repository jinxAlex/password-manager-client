/**
 * @file credentialRenderer.js
 * @description Renderizador para la ventana de agregar/editar credenciales en BlackVault. Maneja la lógica de UI y la comunicación con el backend para agregar, editar y validar credenciales.
 * @module credentialRenderer
 * @requires config/config.js
 */
import { SERVER_ADD_CREDENTIAL, SERVER_EDIT_CREDENTIAL } from '../config/config.js';

const inputCredentialName = document.getElementById("inputCredential");
const inputUsername = document.getElementById("inputUsername");
const inputPassword = document.getElementById("inputPassword");
const inputFolder = document.getElementById("inputFolder");
const inputUrl = document.getElementById("inputUrl");
const header = document.getElementById("header");
const buttonSend = document.getElementById("sendCredential");
const buttonGenerate = document.getElementById("generatePassword");
const buttonClose = document.getElementById("close-modal");
const buttonToggleVisibility = document.getElementById("toggleVisibility");
const buttonEyeOpen = document.getElementById("eyeOpen");
const buttonEyeClosed = document.getElementById("eyeClosed");


let edit = false;
let editId;


/**
 * Alterna la visibilidad del campo de contraseña.
 * @memberof module:credentialRenderer
 */
buttonToggleVisibility.addEventListener("click", async function () {
    const isPassword = inputPassword.type === "password";
    inputPassword.type = isPassword ? "text" : "password";

    buttonEyeClosed.classList.toggle("hidden", isPassword);
    buttonEyeOpen.classList.toggle("hidden", !isPassword);
});

/**
 * Abre la modal de generación de contraseñas y envía el evento correspondiente.
 * @memberof module:credentialRenderer
 */
buttonGenerate.addEventListener("click", async function () {
    window.api.showUtilitiesModal("password", true);
    window.api.sendMessage("generate-password-to-credential");
});

/**
 * Cierra la modal de credenciales.
 * @memberof module:credentialRenderer
 */
buttonClose.addEventListener('click', () => {
    window.api.showCredentialModal(false);
});

/**
 * Valida los campos de entrada de la credencial.
 * @memberof module:credentialRenderer
 * @param {string} name - Nombre de la credencial.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña.
 * @param {string} url - URL asociada.
 * @returns {boolean} True si los campos son válidos, false en caso contrario.
 */
function validateInput(name, username, password, url) {
    let isValid = true;
    if (!name || !username || !password) {
        window.api.showErrorModal("Los campos 'Nombre', 'Usuario' y 'Contraseña' son obligatorios.");
        isValid = false;

    }

    if (isValid === true && name.length < 3) {
        window.api.showErrorModal("El nombre de la credencial debe tener al menos 3 caracteres.");
        isValid = false;
    }

    if (isValid === true && username.length < 3) {
        window.api.showErrorModal("El nombre de usuario debe tener al menos 3 caracteres.");
        isValid = false;
    }

    if (isValid === true && password.length < 8) {
        window.api.showErrorModal("La contraseña debe tener al menos 8 caracteres.");
        isValid = false;
    }

    if (isValid === true && url != "") {
        try {
            new URL(url);
        } catch (e) {
            window.api.showErrorModal("La URL proporcionada no es válida.");
            isValid = false;
        }
    }

    return isValid;
}

/**
 * Maneja el evento de envío del formulario para agregar o editar una credencial.
 * @memberof module:credentialRenderer
 */
buttonSend.addEventListener('click', async () => {
    let name = inputCredentialName.value.trim();
    let username = inputUsername.value.trim();
    let password = inputPassword.value.trim();
    let url = inputUrl.value.trim();

    if (!validateInput(name, username, password, url)) {
        return;
    }

    const data = JSON.stringify({
        "entry_name": name,
        "username": username,
        "password": password,
        "url": url,
        "folder": inputFolder.value
    });
    window.api.showLoadingWindow(true);
    try {
        const { encryptedData, iv } = await window.api.encryptCredential(data);

        const email = await window.api.getEmail();
        const authKey = await window.api.getAuthKey();

        const basicAuth = btoa(`${email}:${authKey}`);
        let response
        if (edit == false) {
            response = await fetch(SERVER_ADD_CREDENTIAL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${basicAuth}`,
                },
                body: JSON.stringify({
                    encryptedData: encryptedData,
                    iv: iv
                }),
            });
        } else {
            console.log
            response = await fetch(SERVER_EDIT_CREDENTIAL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${basicAuth}`,
                },
                body: JSON.stringify({
                    id: editId,
                    encryptedData: encryptedData,
                    iv: iv
                }),
            });
        }



        const result = await response.text();

        if (!response.ok) {
            console.log("Error al agregar la credencial:", result);
            if (edit) {
                window.api.showErrorModal("Ocurrio un problema al editar la credencial.");
            } else {
                window.api.showErrorModal("Ocurrio un problema al agregar la credencial.");
            }

        } else {
            console.log("Credencial agregada exitosamente.");
            if (edit) {
                window.api.showSuccessModal("Se edito la credencial exitosamente.");
            } else {
                window.api.showSuccessModal("Se agrego la credencial exitosamente.");
            }
        }
        window.api.sendMessage("refresh-vault");

        window.api.showCredentialModal(false);


    } catch (error) {
        console.log("Error durante el proceso:", error);
        window.api.showErrorModal("Ocurrio un error al procesar la solicitud.");
    }
    window.api.showLoadingWindow(false);
});

/**
 * Rellena el formulario con los datos de la credencial a editar.
 * @memberof module:credentialRenderer
 * @param {Object} data - Datos de la credencial y configuración de edición.
 */
window.api.onDataSent(data => {
    if (data.edit == true) {
        edit = true;
        editId = data.id;
        header.textContent = "Editar credencial";
        buttonSend.textContent = "Editar";
        inputCredentialName.value = data.entry_name;
        inputUsername.value = data.username;
        inputPassword.value = data.password;
        inputUrl.value = data.url;
        fillFolderSelection(data.foldersList)
        inputFolder.value = data.folder;
    }
});

/**
 * Inserta la contraseña generada en el campo correspondiente.
 * @memberof module:credentialRenderer
 * @param {string} password - Contraseña generada.
 */
window.api.onGeneratedPassword((password) => {
    inputPassword.value = password;
});

/**
 * Rellena el selector de carpetas con la lista proporcionada.
 * @memberof module:credentialRenderer
 * @param {Array<string>} foldersList - Lista de carpetas.
 */
window.api.onSendFolders((foldersList) => {
    fillFolderSelection(foldersList);
});

/**
 * Llena el selector de carpetas con las opciones proporcionadas.
 * @memberof module:credentialRenderer
 * @param {Array<string>} foldersList - Lista de carpetas.
 */
function fillFolderSelection(foldersList) {
    for (const folder of foldersList) {
        const opt = document.createElement('option');
        opt.value = folder;
        opt.text = folder;
        inputFolder.appendChild(opt);
    }
}