/* main.js - comprimido y seccional */
/* main.js */

// 1. FUNCIÓN GLOBAL MENU (Accesible desde components.js)
window.initMobileMenu = function() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuButton = document.getElementById('menu-button');
  
  if (!menuButton || !mobileMenu) return; // Salir si no existen elementos

  // Eliminar clonando para evitar listeners duplicados al recargar
  const newBtn = menuButton.cloneNode(true);
  menuButton.parentNode.replaceChild(newBtn, menuButton);
  const activeBtn = newBtn;

  const showMenu = () => {
    mobileMenu.classList.remove('hidden');
    requestAnimationFrame(() => mobileMenu.classList.add('active'));
    activeBtn.setAttribute('aria-expanded', 'true');
  };
  const hideMenu = () => {
    mobileMenu.classList.remove('active');
    setTimeout(() => { if (!mobileMenu.classList.contains('active')) mobileMenu.classList.add('hidden'); }, 250);
    activeBtn.setAttribute('aria-expanded', 'false');
  };

  activeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.contains('hidden') ? showMenu() : hideMenu();
  });

  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !activeBtn.contains(e.target) && !mobileMenu.classList.contains('hidden')) hideMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('active');
      activeBtn.setAttribute('aria-expanded', 'false');
    }
  });
};

// 2. INIT SCRIPTS GENERALES
function initPageScripts() {
  const header = document.getElementById('main-header');
  const scrollThreshold = 50;

  // Lógica Sticky y Padding
  const updateBodyPadding = () => {
    if(!header) return;
    if (window.scrollY > scrollThreshold) {
      header.classList.add('header-scrolled-state');
      document.body.style.paddingTop = '80px';
    } else {
      // Solo quitar si NO estamos en página interna que fuerza el sticky
      if (!window.location.pathname.includes('/pages/')) { 
         header.classList.remove('header-scrolled-state');
         document.body.style.paddingTop = '130px';
      }
    }
  };
  window.addEventListener('scroll', updateBodyPadding);
  updateBodyPadding();

  // Intentar cargar menú (para el index estático)
  window.initMobileMenu();

  /* 4. CARRUSEL PRINCIPAL */
  (function(){
    const slidesContainer=document.getElementById('carousel-slides'); if(!slidesContainer) return;
    const slides=Array.from(slidesContainer.children), total=slides.length;
    const indicatorsContainer=document.getElementById('carousel-indicators'), btnPrev=document.getElementById('prev-button'), btnNext=document.getElementById('next-button');
    let idx=0, intervalId=null; const INTERVAL=5e3, IMAGE_TRANS_MS=700;
    const go=i=>{idx=(i+total)%total;slidesContainer.style.transform=`translateX(${-idx*100}%)`;slides.forEach(s=>s.classList.remove('is-active'));setTimeout(()=>slides[idx]&&slides[idx].classList.add('is-active'),Math.max(0,IMAGE_TRANS_MS-100));
      if(indicatorsContainer) indicatorsContainer.querySelectorAll('button').forEach((b,j)=>{b.classList.toggle('opacity-100',j===idx);b.classList.toggle('opacity-50',j!==idx);});};
    const next=()=>go(idx+1), prev=()=>go(idx-1), start=()=>{clearInterval(intervalId);intervalId=setInterval(next,INTERVAL);};
    if(indicatorsContainer){indicatorsContainer.innerHTML='';for(let i=0;i<total;i++){const b=document.createElement('button');b.className='w-3 h-3 rounded-full bg-white opacity-50 transition-opacity duration-300 shadow-md';b.type='button';b.addEventListener('click',()=>{go(i);start();});indicatorsContainer.appendChild(b);}}
    if(btnNext) btnNext.addEventListener('click',()=>{next();start();}); if(btnPrev) btnPrev.addEventListener('click',()=>{prev();start();});
    slides[0]&&slides[0].classList.add('is-active'); go(0); start();
  })();

/* GESTIÓN DE ANIMACIONES DE SCROLL (fade-section y Logo) */
(function() {
    // 1. Configurar el observador
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // La sección ha entrado en la vista
                entry.target.classList.add('visible');
                
                // 2. Lógica para el logo (Se dispara inmediatamente después de que la sección sea visible)
                if (entry.target.id === 'sobre-nosotros') {
                    const logo = document.getElementById('logo-sobre-nosotros');
                    if (logo) {
                        logo.classList.add('animate-in');
                    }
                }
                
                // 3. Dejar de observar esta sección, ya animó
                observer.unobserve(entry.target);
            }
        });
    }, {
        // La animación se activa cuando el 10% de la sección es visible
        threshold: 0.1 
    });

    // 4. Observar todas las secciones que tengan la clase 'fade-section'
    const sections = document.querySelectorAll('.fade-section');
    sections.forEach(section => {
        observer.observe(section);
    });
})();

  /* 5. MINI CARRUSEL DE PRODUCTOS - 3D/CIRCULAR (REFACTORIZADO) */
