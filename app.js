import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Corregido: "DOM Cargado. Inicializando la aplicación."
    console.log("DOM Cargado. Inicializando la aplicación.");

    // ===============================================
    // CÓDIGO AÑADIDO PARA LA TRANSICIÓN DEL HEADER CON GSAP
    // ===============================================
    // Comprueba si GSAP está cargado antes de usarlo
    if (typeof gsap !== 'undefined') {
        gsap.from("header", {
            y: -100, // Comienza 100px por encima de su posición final
            opacity: 0, // Comienza invisible
            duration: 1.8, // Duración de la animación en segundos
            ease: "power3.out", // Curva de suavidad para un efecto más elegante
            delay: 0.3 // Pequeño retraso para que inicie después de la carga inicial
        });
    }
    // ===============================================

    const firebaseConfig = {
      apiKey: "AIzaSyAAXJ-wklT3mfxdQO16DDwmAriYxroiEKA",
      authDomain: "cursos-7ae54.firebaseapp.com",
      projectId: "cursos-7ae54",
      storageBucket: "cursos-7ae54.appspot.com",
      messagingSenderId: "356389037138",
      appId: "1:356389037138:web:bdc9cd1c2a8acfd2bbab8b",
      measurementId: "G-XV8TV6P3Z1"
    };

    let auth;
    let db; 
    let userId;

    // Referencias de Elementos del DOM
    const loginModal = document.getElementById('login-modal');
    // CORRECCIÓN DE LOGIN: Apunta al ID que se usa en el HTML más reciente
    const errorMessage = document.getElementById('login-error-message');  
    const loginBtnDesktop = document.getElementById('login-btn-desktop');
    const loginBtnMobile = document.getElementById('login-btn-mobile');
    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    const panelBtnDesktop = document.getElementById('panel-btn-desktop');
    const panelBtnMobile = document.getElementById('panel-btn-mobile');
    const registerBtn = document.getElementById('register-btn');
    const signinBtn = document.getElementById('signin-btn');
    const emailInput = document.getElementById('modal-email');
    const passwordInput = document.getElementById('modal-password');
    const modalCloseBtn = document.querySelector('#login-modal .close-button');

    const closeMenuButton = document.getElementById('close-menu-btn');
    const sidebarMenu = document.getElementById('sidebar-menu');

    const messageModal = document.getElementById('message-modal');
    const messageTitle = document.getElementById('message-title');
    const messageText = document.getElementById('message-text');
    const messageCloseBtn = document.getElementById('message-close-btn');

    // ===============================================
    // FUNCIONES DE UTILIDAD DE UI
    // ===============================================

    function closeSidebarMenu() {
        if (sidebarMenu) {
            sidebarMenu.classList.remove('open');
        }
    }

    function showMessageModal(title, text) {
        if (messageModal) {
            messageTitle.textContent = title;
            messageText.textContent = text;
            messageModal.style.display = 'flex';
        }
    }

    function closeMessageModal() {
        if (messageModal) {
            messageModal.style.display = 'none';
        }
    }

    function displayError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        }
    }

    function clearError() {
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.add('hidden');
        }
    }

    function closeLoginModal() {
        if (loginModal) {
            loginModal.style.display = 'none';
            clearError();
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
        }
    }

    function setupHeroCarousel() {
        const carouselElement = document.querySelector('.hero-carousel');
        if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel && carouselElement) {
            $('.hero-carousel').owlCarousel({
                loop: true,
                margin: 0,
                nav: false,
                dots: false,
                autoplay: true,
                autoplayTimeout: 6000,
                autoplayHoverPause: false,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                items: 1
            });
        }
    }

    function setupTestimonialsCarousel() {
        const carouselElement = document.querySelector('.testimonials-carousel');
        if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel && carouselElement) {
            $('.testimonials-carousel').owlCarousel({
                loop: true,
                margin: 20,
                nav: false,
                dots: true,
                autoplay: true,
                autoplayTimeout: 5000,
                autoplayHoverPause: true,
                responsive: {
                    0: {
                        items: 1
                    },
                    768: {
                        items: 2
                    },
                    1024: {
                        items: 3
                    }
                }
            });
        }
    }

    /**
     * CORRECCIÓN DE MENÚ LATERAL:
     * 1. Se mantiene el e.stopPropagation() en el botón de abrir.
     * 2. Se asegura que el listener de documento solo cierre el menú si está abierto.
     */
    function setupMenu() {
        const menuToggleButton = document.getElementById('menu-toggle-btn');
        if (menuToggleButton && sidebarMenu && closeMenuButton) {
            // 1. Abrir menú
            menuToggleButton.addEventListener('click', (e) => {
                e.stopPropagation(); // SOLUCIÓN: Evita el conflicto del click fuera
                sidebarMenu.classList.add('open');
            });
            
            // 2. Cerrar menú (Botón interno)
            closeMenuButton.addEventListener('click', () => {
                sidebarMenu.classList.remove('open');
            });
            
            // 3. Cerrar menú (Click fuera)
            document.addEventListener('click', (e) => {
                // Solo intenta cerrar si el menú está actualmente abierto
                if (sidebarMenu.classList.contains('open') && !sidebarMenu.contains(e.target) && !menuToggleButton.contains(e.target)) {
                    sidebarMenu.classList.remove('open');
                }
            });
        }
    }

    function setupModal() {
        const openModalButtons = [loginBtnDesktop, loginBtnMobile];
        openModalButtons.forEach(btn => {
            if (btn && loginModal) {
                btn.addEventListener('click', () => {
                    closeSidebarMenu();
                    loginModal.style.display = 'flex';
                });
            }
        });

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeLoginModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                closeLoginModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape") {
                closeLoginModal();
                closeSidebarMenu();
                closeMessageModal();
            }
        });

        if (messageCloseBtn) {
            messageCloseBtn.addEventListener('click', closeMessageModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target === messageModal) {
                closeMessageModal();
            }
        });
    }

    function setupAccordion() {
        const courseItems = document.querySelectorAll('.course-item');
        if (courseItems.length > 0) {
            courseItems.forEach(item => {
                const header = item.querySelector('.course-header');
                const icon = item.querySelector('.toggle-icon');

                if (header) {
                    header.addEventListener('click', () => {
                        const isActive = item.classList.contains('active');

                        // Cierra todos los demás
                        document.querySelectorAll('.course-item.active').forEach(activeItem => {
                            activeItem.classList.remove('active');
                            const activeIcon = activeItem.querySelector('.toggle-icon');
                            if (activeIcon) {
                                activeIcon.classList.remove('fa-minus');
                                activeIcon.classList.add('fa-plus');
                            }
                        });

                        // Abre el actual si no estaba activo
                        if (!isActive) {
                            item.classList.add('active');
                            if (icon) {
                                icon.classList.remove('fa-plus');
                                icon.classList.add('fa-minus');
                            }
                        }
                    });
                }
            });
        }
    }

    function setupFaq() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (faqItems.length > 0) {
            faqItems.forEach(item => {
                const header = item.querySelector('h3');
                
                if (header) {
                    header.addEventListener('click', () => {
                        const icon = item.querySelector('.toggle-icon');
                        
                        // 1. Cierra todos los demás ítems (comportamiento de acordeón)
                        document.querySelectorAll('.faq-item.active').forEach(activeItem => {
                            if (activeItem !== item) {
                                activeItem.classList.remove('active');
                                const otherIcon = activeItem.querySelector('.toggle-icon');
                                if (otherIcon) {
                                    otherIcon.classList.remove('fa-minus');
                                    otherIcon.classList.add('fa-plus');
                                }
                            }
                        });

                        // 2. Alterna la clase 'active' del ítem actual (habilita la minimización)
                        item.classList.toggle('active');

                        // 3. Actualiza el ícono basándose en el NUEVO estado del ítem
                        if (icon) {
                            if (item.classList.contains('active')) {
                                // Si ahora está ABIERTO, mostrar '-'
                                icon.classList.remove('fa-plus');
                                icon.classList.add('fa-minus');
                            } else {
                                // Si ahora está CERRADO, mostrar '+'
                                icon.classList.remove('fa-minus');
                                icon.classList.add('fa-plus');
                            }
                        }
                    });
                }
            });
        }
    }

    function setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        const formMessage = document.getElementById('form-message');

        if (contactForm && formMessage) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const message = document.getElementById('contact-message').value;

                // Corregido: 'Por favor, completa todos los campos.'
                if (!name || !email || !message) {
                    formMessage.textContent = 'Por favor, completa todos los campos.';
                    formMessage.className = 'text-red-500 mt-4';
                    return;
                }

                console.log('Formulario enviado:', { name, email, message });
                // Corregido: '¡Mensaje Enviado!', '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.'
                showMessageModal('¡Mensaje Enviado!', '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                contactForm.reset();
            });
        }
    }

    // ===============================================
    // LÓGICA DE FIREBASE Y AUTENTICACIÓN
    // ===============================================

    async function handleRegistration() {
        clearError();
        const email = emailInput.value;
        const password = passwordInput.value;
        // Corregido: 'Por favor, ingresa un correo y una contraseña.'
        if (!email || !password) {
            displayError('Por favor, ingresa un correo y una contraseña.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date()
            });
            
            closeLoginModal();
            window.location.replace("panel.html");
        } catch (error) {
            // Corregido: 'Error de registro. Por favor, intenta de nuevo.'
            let message = 'Error de registro. Por favor, intenta de nuevo.';
            switch(error.code) {
                // Corregido: 'El correo electrónico ya está en uso. Por favor, inicia sesión.'
                case 'auth/email-already-in-use':
                    message = 'El correo electrónico ya está en uso. Por favor, inicia sesión.';
                    break;
                // Corregido: 'La contraseña debe tener al menos 6 caracteres.'
                case 'auth/weak-password':
                    message = 'La contraseña debe tener al menos 6 caracteres.';
                    break;
                // Corregido: 'El correo electrónico no es válido.'
                case 'auth/invalid-email':
                    message = 'El correo electrónico no es válido.';
                    break;
                default:
                    message = 'Error desconocido: ' + error.message;
                    break;
            }
            displayError(message);
        }
    }

    async function handleSignIn() {
        clearError();
        const email = emailInput.value;
        const password = passwordInput.value;
        // Corregido: 'Por favor, ingresa un correo y una contraseña.'
        if (!email || !password) {
            displayError('Por favor, ingresa un correo y una contraseña.');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            closeLoginModal();
            window.location.replace("panel.html");
        } catch (error) {
            // Corregido: 'Error de inicio de sesión. Revisa tu correo y contraseña.'
            let message = 'Error de inicio de sesión. Revisa tu correo y contraseña.';
            switch(error.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    // Corregido: 'Credenciales inválidas. Revisa tu correo y contraseña.'
                    message = 'Credenciales inválidas. Revisa tu correo y contraseña.';
                    break;
                // Corregido: 'El correo electrónico no es válido.'
                case 'auth/invalid-email':
                    message = 'El correo electrónico no es válido.';
                    break;
                default:
                    message = 'Error desconocido: ' + error.message;
                    break;
            }
            displayError(message);
        }
    }

    function setupPanelPage(user) {
        const userDisplay = document.getElementById('user-display');
        if (userDisplay && user) {
            userDisplay.textContent = `Bienvenido, ${user.email}.`;
        }
        const panelButtons = ['ticket-btn', 'material-btn', 'available-courses-btn'];
        panelButtons.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                // Corregido: 'Funcionalidad en Desarrollo', 'Esta sección estará disponible en una futura actualización. ¡Gracias por tu paciencia!'
                button.addEventListener('click', () => {
                    showMessageModal('Funcionalidad en Desarrollo', 'Esta sección estará disponible en una futura actualización. ¡Gracias por tu paciencia!');
                });
            }
        });
        const myCoursesBtn = document.getElementById('my-courses-btn');
        if (myCoursesBtn) {
            myCoursesBtn.addEventListener('click', () => {
                window.location.href = 'mis-cursos.html';
            });
        }
    }

    async function initApp() {
        try {
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            
            onAuthStateChanged(auth, user => {
                const isLoggedIn = !!user;
                userId = isLoggedIn ? user.uid : null;

                // Actualizar botones de escritorio
                if (loginBtnDesktop) loginBtnDesktop.style.display = isLoggedIn ? 'none' : 'block';
                if (logoutBtnDesktop) logoutBtnDesktop.style.display = isLoggedIn ? 'block' : 'none';
                if (panelBtnDesktop) panelBtnDesktop.style.display = isLoggedIn ? 'block' : 'none';
                
                // Actualizar botones móviles
                if (loginBtnMobile) loginBtnMobile.style.display = isLoggedIn ? 'none' : 'block';
                if (logoutBtnMobile) logoutBtnMobile.style.display = isLoggedIn ? 'block' : 'none';
                if (panelBtnMobile) panelBtnMobile.style.display = isLoggedIn ? 'block' : 'none';

                const currentPath = window.location.pathname;

                if (isLoggedIn && currentPath.endsWith('panel.html')) {
                    setupPanelPage(user);
                } else if (!isLoggedIn && (currentPath.endsWith('panel.html') || currentPath.endsWith('mis-cursos.html'))) {
                    // Redirigir si no está logueado e intenta acceder a rutas privadas
                    window.location.replace("index.html");
                }
            });

            if (registerBtn) registerBtn.addEventListener('click', handleRegistration);
            if (signinBtn) signinBtn.addEventListener('click', handleSignIn);
            
            const handleLogout = async () => {
                try {
                    await signOut(auth);
                    window.location.replace("index.html"); 
                } catch (error) {
                    // Corregido: "Error al cerrar sesión:" y "No se pudo cerrar la sesión correctamente."
                    console.error("Error al cerrar sesión:", error);
                    showMessageModal("Error", "No se pudo cerrar la sesión correctamente.");
                }
            };

            if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogout);
            if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);

            const handlePanel = () => {
                window.location.href = 'panel.html';
            };
            if (panelBtnDesktop) panelBtnDesktop.addEventListener('click', handlePanel);
            if (panelBtnMobile) panelBtnMobile.addEventListener('click', handlePanel);

        } catch (error) {
            // Corregido: "Error en la inicialización de la aplicación:" y "Error al inicializar la aplicación. Intenta de nuevo."
            console.error("Error en la inicialización de la aplicación:", error);
            showMessageModal("Error", "Error al inicializar la aplicación. Intenta de nuevo.");
        }
    }

    // Corregido: "Inicialización de la aplicación"
    // Inicialización de la aplicación
    setupModal();
    setupAccordion();
    setupFaq();
    setupMenu();
    setupContactForm();
    setTimeout(setupHeroCarousel, 100);
    setTimeout(setupTestimonialsCarousel, 100);
    initApp();
});