<<<<<<< HEAD
/**
 * @file welcomeRenderer.js
 * @description Renderizador para la pantalla de bienvenida de BlackVault. Maneja la lógica de UI para cerrar la modal de utilidades de contraseñas.
 * @module welcomeRenderer
 */

=======
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
const btnClose = document.getElementById('close-modal');

btnClose.addEventListener('click', () => {
    window.api.showUtilitiesModal("password", false);
});