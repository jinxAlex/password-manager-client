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

buttonToggleVisibility.addEventListener("click", async function () {
    const isPassword = inputPassword.type === "password";
    console.log(isPassword)
    inputPassword.type = isPassword ? "text" : "password";

    buttonEyeClosed.classList.toggle("hidden", !isPassword);
    buttonEyeOpen.classList.toggle("hidden", isPassword);
});

buttonGenerate.addEventListener("click", async function () {
    window.api.showUtilitiesModal("password", true);
    window.api.sendMessage("generate-password-to-credential");
});

buttonClose.addEventListener('click', () => {
    window.api.showCredentialModal(false);
});

function validateInput(name, username, password, url) {
    let isValid = true;
    if (!name || !username || !password) {
        window.api.showErrorModal("Los campos 'Nombre', 'Usuario' y 'Contraseña' son obligatorios.");
        isValid = false;
    }

    if (name.length < 3) {
        window.api.showErrorModal("El nombre de la credencial debe tener al menos 3 caracteres.");
        isValid = false;
    }

    if (username.length < 3) {
        window.api.showErrorModal("El nombre de usuario debe tener al menos 3 caracteres.");
        isValid = false;
    }

    if (password.length < 8) {
        window.api.showErrorModal("La contraseña debe tener al menos 8 caracteres.");
        isValid = false;
    }

    if (url != "") {
        try {
            new URL(url);
        } catch (e) {
            window.api.showErrorModal("La URL proporcionada no es válida.");
            isValid = false;
        }
    }

    return isValid;
}

buttonSend.addEventListener('click', async () => {
    let name = inputCredentialName.value.trim();
    let username = inputUsername.value.trim();
    let password = inputPassword.value.trim();
    let url = inputUrl.value.trim();

    validateInput(name, username, password, url);

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

window.api.onGeneratedPassword((password) => {
    inputPassword.value = password;
});

window.api.onSendFolders((foldersList) => {
    fillFolderSelection(foldersList);
});

function fillFolderSelection(foldersList) {
    for (const folder of foldersList) {
        const opt = document.createElement('option');
        opt.value = folder;
        opt.text = folder;
        inputFolder.appendChild(opt);
    }
}