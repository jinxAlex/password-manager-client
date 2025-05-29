// Esperamos a que se cargue
document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.querySelector('iframe[name="content"]');
  const btn = document.getElementById("btnHerramientas");
  const menu = document.getElementById("dropdown");
  const generatePassword = document.getElementById("generatePassword");
  const exportOrimport = document.getElementById("export/import");

  document.querySelectorAll('a[target="content"]').forEach(link => {
    link.addEventListener("click", event => {
      const destination = link.href;
      let actual;
      try {
        actual = iframe.contentWindow.location.href;
      } catch (error) {
        actual = iframe.src;
      }

      if (destination === actual) {
        event.preventDefault();
      }
    });
  });
  
  btn.addEventListener("click", function() {
    menu.classList.toggle("hidden");
    if (!menu.classList.contains("hidden")) {
      document.getElementById("svg").classList.add("rotate-180");
    }else{
      document.getElementById("svg").classList.remove("rotate-180");
    }
  });

  generatePassword.addEventListener("click", function() {
    window.api.showUtilitiesModal("password", true);
  });

  exportOrimport.addEventListener("click", function() {
    window.api.showUtilitiesModal("export/import", true);
  });
});

window.parent.api.onShowOverlay(() => {
  
  const overlay = document.getElementById("overlay");

  if (overlay.classList.contains("hidden")) {
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
  
});