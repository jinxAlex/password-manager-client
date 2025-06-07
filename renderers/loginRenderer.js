/**
 * @file loginRenderer.js
 * @module loginRenderer
 * @description Renderer para la ventana de inicio de sesión. Maneja la lógica de autenticación del usuario, incluyendo la validación de campos y la comunicación con el servidor.
 * @requires config/config.js
 */

import { SERVER_USER_LOGIN } from '../config/config.js';

const inputEmail = document.getElementById("inputEmail");
const inputPassword = document.getElementById("inputPassword");

/**
 * Valida los datos introducidos por el usuario en los campos de correo electrónico y contraseña.
 * @memberof module:loginRenderer
 * @param {string} email - El correo electrónico introducido por el usuario.
 * @param {string} password - La contraseña introducida por el usuario.
 * @returns {boolean} - Devuelve true si ambos campos son válidos (no están vacíos), de lo contrario muestra un mensaje de error y devuelve false.
 * 
 */
function validateInput(email, password) {
    let isValid = true;
    if (email === "" || password === "") {
        if (email === "" && password === "") {
            window.api.showErrorModal("Por favor, ingrese su correo y contraseña.");
        } else if (email === "") {
            window.api.showErrorModal("El campo de correo no puede estar vacío.");
        } else {
            window.api.showErrorModal("El campo de contraseña no puede estar vacío.");
        }
        isValid =  false;
        window.api.showLoadingWindow(false);
    }
    return isValid;
}

/**
 * Logea al usuario utilizando el correo electrónico y la contraseña proporcionados. Valida los campos de entrada, genera una clave maestra y se comunica con el servidor para autenticar al usuario.
 * @async
 * @memberof module:loginRenderer
 * @returns {boolean} - Devuelve true si ambos campos son válidos (no están vacíos), de lo contrario muestra un mensaje de error y devuelve false.
 * 
 */
async function login(){
    window.api.showLoadingWindow(true);
    let email = inputEmail.value.trim();
    let password = inputPassword.value.trim();

    if(!validateInput(email,password)) return;

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

        switch (result) {
            case "User not found":
                window.api.showErrorModal("El correo introducido no está en nuestro sistema.");
                break;
            case "Incorrect password":
                window.api.showErrorModal("La contraseña introducida es incorrecta.");
                break;
            case "User found with matching password":
                window.api.showLoadingWindow(false);
                window.api.changeView("/views/index.html");
                return;
            default:
                window.api.showErrorModal("Respuesta inesperada del servidor. Por favor, inténtelo de nuevo más tarde.");
        }
        
    } catch (error) {
        console.error("Error al intentar iniciar sesión:", error);
        window.api.showErrorModal("No se pudo conectar con el servidor. Intentelo de nuevo más tarde");
    }finally{
        window.api.showLoadingWindow(false);
    }

}

/**
 * Asocia el evento click del botón de login para iniciar el proceso de autenticación.
 * @memberof module:loginRenderer
 */
document.getElementById("btnLogin").addEventListener("click", async (event) => {
    event.preventDefault();
    login()
});