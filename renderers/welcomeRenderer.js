const btnClose = document.getElementById('close-modal');

btnClose.addEventListener('click', () => {
    window.api.showUtilitiesModal("password", false);
});