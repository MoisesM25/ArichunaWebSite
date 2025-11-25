// Función para establecer el enlace activo
const setActiveLink = (currentPageName) => {
    // 1. Normalizar nombre de página
    let targetPage = (currentPageName === '' || currentPageName === 'index.html') ? 'index.html' : currentPageName;

    // 2. Enlaces de Escritorio (Usa la nueva clase nav-highlight)
    const desktopLinks = document.querySelectorAll('#main-menu-desktop .nav-item');
    desktopLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        
        // Si coincide la página, agrega el efecto de resaltado (subrayado rojo + lift)
        // Si no, lo quita.
        if (linkPage === targetPage) {
            link.classList.add('nav-highlight');
        } else {
            link.classList.remove('nav-highlight');
        }
    });

    // 3. Enlaces Móviles (Mantiene lógica de colores Tailwind original)
    const mobileLinks = document.querySelectorAll('#mobile-menu .mobile-nav-link');
    mobileLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');

        // Resetear a estilo base
        link.classList.add('text-gray-900');
        link.classList.remove('text-red-700');

        // Aplicar estilo activo móvil
        if (linkPage === targetPage) {
            link.classList.remove('text-gray-900'); 
            link.classList.add('text-red-700'); 
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Función de carga dinámica
    const loadComponent = async (containerId, path, eventName = null) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        try {
            const resp = await fetch(path);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const html = await resp.text();
            container.innerHTML = html;
            if (eventName) document.dispatchEvent(new Event(eventName));
        } catch (err) {
            console.error(`Error cargando componente ${path}:`, err);
        }
    };

    // Detectar ruta
    const basePath = window.location.pathname.includes('/pages/') ? '../components/' : './components/';
    const pathSegments = window.location.pathname.split('/');
    const currentPage = pathSegments.pop() || 'index.html';

    // Cargar Navbar según corresponda
    if (currentPage === '' || currentPage === 'index.html') {
        loadComponent('navbar-container', `${basePath}navbar.html`, 'navbar-loaded');
    } else {
        loadComponent('navbar-container', `${basePath}navbar-sticky.html`, 'navbar-sticky-loaded');
    }

    // Cargar Footer
    loadComponent('footer-container', `${basePath}footer.html`, 'footer-loaded');

    // Listener para Navbar Sticky
    document.addEventListener('navbar-sticky-loaded', () => {
        // ACTIVAR ENLACE (Aplica el efecto visual)
        setActiveLink(currentPage);
        
        // Lógica menú móvil
        const menuButton = document.getElementById('menu-button'); // ID corregido para coincidir con tu HTML
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
            });
            // Cerrar al hacer click fuera
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    });
});