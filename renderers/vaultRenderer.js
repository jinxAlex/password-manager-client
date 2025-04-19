import { SERVER_OBTAIN_USER_CREDENTIALS } from '../config/config.js';

const container = document.getElementById("accordion-container");
const template = document.querySelector("template");

const xhr = new XMLHttpRequest();
let credentialList = [];

async function getCredentials() {
    const username = "VioletSorrengail@gmail.com";
    const authKey = await window.parent.api.getAuthKey();
    const basicAuth = btoa(`${username}:${authKey}`);

    xhr.open("POST", SERVER_OBTAIN_USER_CREDENTIALS, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Basic ${basicAuth}`);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const credential = JSON.parse(this.responseText);
            credentialList = credential;
            console.log(credentialList);
            fillCredentials();
        }
    };

    const data = JSON.stringify({ email: username });
    xhr.send(data);
}

async function fillCredentials() {
    if (!Array.isArray(credentialList) || credentialList.length === 0) {
        console.error("credentialList no es un array válido o está vacío");
        return;
    }

    let idCounter = 0;

    for (const cred of credentialList) {
        if (!cred.salt || !cred.encryptedData) {
            console.error("Salt o encryptedData está vacío para la credencial:", cred);
            continue;
        }

        try {
            const decryptedData = await window.parent.api.decryptCredential(cred.salt, cred.encryptedData);

            if (decryptedData) {
                const data = JSON.parse(decryptedData);
                const { entry_name, username, password, url } = data;

                const clone = template.content.cloneNode(true);
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
    });

}

getCredentials();