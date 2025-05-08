const options = [
    document.getElementById('basicOption'),
    document.getElementById('intermediateOption'),
    document.getElementById('advancedOption'),
];

let isRequired = false;

const rangeInput = document.getElementById('labels-range-input');
const outputInput = document.getElementById('inputPassword');
const btnClose = document.getElementById('close-modal');

// Asegura selección única y genera contraseña al cambiar
options.forEach(option => {
    option.addEventListener('change', () => {
        generatePassword();
    });
});

// Genera contraseña al cambiar la longitud
rangeInput.addEventListener('input', generatePassword);

// Función para obtener la opción seleccionada
function getSelectedType() {
    const selected = Array.from(options).find(opt => opt.checked);
    return selected ? selected.value : null;
}

// Generador de contraseña aleatoria según tipo y longitud
function generatePassword() {
    const type = getSelectedType();
    const length = parseInt(rangeInput.value, 10);
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

document.getElementById('acceptPassword').addEventListener('click', event => {
    let password = outputInput.value.trim();
    if(isRequired && password != ""){
        console.log(password)
        window.api.sendMessage("generated-password", password);
    }
    window.api.showUtilitiesModal("password", false);

});

btnClose.addEventListener('click', () => {
    window.api.showUtilitiesModal("password", false);
});


window.api.onGeneratePasswordToCredential(() => {
    isRequired = true;
});