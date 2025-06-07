/**
 * @file welcomeRenderer.js
 * @description Renderizador para la pantalla de bienvenida de BlackVault. Maneja la lógica de UI para cerrar la modal de utilidades de contraseñas.
 * @module welcomeRenderer
 */

const btnClose = document.getElementById('close-modal');

btnClose.addEventListener('click', () => {
    window.api.showUtilitiesModal("password", false);
});