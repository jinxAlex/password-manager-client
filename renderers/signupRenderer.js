import { SERVER_USER_SIGNUP } from '../config/config.js';

const inputEmail = document.getElementById("inputEmail")
const inputPassword = document.getElementById("inputPassword")
const inputRepeatPassword = document.getElementById("inputRepeatPassword")
const alertBox = document.getElementById("alertBox")
const alertMessage = document.getElementById("alertMessage");


document.getElementById("btnSignUp").addEventListener("click", async (event) => {
    event.preventDefault();

    let email = inputEmail.value.trim();
    let password = inputPassword.value.trim();
    let passwordRepeat = inputPassword.value.trim();

    if(password == passwordRepeat){
        await window.api.generateMasterKey(email, password);
        const authKey = await window.api.getAuthKey();
    
        try {
                const response = await fetch(SERVER_USER_SIGNUP, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password: authKey }),
                });
        
                const result = await response.text();
                if(result == "User created"){
                    window.api.changeView("/views/index.html");
                }
            } catch (error) {
                console.error("Error al intentar iniciar sesión:", error);
                alertMessage.innerHTML = "<span class='font-medium'>Error!</span> No se pudo conectar con el servidor.";
                alertBox.classList.remove("hidden");
            }
    }
});