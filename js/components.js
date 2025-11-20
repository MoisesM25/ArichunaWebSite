// Cargar HTML de componentes en contenedores específicos

// Función para establecer el enlace activo
const setActiveLink = (currentPageName) => {
    // 1. Limpiar el nombre de la página para la comparación (ej: de "index.html" o "" a "index.html")
    let targetPage = (currentPageName === '' || currentPageName === 'index.html') ? 'index.html' : currentPageName;

    // 2. Enlaces de escritorio
    const desktopLinks = document.querySelectorAll('#main-menu-desktop .nav-link');
    desktopLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        
        // Clases por defecto (zinc/gris)
        link.classList.add('text-zinc-50');
        link.classList.remove('text-red-600');

        // Aplicar clase activa
        if (linkPage === targetPage) {
            link.classList.remove('text-zinc-50'); // Quitar color por defecto
            link.classList.add('text-red-600'); // Aplicar color activo
        }
    });

    // 3. Enlaces móviles
    const mobileLinks = document.querySelectorAll('#mobile-menu .mobile-nav-link');
    mobileLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');

        // Clases por defecto (gris)
        link.classList.add('text-gray-900');
        link.classList.remove('text-red-700');

        // Aplicar clase activa
        if (linkPage === targetPage) {
            link.classList.remove('text-gray-900'); // Quitar color por defecto
            link.classList.add('text-red-700'); // Aplicar color activo (rojo más oscuro para el menú móvil)
        }
    });
};


document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = async (containerId, path, eventName = null) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const resp = await fetch(path);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const html = await resp.text();
            container.innerHTML = html;

            // Dispara evento personalizado si se especifica
            if (eventName) document.dispatchEvent(new Event(eventName));
        } catch (err) {
            console.error(`Error cargando componente ${path}:`, err);
        }
    };

    // Detectar ruta base según el nivel de la página
    const basePath = window.location.pathname.includes('/pages/')
        ? '../components/'
        : './components/';

    const pathSegments = window.location.pathname.split('/');
    const currentPage = pathSegments.pop() || 'index.html'; // Asegura que haya un nombre de archivo

    // Navbar condicional
    if (currentPage === '' || currentPage === 'index.html') {
        loadComponent('navbar-container', `${basePath}navbar.html`, 'navbar-loaded');
    } else {
        loadComponent('navbar-container', `${basePath}navbar-sticky.html`, 'navbar-sticky-loaded');
    }

    // Footer (común)
    loadComponent('footer-container', `${basePath}footer.html`, 'footer-loaded');

    // Evento: navbar sticky cargado → activar menú móvil Y establecer enlace activo
    document.addEventListener('navbar-sticky-loaded', () => {
        // Ejecutar la lógica de activación de enlace
        setActiveLink(currentPage);
        
        // Lógica de menú móvil (la que ya tenías)
        const menuButton = document.getElementById('menu-button-sticky');
        const mobileMenu = document.getElementById('mobile-menu-sticky');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    });
    
    // Si la navbar normal (no sticky) también tiene nav-link, podrías añadir un listener para 'navbar-loaded' aquí.
});