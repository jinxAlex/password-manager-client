import { SERVER_CHECK_USER_URL } from '../config/config.js';

const inputEmail = document.getElementById("inputEmail")
const inputPassword = document.getElementById("inputPassword")
const alertBox = document.getElementById("alertBox")

const xhr = new XMLHttpRequest();

document.getElementById("btnLogin").addEventListener("click", (event) => {
    let email = inputEmail.value.trim();
    let password = inputPassword.value.trim();
    let alertMessage = document.getElementById("alertMessage");
    let errorMsg = "<span class='font-medium'>Error!</span> ";

    xhr.open("POST", SERVER_CHECK_USER_URL, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    if (email === "" || password === "") {

        if (email === "" && password === "") {
            errorMsg += "Por favor, ingresa tu correo y contraseña.";
        } else if (email === "") {
            errorMsg += "El campo de correo no puede estar vacío.";
        } else {
            errorMsg += "El campo de contraseña no puede estar vacío.";
        }

        alertMessage.innerHTML = errorMsg;
        alertBox.classList.remove("hidden"); // Muestra la alerta
        return;
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            if (this.responseText == "User not found") {
                errorMsg += "El correo introducido no esta en nuestro sistema";
            } else if (this.responseText == "Incorrect password") {
                errorMsg += "La contraseña introducida es incorrecta";
            } else if (this.responseText == "User found with matching password") {
                window.api.changeView("/views/index.html");
            }
            alertMessage.innerHTML = errorMsg;
            console.log(this.responseText);
            alertBox.classList.remove("hidden");
        }
    };

    // Ocultar alerta si ya no hay errores


    // Lógica para generar el hash y continuar con el login
    const hash = window.api.generateHash(email, password);

    var data = JSON.stringify({ "email": email, "password": hash });

    xhr.send(data);
    alertBox.classList.add("hidden");
});