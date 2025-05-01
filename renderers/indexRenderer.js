document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.querySelector('iframe[name="content"]');
  const btn = document.getElementById('btnHerramientas');
  const menu = document.getElementById('dropdown');

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
  
  btn.addEventListener('click', function() {
    // Alterna la visibilidad
    menu.classList.toggle('hidden');
    
    // Opcional: actualizar aria-expanded
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
  });
});