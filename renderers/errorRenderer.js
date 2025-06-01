window.api.onShowErrorMessage((msg) => {
    document.getElementById('message-content').textContent = msg;
});