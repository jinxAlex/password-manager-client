import { SERVER_ADD_CREDENTIAL, SERVER_EDIT_CREDENTIAL } from '../config/config.js';

const inputCredentialName = document.getElementById("inputCredential");
const inputUsername = document.getElementById("inputUsername");
const inputPassword = document.getElementById("inputPassword");
const inputUrl = document.getElementById("inputUrl");
const header = document.getElementById("header");
const buttonSend = document.getElementById("sendCredential");
const buttonGenerate = document.getElementById("generatePassword");

let edit = false;
let editId;

buttonGenerate.addEventListener("click", async function() {
    window.api.showUtilitiesModal("password", true);

});

document.getElementById('close-modal').addEventListener('click', () => {
    window.api.showCredentialModal(false);
});

document.getElementById('sendCredential').addEventListener('click', async () => {
    let name = inputCredentialName.value.trim();
    let username = inputUsername.value.trim();
    let password = inputPassword.value.trim();
    let url = inputUrl.value.trim();

    if (!name || !username || !password) {
        alert("Los campos 'Nombre', 'Usuario' y 'Contraseña' son obligatorios.");
        return;
    }

    if (url && !/^https?:\/\/[\w\-]+\.[a-z]{2,6}(\/[\w\-]*)*\/?$/.test(url)) {
        alert("La URL proporcionada no es válida.");
        return;
    }

    const data = JSON.stringify({
        "entry_name": name,
        "username": username,
        "password": password,
        "url": url,
        "folder": "test"
    });

    try {
        const { encryptedData, iv } = await window.api.encryptCredential(data);
        console.log("Encrypted data:", encryptedData);
        console.log("IV:", iv);

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
                    salt: iv
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
                    salt: iv
                }),
            });
        }



        const result = await response.text();

        if (!response.ok) {
            console.error("Error al agregar la credencial:", result);
            alert("Hubo un problema al agregar la credencial.");
        } else {
            console.log("Credencial agregada exitosamente.");
        }
        window.api.sendMessage("refresh-vault");

        window.api.showModal(false);

    } catch (error) {
        console.error("Error durante el proceso:", error);
        alert("Hubo un error al procesar la solicitud.");
    }
});

window.api.onDataSent(data => {
    if (data.edit == true) {
        edit = true;
        editId = data.id;
        header.textContent = "Editar credencial";
        button.textContent = "Editar";
        inputCredentialName.value = data.entry_name;
        inputUsername.value = data.username;
        inputPassword.value = data.password;
        inputUrl.value = data.url;
        console.log(data);
    }
});

