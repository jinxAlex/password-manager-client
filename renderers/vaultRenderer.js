/**
 * @file vaultRenderer.js
 * @description Renderer para la ventana de gestión de credenciales. Permite al usuario ver, editar y eliminar sus credenciales almacenadas, así como crear nuevas carpetas para organizarlas.
 * @module vaultRenderer
 * @requires config/config.js
 * @requires scripts/userFunctionality.js
 */

import { SERVER_OBTAIN_USER_CREDENTIALS, SERVER_DELETE_CREDENTIAL } from "../config/config.js";

import { capitalizeFirst } from "../scripts/userFunctionality.js";

const credentialContainer = document.getElementById("accordion-container");
const template = document.querySelector("template");
const buttonContainer = document.getElementById("dropdownContainer");
const dropdown = document.getElementById("dropdownHover");
const foldersContainer = document.getElementById("foldersContainer");
let hideTimeout;
let foldersList = [];
let credentialList = [];
let actualFolder = "Todos";


/**
 * Obtiene las credenciales del usuario desde el servidor y las procesa.
 * @async
 * @memberof module:vaultRenderer
 * 
 */
async function getCredentials() {
    try {
        window.parent.api.showLoadingWindow(true);
        const username = await window.parent.api.getEmail();
        const authKey = await window.parent.api.getAuthKey();
        const basicAuth = btoa(`${username}:${authKey}`);

        const response = await fetch(SERVER_OBTAIN_USER_CREDENTIALS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${basicAuth}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }

        const encryptedDataList = await response.json();
        await processCredentials(encryptedDataList);
    } catch (err) {
        console.error("No se pudo obtener las credenciales:", err);
    }
    window.parent.api.showLoadingWindow(false);
}

/**
 * Procesa las credenciales encriptadas, las descifra y las organiza en una lista.
 * @param {Array} encryptedList - Lista de credenciales encriptadas obtenidas del servidor.
 * @async
 * @memberof module:vaultRenderer
 * 
 */
async function processCredentials(encryptedList) {
    credentialList = [];
    foldersContainer.innerHTML = '';

    for (const cred of encryptedList) {
        if (!cred.iv || !cred.encryptedData) continue;
        try {
            const raw = await window.parent.api.decryptCredential(cred.iv, cred.encryptedData);
            if (!raw) continue;
            const data = JSON.parse(raw);

            data.id = cred.id;
            credentialList.push(data);

            if (data.folder && !foldersList.includes(data.folder)) {
                foldersList.push(data.folder);
            }

        } catch (e) {
            console.error("Error al descifrar:", e);
        }
    }

    buildFolderButtons();
    renderCredentials();
}

/**
 * Crea un botón para una carpeta con un icono y un nombre.
 * @param {string} label - El nombre de la carpeta que se mostrará en el botón.
 * @param {string} iconSrc - La ruta del icono que se mostrará en el botón.
 * @param {string} classes - Clases CSS para aplicar al botón.
 * @returns {HTMLButtonElement} El botón generado con icono y texto.
 * @memberof module:vaultRenderer
 * 
 */
function createFolderButton(label, iconSrc, classes) {
    const btn = document.createElement('button');
    btn.className = classes;

    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = `${label} icon`;
    img.className = 'w-5 h-5'; // tamaño, ajusta a tu gusto

    const span = document.createElement('span');
    span.textContent = label;

    btn.appendChild(img);
    btn.appendChild(span);
    return btn;
}

/**
<<<<<<< HEAD
 * Se encarga de construir los botones de las carpetas en la interfaz.
=======
 * Se 
 * @param {string} label - El nombre de la carpeta que se mostrará en el botón.
 * @param {string} iconSrc - La ruta del icono que se mostrará en el botón.
 * @param {string} classes - Clases CSS para aplicar al botón.
 * @returns {HTMLButtonElement} El botón generado con icono y texto.
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
 * @memberof module:vaultRenderer
 * 
 */
function buildFolderButtons() {
    foldersContainer.innerHTML = "";
    const baseClasses = 'flex items-center space-x-4 p-2 hover:bg-gray-600 rounded-md bg-gray-700 text-gray-200';

    const allBtn = createFolderButton('Todos', "../../resources/menu/folder.webp", baseClasses);
    allBtn.addEventListener('click', () => {
        actualFolder = "Todos";
        renderCredentials();
    });

    foldersContainer.appendChild(allBtn);

    foldersList.forEach(folderName => {
        if (folderName != "") {
            const btn = createFolderButton(capitalizeFirst(folderName), "../../resources/menu/folder.webp", baseClasses);
            btn.addEventListener('click', () => {
                actualFolder = folderName;
                renderCredentials();
            });
            foldersContainer.appendChild(btn);
        }
    });
}