(function(){
    const TOTAL_PRODUCTS=16;
    // MODIFICACIÓN: Se agrega la estructura del botón "Ver Producto"
    const createProductCard=i=>`
        <article class="product-card flex-shrink-0" data-index="${i}">
            <div class="card-media rounded-2xl overflow-hidden">
                <img src="img/productos/producto-(${i+1}).png" alt="Producto ${i+1}" class="w-full h-[28rem] md:h-[32rem] object-contain transition-transform duration-700 ease-in-out transform rounded-2xl">
            </div>
            <div class="view-product-button-wrapper">
                <button type="button" class="view-product-button">Ver producto</button>
            </div>
        </article>
    `;
    
    const root=document.getElementById('mini-carrusel-productos-wrapper'); if(!root) return;
    const track=root.querySelector('.carousel-track'); if(!track) return;
    track.innerHTML=Array.from({length:TOTAL_PRODUCTS},(_,i)=>createProductCard(i)).join('');
    
    const cards=Array.from(root.querySelectorAll('.product-card'));
    const btnPrev=root.querySelector('#products-prev'), btnNext=root.querySelector('#products-next'), dotsWrap=root.querySelector('.carousel-dots');
    let index=0, autoplayId=null, AUTOPLAY_MS=4200, total=cards.length;
    if(total===0) return;
    
    const modulo=(i,n)=>((i%n)+n)%n;

    function updateClasses(){
        const prev=modulo(index-1,total), next=modulo(index+1,total), prevFar=modulo(index-2,total), nextFar=modulo(index+2,total);
        cards.forEach((c,i)=>{
            let newClass='product-card'; // Clase base
            if(i===index){newClass+=' is-center';}
            else if(i===prev){newClass+=' is-prev';}
            else if(i===next){newClass+=' is-next';}
            else if(i===prevFar){newClass+=' is-prev-far';}
            else if(i===nextFar){newClass+=' is-next-far';}
            else{newClass+=' is-hidden';} // Clase para las que están 'fuera de escena'
            c.className=newClass;
            c.dataset.index=i; // Asegurarse que el índice está
        });
        dots.forEach((d,i)=>d.classList.toggle('active',i===index));
    }

    function go(i){index=modulo(i,total);updateClasses();}
    function next(){go(index+1);}
    function prev(){go(index-1);}
    function startAutoplay(){stopAutoplay(); autoplayId=setInterval(next,AUTOPLAY_MS);}
    function stopAutoplay(){if(autoplayId){clearInterval(autoplayId);autoplayId=null;}}
    function restartAutoplay(){stopAutoplay(); startAutoplay();}

    if(btnNext) btnNext.addEventListener('click',()=>{next(); restartAutoplay();});
    if(btnPrev) btnPrev.addEventListener('click',()=>{prev(); restartAutoplay();});
    root.addEventListener('mouseenter',stopAutoplay); root.addEventListener('mouseleave',startAutoplay);
    root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){next();restartAutoplay();}if(e.key==='ArrowLeft'){prev();restartAutoplay();}});

    /* Drag/Touch Simplificado */
    (function(){
        let isDown=false, startX=0, pointerId=null;
        const handlePointerDown=e=>{isDown=true;track.classList.add('dragging');startX=e.clientX;try{track.setPointerCapture(e.pointerId);pointerId=e.pointerId;}catch(err){}};
        const handlePointerMove=e=>{if(!isDown) return;e.preventDefault();};
        const handlePointerUp=e=>{
            if(!isDown) return;
            isDown=false;
            track.classList.remove('dragging');
            try{if(pointerId) track.releasePointerCapture(pointerId);pointerId=null;}catch(err){}
            const dx=e.clientX-startX;
            if(Math.abs(dx)>40){dx<0?next():prev();}
            restartAutoplay();
        };
        track.addEventListener('pointerdown',handlePointerDown);
        track.addEventListener('pointermove',handlePointerMove);
        track.addEventListener('pointerup',handlePointerUp);
        track.addEventListener('pointercancel',handlePointerUp);
    })();

    /* Dots */
    dotsWrap.innerHTML=''; for(let i=0;i<total;i++){const b=document.createElement('button');b.type='button'; if(i===0) b.classList.add('active'); b.addEventListener('click',()=>{go(i); restartAutoplay();}); dotsWrap.appendChild(b);}
    const dots=Array.from(dotsWrap.children);

    /* esperar cargas de imagen */
    const imgs=root.querySelectorAll('img'); let loaded=0;
    const initCarousel=()=>{if(loaded===imgs.length||imgs.length===0){go(0);startAutoplay();updateClasses();}else{loaded++;}};
    if(imgs.length===0){initCarousel();}
    else{imgs.forEach(img=>{if(img.complete){initCarousel();}else{img.addEventListener('load',initCarousel);img.addEventListener('error',initCarousel);}});}
    window.addEventListener('load',()=>go(0));
    setTimeout(()=>go(0),500); // Fallback por si acaso
})();

  /* 6. SOCIAL EMBEDS */
  document.querySelectorAll('.group').forEach(section=>{const iframe=section.querySelector('iframe');if(!iframe)return;iframe.style.transition='opacity .5s';iframe.style.opacity='0';
    section.addEventListener('mouseenter',()=>{iframe.style.pointerEvents='auto';iframe.style.opacity='1';});
    section.addEventListener('mouseleave',()=>{iframe.style.pointerEvents='none';iframe.style.opacity='0';setTimeout(()=>{if(iframe.style.opacity==='0'){const s=iframe.src||'';if(s.includes('instagram.com')||s.includes('tiktok.com')||s.includes('facebook.com')){iframe.src='';setTimeout(()=>iframe.src=s,100);}}},500);});
  });
  if(window.instgrm&&typeof window.instgrm.Embeds.process==='function') window.instgrm.Embeds.process();
}

