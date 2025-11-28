/* components.js */
const setActiveLink = (currentPageName) => {
    let targetPage = (currentPageName === '' || currentPageName === 'index.html') ? 'index.html' : currentPageName;
    
    // Desktop
    document.querySelectorAll('#main-menu-desktop .nav-item').forEach(link => {
        link.getAttribute('data-page') === targetPage ? link.classList.add('nav-highlight') : link.classList.remove('nav-highlight');
    });

    // Mobile
    document.querySelectorAll('#mobile-menu .mobile-nav-link').forEach(link => {
        link.classList.remove('text-red-700'); link.classList.add('text-gray-900'); // Reset
        if (link.getAttribute('data-page') === targetPage) {
            link.classList.remove('text-gray-900'); link.classList.add('text-red-700');
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
            container.innerHTML = await resp.text();
            if (eventName) document.dispatchEvent(new Event(eventName));
        } catch (err) { console.error(`Error cargando ${path}:`, err); }
    };

    const basePath = window.location.pathname.includes('/pages/') ? '../components/' : './components/';
    const pathSegments = window.location.pathname.split('/');
    const currentPage = pathSegments.pop() || 'index.html';

    // Cargar Navbar
    if (currentPage === '' || currentPage === 'index.html') {
        loadComponent('navbar-container', `${basePath}navbar.html`, 'navbar-loaded');
    } else {
        loadComponent('navbar-container', `${basePath}navbar-sticky.html`, 'navbar-sticky-loaded');
    }
    loadComponent('footer-container', `${basePath}footer.html`, 'footer-loaded');

    // LISTENER NAVBAR STICKY
    document.addEventListener('navbar-sticky-loaded', () => {
        setActiveLink(currentPage);
        // IMPORTANTE: Reiniciar lógica del menú móvil
        if (window.initMobileMenu) window.initMobileMenu();
    });

    // LISTENER NAVBAR HOME (Por si acaso)
    document.addEventListener('navbar-loaded', () => {
        setActiveLink(currentPage);
        if (window.initMobileMenu) window.initMobileMenu();
    });
});