<<<<<<< HEAD
/**
 * @file folderRenderer.js
 * @description Renderer para manejar la creación de carpetas en la aplicación.
 * @module folderRenderer
 */

const inputFolder = document.getElementById("inputFolder");

/**
 * Cierra el modal de carpeta.
 *  @memberof module:folderRenderer
 */
function closeFolderModal() {
    window.api.showUtilitiesModal("folder", false);
}

/**
 * Manejador del evento de clic en el botón "Enviar Carpeta".
 * @memberof module:folderRenderer
 */
async function handleSendFolderClick() {
    const folderName = inputFolder.value.trim();
    if (folderName !== "") {
        window.api.saveFolder(folderName);
    }
    window.api.showUtilitiesModal("folder", false);
}

document.getElementById('close-modal').addEventListener('click', closeFolderModal);
document.getElementById("sendFolder").addEventListener("click", handleSendFolderClick);
=======
const inputFolder = document.getElementById("inputFolder");


document.getElementById('close-modal').addEventListener('click', () => {
    window.api.showUtilitiesModal("folder", false);
});

document.getElementById("sendFolder").addEventListener("click", async function() {
    const folderName = inputFolder.value.trim();
    if(folderName != ""){
        window.api.saveFolder(folderName);
    }
    window.api.showUtilitiesModal("folder", false);
});
>>>>>>> 8ff2a7f5cff9dfa84f4f5fccbad592c6b663bfd2
