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

async function getCredentials() {
  try {
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
}

async function processCredentials(encryptedList) {
  credentialList = [];
  foldersList = [];
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
    if(folderName != ""){
      const btn = createFolderButton(capitalizeFirst(folderName), "../../resources/menu/folder.webp", baseClasses);
      btn.addEventListener('click', () => {
        actualFolder = folderName;
        renderCredentials();
      });
      foldersContainer.appendChild(btn);
    }
  });
}

function renderCredentials() {
  credentialContainer.innerHTML = '';
  let idCounter = 0;
  let list;
  console.log(actualFolder);
  if (actualFolder == "Todos") {
    list = credentialList.slice();
  } else {
    list = credentialList.filter(c => c.folder == actualFolder);
  }

  console.log(list);

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
    clone.querySelector("svg[data-accordion-icon]").classList.remove("rotate-180");
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
        const key = await window.parent.api.getAuthKey();
        const auth = btoa(`${user}:${key}`);
        const res = await fetch(SERVER_DELETE_CREDENTIAL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
          body: JSON.stringify({ id }),
        });
        if (res.ok) itemNode.remove();
        else console.error('Delete failed', res.statusText);
      } catch (e) { console.error(e); }
    });

    clone.querySelector('button#editCredential').addEventListener('click', () => {
      window.parent.api.showCredentialModal(true, { id, edit: true, entry_name, username, password, url, folder, foldersList });
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
        b.querySelector('svg').classList.remove('rotate-180');
      });
      if (!expanded) {
        this.setAttribute('aria-expanded', 'true');
        target.classList.remove('hidden');
        this.querySelector('svg').classList.add('rotate-180');
      }
    });
  });
}

buttonContainer.addEventListener('mouseenter', () => { 
  clearTimeout(hideTimeout); 
  dropdown.classList.remove('hidden'); 
});

buttonContainer.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => dropdown.classList.add('hidden'), 100); });

document.getElementById('addCredential').addEventListener('click', () => { 
  dropdown.classList.add('hidden'); 
  window.parent.api.showCredentialModal(true, { edit: false }); 
  window.parent.api.sendFolders(foldersList);
});

document.getElementById('addFolder').addEventListener('click', () => { 
  dropdown.classList.add('hidden'); 
  window.parent.api.showUtilitiesModal('folder', true); 
});

window.parent.api.onRefreshVault(() => getCredentials());

window.parent.api.onSaveFolder((folderName) => {
  console.log(folderName);
  foldersList.push(folderName);
  buildFolderButtons();
});

getCredentials();