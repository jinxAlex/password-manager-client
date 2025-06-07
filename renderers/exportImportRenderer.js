<<<<<<< HEAD
/**
 * @file exportImportRenderer.js
 * @description Renderizador para la importación y exportación de credenciales en BlackVault. Maneja la lógica de UI y comunicación con el backend para importar, exportar y eliminar credenciales.
 * @module exportImportRenderer
 */

=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
import { SERVER_DELETE_CREDENTIAL, SERVER_ADD_CREDENTIAL } from '../config/config.js';

const actionRadios = document.querySelectorAll('input[name="actionType"]');
const confirmRadios = document.querySelectorAll('input[name="confirmationType"]');
const exceuteButton = document.getElementById('executeAction');

<<<<<<< HEAD
/**
 * Habilita o deshabilita el botón de ejecutar según las selecciones del usuario.
 * @memberof module:exportImportRenderer
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
function checkSelections() {
    const actionSelected = !!document.querySelector('input[name="actionType"]:checked');
    const confirmSelected = !!document.querySelector('input[name="confirmationType"]:checked');
    exceuteButton.disabled = !(actionSelected && confirmSelected);
}

[...actionRadios, ...confirmRadios].forEach(radio =>
    radio.addEventListener('change', checkSelections)
);

<<<<<<< HEAD
/**
 * Obtiene el valor seleccionado de un grupo de radio buttons.
 * @memberof module:exportImportRenderer
 * @param {string} groupName - Nombre del grupo de radio buttons.
 * @returns {string|null} Valor seleccionado o null si no hay selección.
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
function getSelectedValue(groupName) {
    const checked = document.querySelector(`input[name="${groupName}"]:checked`);
    return checked ? checked.value : null;
}

<<<<<<< HEAD
/**
 * Agrega una credencial al servidor.
 * @memberof module:exportImportRenderer
 * @param {Object} credential - Objeto con los datos de la credencial.
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
async function addCredential(credential) {
    const {
        entry_name,
        username,
        password,
        url,
        folder
    } = credential;

    const data = JSON.stringify({
        "entry_name": entry_name,
        "username": username,
        "password": password,
        "url": url,
        "folder": folder
    });
    window.api.showLoadingWindow(true);
    const { encryptedData, iv } = await window.api.encryptCredential(data);
    const email = await window.api.getEmail();
    const authKey = await window.api.getAuthKey();

    const basicAuth = btoa(`${email}:${authKey}`);

    fetch(SERVER_ADD_CREDENTIAL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
            encryptedData: encryptedData,
            iv: iv
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al agregar la credencial");
            }
        })
        .then(data => {
            window.api.showSuccessModal("Credencial agregada correctamente.");
            window.api.refreshVault();
        })
        .catch(error => {
            console.error("Error:", error);
            window.api.showErrorModal("Ocurrio un problema al agregar la credencial.");
        });
    window.api.showLoadingWindow(false);
}

<<<<<<< HEAD
/**
 * Importa una lista de credenciales desde un archivo JSON.
 * @memberof module:exportImportRenderer
 * @async
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
async function importCredentials() {
    const credentialList = await window.api.importJSON()
    if (!credentialList) {
        window.api.showErrorModal("No se pudo importar el archivo JSON. Asegurese de que sea un archivo valido.");
        return;
    }
    window.api.showLoadingWindow(true);
    for (const credential of credentialList) {
        addCredential(credential);
    }
    window.api.showLoadingWindow(false);
    checkToDeleteCredentials()
}

<<<<<<< HEAD
/**
 * Elimina todas las credenciales del usuario en el servidor.
 * @memberof module:exportImportRenderer
 * @async
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
async function deleteCredentials() {
    const email = await window.api.getEmail();
    const authKey = await window.api.getAuthKey();

    const basicAuth = btoa(`${email}:${authKey}`);

    const response = await fetch(SERVER_DELETE_CREDENTIAL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${basicAuth}`,
        }
    });

    if (!response.ok) {
        window.api.showErrorModal("Ocurrio un problema al eliminar las credenciales.");
    } else {
        window.api.showSuccessModal("Se borraron las credenciales correctamente.");
        window.api.refreshVault();
        window.api.showUtilitiesModal("export/import", false);
    }
}

<<<<<<< HEAD
/**
 * Verifica si el usuario confirmó la eliminación de credenciales y ejecuta la acción.
 * @memberof module:exportImportRenderer
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
function checkToDeleteCredentials() {
    const confirmationType = getSelectedValue('confirmationType');
    switch (confirmationType) {
        case "yes":
            deleteCredentials();
            break;
        case "no":
            break;
        default:
            return;
    }
}

<<<<<<< HEAD
/**
 * Maneja el evento de exportación de credenciales.
 * @memberof module:exportImportRenderer
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
window.api.onExportCredentials(async (credentialList) => {
    const success = await window.api.exportJSON(credentialList)
    if (success) {
        window.api.showSuccessModal("Se exportaron las credenciales correctamente.");
        checkToDeleteCredentials();
    } else {
        window.api.showErrorModal("Ocurrio un problema al exportar las credenciales.");
    }
});

<<<<<<< HEAD
/**
 * Maneja el click en el botón de ejecutar acción (importar o exportar).
 * @memberof module:exportImportRenderer
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
exceuteButton.addEventListener('click', async () => {
    const actionType = getSelectedValue('actionType');
    switch (actionType) {
        case "export":
            window.api.obtainAllCredentials();
            break;
        case "import":
            importCredentials();
            break;
        default:
            return;
    }
})

<<<<<<< HEAD
/**
 * Maneja el cierre de la modal de utilidades.
 * @memberof module:exportImportRenderer
 */
=======

>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
document.getElementById('close-modal').addEventListener('click', async () => {
    window.api.showUtilitiesModal("export/import", false);
})