/* 6B. ANIMACIÓN SCROLL PERSONALIZADA */
(function(){const observer=new IntersectionObserver((entries,obs)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.25});document.querySelectorAll('.fade-section').forEach(sec=>observer.observe(sec));})();

/* 6C. OBSERVADOR DE ANIMACIÓN PARA RECETAS (NUEVO) */
(function() {
    // 1. Configurar el observador
    const recipeObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // La tarjeta de receta ha entrado en la vista
                entry.target.classList.add('is-visible');
                
                // Dejar de observar esta tarjeta, ya animó
                recipeObserver.unobserve(entry.target);
            }
        });
    }, {
        // La animación se activa cuando el 20% de la tarjeta es visible
        threshold: 0.2 
    });

    // 2. Observar todas las tarjetas que tengan la clase 'animate-on-scroll'
    const recipeCards = document.querySelectorAll('.animate-on-scroll');
    recipeCards.forEach(card => {
        recipeObserver.observe(card);
    });
})();

/* 7. ANIMACIÓN FOOTER (typing) */
function startFooterAnimation(){const quoteElement=document.querySelector('.footer-quote');if(!quoteElement)return false;const originalText=quoteElement.textContent.trim();if(!originalText)return false;
  quoteElement.innerHTML='<span class="footer-quote-text"></span>';const textSpan=quoteElement.querySelector('.footer-quote-text');if(!textSpan)return false;
  const typingSpeed=80,deletingSpeed=40,pauseAfterTyping=2800,pauseAfterDeleting=500; let charIndex=0,isDeleting=false;
  function type(){const currentText=originalText.substring(0,charIndex);textSpan.textContent=currentText;quoteElement.classList.add('is-typing');
    if(!isDeleting){if(charIndex<originalText.length){charIndex++;setTimeout(type,typingSpeed);}else{isDeleting=true;quoteElement.classList.remove('is-typing');setTimeout(type,pauseAfterTyping);}}
    else{if(charIndex>0){charIndex--;setTimeout(type,deletingSpeed);}else{isDeleting=false;setTimeout(type,pauseAfterDeleting);}}}
  setTimeout(type,pauseAfterDeleting);return true;
}

