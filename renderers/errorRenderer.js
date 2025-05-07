window.electron.onShowErrorMessage((message) => {
    const messageDiv = document.getElementById('message-content');
    messageDiv.textContent = message;
});