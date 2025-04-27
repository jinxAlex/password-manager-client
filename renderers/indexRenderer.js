document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.querySelector('iframe[name="content"]');

  document.querySelectorAll('a[target="content"]').forEach(link => {
    link.addEventListener("click", event => {
      const destino = link.href;
      let actual;
      try {
        actual = iframe.contentWindow.location.href;
      } catch (error) {
        actual = iframe.src;
      }

      if (destino === actual) {
        event.preventDefault();
      }
    });
  });
});