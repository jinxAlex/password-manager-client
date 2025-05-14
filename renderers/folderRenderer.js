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