<<<<<<< HEAD
/**
 * Función que renderiza las credenciales en la interfaz de usuario.
 * @memberof module:vaultRenderer
 * 
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
function renderCredentials() {
    credentialContainer.innerHTML = '';
    let idCounter = 0;
    let list;
    if (actualFolder == "Todos") {
        list = credentialList.slice();
    } else {
        list = credentialList.filter(c => c.folder == actualFolder);
    }

    for (const data of list) {
        const { entry_name, username, password, url, folder, id } = data;
        const clone = template.content.cloneNode(true);
        const itemNode = clone.querySelector('.accordion-item');
        const uid = `accordion-${idCounter++}`;

        clone.querySelector('h2').id = `accordion-heading-${uid}`;
        const btn = clone.querySelector('button[data-accordion-target]');
        btn.setAttribute('data-accordion-target', `#accordion-body-${uid}`);
        btn.setAttribute('aria-controls', `accordion-body-${uid}`);
        btn.setAttribute('aria-expanded', 'false');
        const body = clone.querySelector("div[id^='accordion-body']");
        body.id = `accordion-body-${uid}`;
        body.setAttribute('aria-labelledby', `accordion-heading-${uid}`);

        const inputs = clone.querySelectorAll('input');
        clone.querySelector('#entry_name').textContent = entry_name;
        inputs[0].value = username;
        inputs[1].value = password;
        inputs[2].value = url;

        clone.querySelector('button#deleteCredential').addEventListener('click', async () => {
            try {
                const user = await window.parent.api.getEmail();
                const authKey = await window.parent.api.getAuthKey();
                const auth = btoa(`${user}:${authKey}`);
                const response = await fetch(SERVER_DELETE_CREDENTIAL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
                    body: JSON.stringify({ id }),
                });
                if (response.ok) {
                    itemNode.remove();
                    window.parent.api.showSuccessModal("Credencial borrada correctamente.");
                }
                else {
                    window.parent.api.showErrorModal("Ocurrio un error al intentar borrar la credencial.");
                }
            } catch (e) { console.error(e); }
        });

        clone.querySelector('button#editCredential').addEventListener('click', () => {
            window.parent.api.showCredentialModal(true, { id, edit: true, entry_name, username, password, url, folder, foldersList });
        });

        clone.querySelector('button#copyUsername').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(username);
                window.parent.api.showSuccessModal("Nombre de usuario copiado correctamente.");
            } catch (err) {
                console.error('Error al copiar al portapapeles:', err);
            }
        });

        clone.querySelector('button#copyPassword').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(password);
                window.parent.api.showSuccessModal("Contraseña copiada correctamente.");
            } catch (err) {
                console.error('Error al copiar al portapapeles:', err);
            }
        });

        clone.querySelector('button#copyUrl').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(url);
                window.parent.api.showSuccessModal("Url copiada correctamente.");
            } catch (err) {
                console.error('Error al copiar al portapapeles:', err);
            }
        });

        credentialContainer.appendChild(clone);
    }
    document.querySelectorAll('[data-accordion-target]').forEach(btn => {
        btn.addEventListener('click', function () {
            const target = document.querySelector(this.getAttribute('data-accordion-target'));
            const expanded = this.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('[data-accordion-target]').forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                document.querySelector(b.getAttribute('data-accordion-target')).classList.add('hidden');
                b.querySelector('svg').classList.add('rotate-180');
            });
            if (!expanded) {
                this.setAttribute('aria-expanded', 'true');
                target.classList.remove('hidden');
                this.querySelector('svg').classList.remove('rotate-180');
            }
        });
    });
}

buttonContainer.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    dropdown.classList.remove('hidden');
});

buttonContainer.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => dropdown.classList.add('hidden'), 100); });

<<<<<<< HEAD
/**
 * Función para mostrar la modal para agregar una credencial.
 * @memberof module:vaultRenderer
 * 
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
function addCredential() {
    dropdown.classList.add('hidden');
    window.parent.api.showCredentialModal(true, { edit: false });
    window.parent.api.sendFolders(foldersList);
}

document.getElementById('addCredential').addEventListener('click', () => {
    addCredential();
});

<<<<<<< HEAD
/**
 * Función para mostrar la modal para agregar una carpeta.
 * @memberof module:vaultRenderer
 * 
 */
=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
function addFolder() {
    dropdown.classList.add('hidden');
    window.parent.api.showUtilitiesModal('folder', true);
}

document.getElementById('addFolder').addEventListener('click', () => {
    addFolder();
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'F2') {
        addCredential();
    } else if (event.key === 'F3') {
        addFolder();
    }
});

window.parent.api.onRefreshVault(() => getCredentials());

window.parent.api.onSaveFolder((folderName) => {
    console.log(folderName);
    foldersList.push(folderName);
    buildFolderButtons();
});

window.parent.api.onObtainAllCredentials(() => {
    window.parent.api.exportCredentials(credentialList);
});

getCredentials();