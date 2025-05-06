import { SERVER_OBTAIN_USER_CREDENTIALS, SERVER_DELETE_CREDENTIAL } from '../config/config.js';

const container = document.getElementById("accordion-container");
const template = document.querySelector("template");

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

    const credentialList = await response.json();
    await fillCredentials(credentialList);
  } catch (err) {
    console.error("No se pudo obtener las credenciales:", err);
  }
}

async function fillCredentials(list) {
  container.innerHTML = "";
  if (!Array.isArray(list) || list.length === 0) {
    console.error("credentialList no es un array válido o está vacío");
    return;
  }

  let idCounter = 0;

  for (const cred of list) {
    if (!cred.salt || !cred.encryptedData) {
      console.error("Salt o encryptedData está vacío para la credencial:", cred);
      continue;
    }
    let data;

    try {
      const decryptedData = await window.parent.api.decryptCredential(cred.salt, cred.encryptedData);

      if (decryptedData) {
        data = JSON.parse(decryptedData);
        const {entry_name, username, password, url } = data;

        const clone = template.content.cloneNode(true);
        const itemNode = clone.querySelector(".accordion-item");
        const id = `accordion-${idCounter++}`;

        clone.querySelector("h2").id = `accordion-heading-${id}`;
        clone.querySelector("button").setAttribute("data-accordion-target", `#accordion-body-${id}`);
        clone.querySelector("button").setAttribute("aria-controls", `accordion-body-${id}`);
        clone.querySelector("button").setAttribute("aria-expanded", "false");
        clone.querySelector("svg[data-accordion-icon]").classList.remove("rotate-180");
        clone.querySelector("div[id^='accordion-body']").id = `accordion-body-${id}`;
        clone.querySelector("div[id^='accordion-body']").setAttribute("aria-labelledby", `accordion-heading-${id}`);

        const inputs = clone.querySelectorAll("input");
        const span = clone.querySelector('#entry_name');
        span.textContent = entry_name;
        inputs[0].value = username;
        inputs[1].value = password;
        inputs[2].value = url;

        const deleteBtn = clone.querySelector('button[id="deleteCredential"]');
        const editBtn = clone.querySelector('button[id="editCredential"]');
        deleteBtn.addEventListener("click", async () => {
          const username = await window.parent.api.getEmail();
          const authKey = await window.parent.api.getAuthKey();
          const basicAuth = btoa(`${username}:${authKey}`);
          try {
            const result = await fetch(SERVER_DELETE_CREDENTIAL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${basicAuth}`,
              },
              body: JSON.stringify({ id: cred.id }),
            });
            if (result.ok) {
              itemNode.remove();
            } else {
              console.error(`Delete failed: ${result.status} ${result.statusText}`);
            }
          } catch (e) {
            console.error("Error deleting credential:", e);
          }
        });

        editBtn.addEventListener("click", async () => {
          window.parent.api.showCredentialModal(true, {
            id : cred.id,
            edit: true,
            entry_name,
            username,
            password,
            url
          });
        });
        container.appendChild(clone);

        console.log("Credencial descifrada:", data);
      } else {
        console.error("Fallo al descifrar la credencial:", cred);
      }
    } catch (error) {
      console.error("Error al descifrar la credencial:", error);
    }
  }

  document.querySelectorAll("[data-accordion-target]").forEach((button) => {
    button.addEventListener("click", function () {
      const target = document.querySelector(this.getAttribute("data-accordion-target"));
      const expanded = this.getAttribute("aria-expanded") === "true";

      // Cerrar todos antes de abrir uno nuevo
      document.querySelectorAll("[data-accordion-target]").forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
        const panel = document.querySelector(btn.getAttribute("data-accordion-target"));
        panel.classList.add("hidden");
        btn.querySelector("svg").classList.remove("rotate-180");
      });

      // Si no estaba expandido, abrirlo
      if (!expanded) {
        this.setAttribute("aria-expanded", "true");
        target.classList.remove("hidden");
        this.querySelector("svg").classList.add("rotate-180");
      }
    });
  })
}

window.parent.api.onRefreshVault(() => {
  getCredentials();
});

document.getElementById('addCredential').addEventListener('click', () => {
  const data = { edit: false };
  window.parent.api.showCredentialModal(true, data);
});

getCredentials();