/* 8. WAIT FOR ELEMENT */
function waitForElement(selector,callback,maxTries=50){let tries=0;const interval=setInterval(()=>{if(callback()){clearInterval(interval);}else if(tries>maxTries){clearInterval(interval);console.warn("[Arichuna Scripts] No se pudo iniciar la animación para '"+selector+"'.");}tries++;},100);}

/* 9. STARTUP */
document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('main-header')) initPageScripts();else document.addEventListener('navbar-loaded',initPageScripts,{once:true});waitForElement('.footer-quote',startFooterAnimation);});

// Ejecutar al cargar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageScripts);
} else {
  initPageScripts();
}

/* 11. LÓGICA DE PÁGINA DE PRODUCTOS (MODAL MÓVIL + FIX DESKTOP) */
(function() {

    // --- 1. Base de Datos ---
    const families = [
        { id: 1, name: "Jamones", icon: "img/ubicacion.png" },
        { id: 2, name: "Ahumados", icon: "img/ubicacion.png" },
        { id: 3, name: "Salchichas", icon: "img/ubicacion.png" },
        { id: 4, name: "Mortadelas", icon: "img/ubicacion.png" } 
    ];

    const productData = [
        // FAMILIA 1: JAMONES
        { id: 1, name: "Producto 1", image: "img/productos/producto-(1).png", family: 1, ingredients: "Ingrediente A...", quantities: "100g..." },
        { id: 2, name: "Producto 2", image: "img/productos/producto-(2).png", family: 1, ingredients: "Ingrediente A...", quantities: "100g..." },
        { id: 3, name: "Producto 3", image: "img/productos/producto-(3).png", family: 1, ingredients: "Ingrediente A...", quantities: "100g..." },
        { id: 4, name: "Producto 4", image: "img/productos/producto-(4).png", family: 1, ingredients: "Ingrediente A...", quantities: "100g..." },
        
        // FAMILIA 2: AHUMADOS
        { id: 5, name: "Producto 5", image: "img/productos/producto-(5).png", family: 2, ingredients: "Ingrediente A...", quantities: "100g..." },
        { id: 6, name: "Producto 6", image: "img/productos/producto-(6).png", family: 2, ingredients: "Ingrediente D...", quantities: "1L..." },
        { id: 7, name: "Producto 7", image: "img/productos/producto-(7).png", family: 2, ingredients: "Ingrediente D...", quantities: "1L..." },
        { id: 8, name: "Producto 8", image: "img/productos/producto-(8).png", family: 2, ingredients: "Ingrediente D...", quantities: "1L..." },
        
        // FAMILIA 3: SALCHICHAS
        { id: 9, name: "Producto 9", image: "img/productos/producto-(9).png", family: 3, ingredients: "Ingrediente D...", quantities: "1L..." },
        { id: 10, name: "Producto 10", image: "img/productos/producto-(10).png", family: 3, ingredients: "Ingrediente D...", quantities: "1L..." },
        { id: 11, name: "Producto 11", image: "img/productos/producto-(11).png", family: 3, ingredients: "Ingrediente F...", quantities: "Paquete..." },
        { id: 12, name: "Producto 12", image: "img/productos/producto-(12).png", family: 3, ingredients: "Ingrediente F...", quantities: "Paquete..." },
        
        // FAMILIA 4: MORTADELAS
        { id: 13, name: "Producto 13", image: "img/productos/producto-(13).png", family: 4, ingredients: "Ingrediente F...", quantities: "Paquete..." },
        { id: 14, name: "Producto 14", image: "img/productos/producto-(14).png", family: 4, ingredients: "Ingrediente F...", quantities: "Paquete..." },
        { id: 15, name: "Producto 15", image: "img/productos/producto-(15).png", family: 4, ingredients: "Ingrediente F...", quantities: "Paquete..." },
        { id: 16, name: "Producto 16", image: "img/productos/producto-(16).png", family: 4, ingredients: "Ingrediente F...", quantities: "Paquete..." }
    ];

    let accordionContainer, detailContainer, placeholder;
    let mobileModal, mobileModalContent, closeMobileModalBtn;

    // --- Generar HTML del Detalle (Reutilizable) ---
    function generateDetailHTML(product) {
        return `
            <div class="product-detail-content">
                <img src="${product.image}" alt="${product.name}" class="detail-image">
                <h2>${product.name}</h2>
                <h3>Ingredientes</h3>
                <p>${product.ingredients}</p>
                <h3>Cantidades Disponibles</h3>
                <p>${product.quantities}</p>
            </div>
        `;
    }

    // --- Renderizado del Detalle en Desktop ---
    function renderDesktopDetail(product) {
        const newHtml = generateDetailHTML(product);
        if (placeholder) { placeholder.style.display = 'none'; }
        detailContainer.style.opacity = 0;
        
        // Pequeño delay para la animación
        setTimeout(() => { 
            detailContainer.innerHTML = newHtml; 
            detailContainer.style.opacity = 1; 
            
            // Scroll al top del contenedor por si acaso estaba scrolleado
            detailContainer.scrollTop = 0;
        }, 250);
    }

    // --- Renderizado del Detalle en Móvil (Modal) ---
    function openMobileModal(product) {
        const newHtml = generateDetailHTML(product);
        mobileModalContent.innerHTML = newHtml;
        mobileModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Evitar scroll del body
    }

    function closeMobileModal() {
        mobileModal.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurar scroll
    }

    // --- Manejo del Clic en Familia (Acordeón) ---
    function handleFamilyClick(e) {
        const button = e.target.closest('.family-selector-btn');
        if (!button) return;

        const gridToToggle = button.nextElementSibling;
        if (!gridToToggle || !gridToToggle.classList.contains('product-grid-container')) return;

        button.classList.toggle('active');

        if (gridToToggle.classList.contains('visible')) {
            gridToToggle.classList.remove('visible');
            setTimeout(() => { gridToToggle.style.display = 'none'; }, 400); 
        } else {
            gridToToggle.style.display = 'grid'; 
            setTimeout(() => { gridToToggle.classList.add('visible'); }, 10);
        }
    }

    // --- Manejo del Clic en Producto (Lupa) ---
    function handleProductClick(e) {
        const lupaButton = e.target.closest('.lupa-button[data-action="view-product"]');
        if (!lupaButton) return;
        
        const card = lupaButton.closest('.product-card');
        if (!card) return;
        
        const productId = card.dataset.productId;
        const product = productData.find(p => p.id == productId);
        if (!product) return;

        // DETECCIÓN DE PANTALLA
        if (window.innerWidth >= 1024) {
            renderDesktopDetail(product);
        } else {
            openMobileModal(product);
        }
    }

    // --- Inicialización ---
    function initProductPage() {
        // Elementos Desktop
        accordionContainer = document.getElementById('accordion-container');
        detailContainer = document.getElementById('product-detail-view');
        placeholder = document.getElementById('product-detail-placeholder');

        // Elementos Móvil
        mobileModal = document.getElementById('mobile-product-modal');
        mobileModalContent = document.getElementById('mobile-modal-content');
        closeMobileModalBtn = document.getElementById('close-mobile-modal');

        if (closeMobileModalBtn) {
            closeMobileModalBtn.addEventListener('click', closeMobileModal);
        }

        // Cerrar modal al hacer clic fuera del contenido
        if (mobileModal) {
            mobileModal.addEventListener('click', (e) => {
                if (e.target === mobileModal) closeMobileModal();
            });
        }

        if (!accordionContainer) return;

        // Renderizar Familias
        families.forEach(family => {
            const familyBlock = document.createElement('div');
            familyBlock.className = 'w-full family-block'; 

            const button = document.createElement('button');
            button.className = 'family-selector-btn';
            button.dataset.familyId = family.id;
            button.innerHTML = `<img src="${family.icon}" alt="${family.name}"><span>${family.name}</span>`;
            
            const grid = document.createElement('div');
            grid.className = 'product-grid-container grid grid-cols-2 md:grid-cols-3 gap-6';

            const products = productData.filter(p => p.family == family.id);
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card'; 
                card.dataset.productId = product.id;
                card.innerHTML = `
                    <div class="product-card-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" class="product-card-image">
                    </div>
                    <div class="lupa-overlay">
                        <button type="button" class="lupa-button" data-action="view-product">
                            <img src="img/lupa.png" alt="Ver detalle">
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });

            familyBlock.appendChild(button);
            familyBlock.appendChild(grid);
            accordionContainer.appendChild(familyBlock);
        });

        accordionContainer.addEventListener('click', handleFamilyClick);
        accordionContainer.addEventListener('click', handleProductClick);
    }

    document.addEventListener('DOMContentLoaded', initProductPage);

})();

/* 14. LÓGICA DE PÁGINA DE VENTAS (TRANSFORMACIÓN DE TARJETA) */
(function() {
    
    // Función para cambiar de vista
    function swapView(cardId, showForm) {
        const card = document.getElementById(cardId);
        if (!card) return;

        const initialView = card.querySelector('.view-initial');
        const formView = card.querySelector('.view-form');

        if (showForm) {
            // 1. Desvanecer vista inicial
            initialView.classList.add('fading-out');
            
            setTimeout(() => {
                // 2. Ocultar inicial y mostrar form (display)
                initialView.classList.add('hidden-view');
                formView.classList.remove('hidden');
                
                // 3. Pequeño delay para permitir que el DOM renderice y la altura crezca
                setTimeout(() => {
                    formView.classList.remove('opacity-0'); // Fade in del form
                }, 50);
            }, 300); // Espera la transición de salida

        } else {
            // CANCELAR: Volver a la vista inicial
            formView.classList.add('opacity-0');
            
            setTimeout(() => {
                formView.classList.add('hidden');
                initialView.classList.remove('hidden-view');
                
                // Delay para quitar la clase de desvanecimiento y que reaparezca
                setTimeout(() => {
                    initialView.classList.remove('fading-out');
                }, 50);
            }, 300);
        }
    }

    // Listeners para Botones "Soy X"
    const swapButtons = document.querySelectorAll('.js-swap-view');
    swapButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar que suba la pantalla si fuera un link
            const targetId = btn.getAttribute('data-target');
            swapView(targetId, true);
        });
    });

    // Listeners para Botones "Cancelar"
    const cancelButtons = document.querySelectorAll('.js-cancel-view');
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            swapView(targetId, false);
        });
    });

})();

//MAPA EN PAGINA DE CONTACTO
const slider = document.querySelector(".map-slider");
const btns = document.querySelectorAll(".map-btn");

btns.forEach((btn, index) => {

    btn.addEventListener("click", () => {

        // activar botón
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // mover slider
        slider.style.transform = `translateX(-${index * 100}%)`;
    });
});