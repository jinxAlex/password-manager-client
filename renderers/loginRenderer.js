import { SERVER_USER_LOGIN } from '../config/config.js';

const inputEmail = document.getElementById("inputEmail")
const inputPassword = document.getElementById("inputPassword")
const alertBox = document.getElementById("alertBox")
const alertMessage = document.getElementById("alertMessage");

document.getElementById("btnLogin").addEventListener("click", async (event) => {
    event.preventDefault();

    let email = inputEmail.value.trim();
    let password = inputPassword.value.trim();

    let errorMsg = "<span class='font-medium'>Error!</span> ";

    if (email === "" || password === "") {
        if (email === "" && password === "") {
            errorMsg += "Por favor, ingresa tu correo y contraseña.";
        } else if (email === "") {
            errorMsg += "El campo de correo no puede estar vacío.";
        } else {
            errorMsg += "El campo de contraseña no puede estar vacío.";
        }

        alertMessage.innerHTML = errorMsg;
        alertBox.classList.remove("hidden");
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

        const result = await response.text(); // o .json() si es JSON

        if (result === "User not found") {
            errorMsg += "El correo introducido no está en nuestro sistema.";
        } else if (result === "Incorrect password") {
            errorMsg += "La contraseña introducida es incorrecta.";
        } else if (result === "User found with matching password") {
            window.api.changeView("/views/index.html");
            return;
        }

        alertMessage.innerHTML = errorMsg;
        alertBox.classList.remove("hidden");
    } catch (error) {
        console.error("Error al intentar iniciar sesión:", error);
        alertMessage.innerHTML = "<span class='font-medium'>Error!</span> No se pudo conectar con el servidor.";
        alertBox.classList.remove("hidden");
    }
});