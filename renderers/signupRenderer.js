/**
 * @file signupRenderer.js
 * @description Renderer encargado de manejar el registro de nuevos usuarios.
 * @module signupRenderer
 * @requires config/config.js
 */

import { SERVER_USER_SIGNUP } from '../config/config.js';

const inputEmail = document.getElementById("inputEmail")
const inputPassword = document.getElementById("inputPassword")
const inputRepeatPassword = document.getElementById("inputRepeatPassword")

document.getElementById("btnSignUp").addEventListener("click", handleSignUp);

/**
 * Manejador del evento cuando se hace clic en el botón de registro.
 * @async
 * @memberof module:signupRenderer
 * @param {Event} event - El evento del clic del botón.
 */
async function handleSignUp(event) {
    event.preventDefault();
    window.api.showLoadingWindow(true);

    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();
    const passwordRepeat = inputRepeatPassword.value.trim();

    if (!email || !password || !passwordRepeat) {
        window.api.showErrorModal("Por favor, complete todos los campos.");
        window.api.showLoadingWindow(false);
        return;
    }

    if (password !== passwordRepeat) {
        window.api.showErrorModal("Las contraseñas no coinciden. Por favor, inténtelo de nuevo.");
        window.api.showLoadingWindow(false);
        return;
    }

    if (password.length < 8) {
        window.api.showErrorModal("La contraseña debe tener al menos 8 caracteres.");
        window.api.showLoadingWindow(false);
        return;
    }

    try {
        await window.api.generateMasterKey(email, password);
        const authKey = await window.api.getAuthKey();

        const response = await fetch(SERVER_USER_SIGNUP, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password: authKey }),
        });

        const result = await response.text();

        if (result === "User created") {
            window.api.changeView("/views/index.html");
            window.api.showUtilitiesModal("welcome", true);
        } else {
            // Aquí deberías manejar respuestas inesperadas
            window.api.showErrorModal("Error inesperado: " + result);
        }

    } catch (error) {
        window.api.showErrorModal("Ocurrió un error al intentar registrarse. Por favor, inténtelo de nuevo más tarde.");
    } finally {
        window.api.showLoadingWindow(false);
    }
}
