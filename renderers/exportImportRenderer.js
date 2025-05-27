import { SERVER_DELETE_CREDENTIAL, SERVER_ADD_CREDENTIAL } from '../config/config.js';

const actionRadios = document.querySelectorAll('input[name="actionType"]');
const confirmRadios = document.querySelectorAll('input[name="confirmationType"]');
const exceuteButton = document.getElementById('executeAction');

function checkSelections() {
  const actionSelected = !!document.querySelector('input[name="actionType"]:checked');
  const confirmSelected = !!document.querySelector('input[name="confirmationType"]:checked');
  exceuteButton.disabled = !(actionSelected && confirmSelected);
}

[...actionRadios, ...confirmRadios].forEach(radio =>
  radio.addEventListener('change', checkSelections)
);

function getSelectedValue(groupName) {
  const checked = document.querySelector(`input[name="${groupName}"]:checked`);
  return checked ? checked.value : null;
}

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
}

async function importCredentials() {
  const credentialList = await window.api.importJSON()
  if (!credentialList) {
    window.api.showErrorModal("No se pudo importar el archivo JSON. Asegurese de que sea un archivo valido.");
    return;
  }

  for (const credential of credentialList) {
    addCredential(credential);
  }
  checkToDeleteCredentials()
}

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

window.api.onExportCredentials(async (credentialList) => {
  const success = await window.api.exportJSON(credentialList)
  if (success) {
    window.api.showSuccessModal("Se exportaron las credenciales correctamente.");
    checkToDeleteCredentials();
  } else {
    window.api.showErrorModal("Ocurrio un problema al exportar las credenciales.");
  }
});

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


document.getElementById('close-modal').addEventListener('click', async () => {
  window.api.showUtilitiesModal("export/import", false);
})