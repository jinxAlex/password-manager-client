document.addEventListener("DOMContentLoaded", function () {
    const accordionContainer = document.getElementById("accordion-container");

    // Datos de los acordeones (puedes cambiar o cargar dinámicamente)
    const accordionData = [
        { title: "What is Flowbite?", content: "URL:" },
        { title: "Why use Tailwind CSS?", content: "Tailwind CSS provides utility classes that help developers build modern and responsive UI quickly." },
        { title: "Is Flowbite free?", content: "Yes, Flowbite is free and open-source, but it also offers premium components and templates." }
    ];

    // Función para crear un acordeón
    function createAccordion(id, title, content) {
        return `
        <div class="accordion-item p-5">
            <h2 id="accordion-heading-${id}">
                <button type="button"
                    class="flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                    data-accordion-target="#accordion-body-${id}" aria-expanded="false"
                    aria-controls="accordion-body-${id}">
                    <span>${title}</span>
                    <svg data-accordion-icon class="w-3 h-3 shrink-0 transition-transform transform rotate-0"
                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5 5 1 1 5" />
                    </svg>
                </button>
            </h2>
<div id="accordion-body-${id}" class="hidden pt-2" aria-labelledby="accordion-heading-${id}">
    <div class="p-5 grid grid-cols-4 gap-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg">
        
        <!-- Nombre de usuario -->
        <div class="flex items-center text-gray-500 dark:text-gray-400">
            <div class="flex items-center">
                <span class="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900  border border-gray-300 rounded-s-lg dark:text-white dark:border-gray-600">Usuario</span>
                <div class="relative w-full">
                    <input id="website-url" type="text" aria-describedby="helper-text-explanation" class=" border border-e-0 border-gray-300 text-gray-500 dark:text-gray-400 text-sm border-s-0 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="https://flowbite.com" readonly disabled />
                </div>
                <button data-tooltip-target="tooltip-website-url" data-copy-to-clipboard-target="website-url" class="shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-e-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 border border-blue-700 dark:border-blue-600 hover:border-blue-800 dark:hover:border-blue-700" type="button">
                    <span id="default-icon">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
                        </svg>
                    </span>
                    <span id="success-icon" class="hidden">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                        </svg>
                    </span>
                </button>
                <div id="tooltip-website-url" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    <span id="default-tooltip-message">Copy link</span>
                    <span id="success-tooltip-message" class="hidden">Copied!</span>
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </div>
        </div>
        
        <!-- Contraseña -->
        <div class="flex items-center text-gray-500 dark:text-gray-400">
            <div class="flex items-center">
                <span class="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900  border border-gray-300 rounded-s-lg dark:text-white dark:border-gray-600">Contraseña</span>
                <div class="relative w-full">
                    <input id="website-url" type="text" aria-describedby="helper-text-explanation" class=" border border-e-0 border-gray-300 text-gray-500 dark:text-gray-400 text-sm border-s-0 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="https://flowbite.com" readonly disabled />
                </div>
                <button data-tooltip-target="tooltip-website-url" data-copy-to-clipboard-target="website-url" class="shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-e-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 border border-blue-700 dark:border-blue-600 hover:border-blue-800 dark:hover:border-blue-700" type="button">
                    <span id="default-icon">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
                        </svg>
                    </span>
                    <span id="success-icon" class="hidden">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                        </svg>
                    </span>
                </button>
                <div id="tooltip-website-url" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    <span id="default-tooltip-message">Copy link</span>
                    <span id="success-tooltip-message" class="hidden">Copied!</span>
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </div>
        </div>
        
        <div class="flex items-center text-gray-500 dark:text-gray-400">
            <div class="flex items-center">
                <span class="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900  border border-gray-300 rounded-s-lg dark:text-white dark:border-gray-600">URL</span>
                <div class="relative w-full">
                    <input id="website-url" type="text" aria-describedby="helper-text-explanation" class=" border border-e-0 border-gray-300 text-gray-500 dark:text-gray-400 text-sm border-s-0 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="https://flowbite.com" readonly disabled />
                </div>
                <button data-tooltip-target="tooltip-website-url" data-copy-to-clipboard-target="website-url" class="shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-e-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 border border-blue-700 dark:border-blue-600 hover:border-blue-800 dark:hover:border-blue-700" type="button">
                    <span id="default-icon">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
                        </svg>
                    </span>
                    <span id="success-icon" class="hidden">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                        </svg>
                    </span>
                </button>
                <div id="tooltip-website-url" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    <span id="default-tooltip-message">Copy link</span>
                    <span id="success-tooltip-message" class="hidden">Copied!</span>
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </div>
        </div>
        </div>`;
    }

    // Insertar acordeones en el contenedor
    accordionData.forEach((item, index) => {
        accordionContainer.innerHTML += createAccordion(index + 1, item.title, item.content);
    });

    // Activar funcionalidad del acordeón
    document.querySelectorAll("[data-accordion-target]").forEach((button) => {
        button.addEventListener("click", function () {
            const target = document.querySelector(this.getAttribute("data-accordion-target"));
            const expanded = this.getAttribute("aria-expanded") === "true";

            // Cerrar todos antes de abrir uno nuevo
            document.querySelectorAll("[data-accordion-target]").forEach((btn) => {
                btn.setAttribute("aria-expanded", "false");
                const panel = document.querySelector(btn.getAttribute("data-accordion-target"));
                panel.classList.add("hidden");
                btn.querySelector("svg").classList.remove("rotate-180");
            });

            // Si no estaba expandido, abrirlo
            if (!expanded) {
                this.setAttribute("aria-expanded", "true");
                target.classList.remove("hidden");
                this.querySelector("svg").classList.add("rotate-180");
            }
        });
    });
});
