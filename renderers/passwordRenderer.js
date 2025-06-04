/**
 * @file passwordRenderer.js
 * @description Renderizador encargado de generar contraseñas aleatorias según el tipo y longitud seleccionada.
 * @module passwordRenderer
 */

const options = [
    document.getElementById('basicOption'),
    document.getElementById('intermediateOption'),
    document.getElementById('advancedOption'),
];

let isRequired = false;

const rangeInput = document.getElementById('labels-range-input');
const outputInput = document.getElementById('inputPassword');
const btnClose = document.getElementById('close-modal');
const lengthLabel = document.getElementById('lengthLabel');

/**
 * Devuelve el tipo de contraseña seleccionado.
 * @memberof module:exportImportRenderer
 * @returns {string|null} - El tipo de contraseña seleccionado ('basic', 'intermediate', 'advanced') o null si no hay ninguno seleccionado.
 * 
 */
function getSelectedType() {
    const selected = Array.from(options).find(opt => opt.checked);
    return selected ? selected.value : null;
}

/**
 * Genera una contraseña aleatoria basada en el tipo y longitud seleccionada, esta contraseña se muestra en el campo de entrada.
 * @memberof module:exportImportRenderer
 * 
 */
function generatePassword() {
    const type = getSelectedType();
    const length = parseInt(rangeInput.value, 10);
    lengthLabel.textContent = length;
    if (!type) {
        outputInput.value = '';
        return;
    }

    let charset = '';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';

    switch (type) {
        case 'basic': // Básica
            charset = lower;
            break;
        case 'intermediate': // Intermedia
            charset = lower + upper + digits;
            break;
        case 'advanced': // Avanzada
            charset = lower + upper + digits + symbols;
            break;
        default:
            charset = lower;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    outputInput.value = password;
}

// Al iniciar generamos una contraseña básica
options[0].checked = true;
generatePassword();

/**
 * Envia la contraseña generada a la modal de la credencial si esta ha sido solicitida, si no
 * @memberof module:exportImportRenderer
 * 
 */
function sendPassword() {
    let password = outputInput.value.trim();
    if(isRequired && password != ""){
        window.api.sendMessage("generated-password", password);
    }
    window.api.showUtilitiesModal("password", false);


}


/**
 * Cierra el modal de generación de contraseñas
 * @memberof module:exportImportRenderer
 * 
 */
function closeModal() {
    window.api.showUtilitiesModal("password", false);
}

document.addEventListener("DOMContentLoaded", () => {
    options.forEach(option => {
        option.addEventListener('change', () => {
            generatePassword();
        });
    });
    rangeInput.addEventListener('input', generatePassword);

    document.getElementById('acceptPassword').addEventListener('click', sendPassword);
    btnClose.addEventListener('click', closeModal);
});

window.api.onGeneratePasswordToCredential(() => {
    isRequired = true;
});






