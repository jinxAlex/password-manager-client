/**
 * @file loginRenderer.js
 * @description Renderer para la ventana de inicio de sesión. Maneja la lógica de autenticación del usuario, incluyendo la validación de campos y la comunicación con el servidor.
 * @requires config/config.js
 */

import { SERVER_USER_LOGIN } from '../config/config.js';

const inputEmail = document.getElementById("inputEmail");
const inputPassword = document.getElementById("inputPassword");

document.getElementById("btnLogin").addEventListener("click", async (event) => {
    event.preventDefault();
    window.api.showLoadingWindow(true);
    let email = inputEmail.value.trim();
    let password = inputPassword.value.trim();

    if (email === "" || password === "") {
        if (email === "" && password === "") {
            window.api.showErrorModal("Por favor, ingrese su correo y contraseña.");
        } else if (email === "") {
            window.api.showErrorModal("El campo de correo no puede estar vacío.");
        } else {
            window.api.showErrorModal("El campo de contraseña no puede estar vacío.");
        }
        window.api.showLoadingWindow(false);
        return;
    }

    await window.api.generateMasterKey(email, password);
    const authKey = await window.api.getAuthKey();

    try {
        const response = await fetch(SERVER_USER_LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password: authKey }),
        });
        const result = await response.text();

        if (result === "User not found") {
            window.api.showErrorModal("El correo introducido no está en nuestro sistema.");
        } else if (result === "Incorrect password") {
            window.api.showErrorModal("La contraseña introducida es incorrecta.");
        } else if (result === "User found with matching password") {
            window.api.changeView("/views/index.html");
            return;
        }
    } catch (error) {
        console.error("Error al intentar iniciar sesión:", error);
        window.api.showErrorModal("No se pudo conectar con el servidor. Intentelo de nuevo más tarde");
    }
    window.api.showLoadingWindow(false);
});