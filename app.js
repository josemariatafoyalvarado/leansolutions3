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
    console.log("DOM Cargado. Inicializando la aplicación.");

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        
        // 1. Animación del Header
        gsap.from("header", {
            y: -100, 
            opacity: 0, 
            duration: 1.2, 
            ease: "power3.out", 
            delay: 0.3 
        });

        // 1.1 Animación del Contenido del Hero
        gsap.from(".hero-content > *", { 
            opacity: 0, 
            y: 50, 
            stagger: 0.3, 
            duration: 1.2, 
            ease: "power2.out",
            delay: 0.8 
        });

        // 2. Animación para la Sección de Soluciones Destacadas (Courses)
        // Animación del título de sección
        gsap.from(".courses-section .section-title", {
            opacity: 0,
            y: -30,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".courses-section", 
                start: "top 85%", 
            }
        });

        // Animación para cada 'Course Item' - Entrada escalonada desde la izquierda con efecto de muelle
        gsap.from(".course-item", {
            opacity: 0,
            x: -30,
            duration: 1.0,
            stagger: 0.2, 
            ease: "back.out(0.8)",
            scrollTrigger: {
                trigger: ".course-accordion",
                start: "top 85%",
                toggleActions: "play none none none" 
            }
        });

        // 3. Animación para la Sección 'Preguntas Frecuentes' (FAQ)
        // Animación del título de sección
        gsap.from(".faq-section .section-title", {
            opacity: 0,
            scale: 0.9,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".faq-section",
                start: "top 80%", 
            }
        });
        
        // Animación de los ítems FAQ (slide-up simple)
        gsap.from(".faq-item", {
            opacity: 0,
            x: 0,
            y: 50, 
            duration: 0.7,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".faq-section",
                start: "top 70%",
                toggleActions: "play none none none"
            }
        });

        // NOTA: Se eliminó el bloque de código GSAP duplicado para .course-item que causaba conflictos.
        
        // 4. Animación para el Footer
        gsap.from("footer", {
            opacity: 0,
            y: 30,
            duration: 1.0,
            ease: "power1.out",
            scrollTrigger: {
                trigger: "footer",
                start: "top 95%", 
                toggleActions: "play none none none"
            }
        });
    } else {
        console.warn("GSAP o ScrollTrigger no están cargados. Las animaciones por scroll no se ejecutarán.");
    }

    // Configuración de Firebase
        const firebaseConfig = {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__",
    measurementId: "__FIREBASE_MEASUREMENT_ID__"
    };

    let auth;
    let db; 
    let userId;

    // Referencias de Elementos del DOM
    const loginModal = document.getElementById('login-modal');
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

    function setupMenu() {
        const menuToggleButton = document.getElementById('menu-toggle-btn');
        if (menuToggleButton && sidebarMenu && closeMenuButton) {
            // 1. Abrir menú
            menuToggleButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                sidebarMenu.classList.add('open');
            });
            
            // 2. Cerrar menú (Botón interno)
            closeMenuButton.addEventListener('click', () => {
                sidebarMenu.classList.remove('open');
            });
            
            // 3. Cerrar menú (Click fuera)
            document.addEventListener('click', (e) => {
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

    // =======================================================
    // AJUSTE CLAVE: Refactorización de la lógica del acordeón
    // Se implementa un toggle más robusto similar al de FAQ.
    // =======================================================
    function setupAccordion() {
        const courseItems = document.querySelectorAll('.course-item');
        if (courseItems.length > 0) {
            courseItems.forEach(item => {
                const header = item.querySelector('.course-header');
                const icon = item.querySelector('.toggle-icon');

                if (header) {
                    header.addEventListener('click', () => {
                        // 1. Cierra todos los demás ítems abiertos (acordeón de uno a la vez)
                        document.querySelectorAll('.course-item.active').forEach(activeItem => {
                            if (activeItem !== item) { // Solo cierra si NO es el ítem clickeado
                                activeItem.classList.remove('active');
                                const otherIcon = activeItem.querySelector('.toggle-icon');
                                if (otherIcon) {
                                    otherIcon.classList.remove('fa-minus');
                                    otherIcon.classList.add('fa-plus');
                                }
                            }
                        });

                        // 2. Alterna la clase 'active' del ítem actual.
                        // Esto garantiza que el contenido se ABRA si estaba cerrado o se CIERRE si estaba abierto.
                        item.classList.toggle('active');

                        // 3. Actualiza el ícono basándose en el NUEVO estado del ítem
                        if (icon) {
                            if (item.classList.contains('active')) {
                                icon.classList.remove('fa-plus');
                                icon.classList.add('fa-minus');
                            } else {
                                icon.classList.remove('fa-minus');
                                icon.classList.add('fa-plus');
                            }
                        }
                    });
                }
            });
        }
    }
    // =======================================================

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

                if (!name || !email || !message) {
                    formMessage.textContent = 'Por favor, completa todos los campos.';
                    formMessage.className = 'text-red-500 mt-4';
                    return;
                }

                console.log('Formulario enviado:', { name, email, message });
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
            let message = 'Error de registro. Por favor, intenta de nuevo.';
            switch(error.code) {
                case 'auth/email-already-in-use':
                    message = 'El correo electrónico ya está en uso. Por favor, inicia sesión.';
                    break;
                case 'auth/weak-password':
                    message = 'La contraseña debe tener al menos 6 caracteres.';
                    break;
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
        if (!email || !password) {
            displayError('Por favor, ingresa un correo y una contraseña.');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            closeLoginModal();
            window.location.replace("panel.html");
        } catch (error) {
            let message = 'Error de inicio de sesión. Revisa tu correo y contraseña.';
            switch(error.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    message = 'Credenciales inválidas. Revisa tu correo y contraseña.';
                    break;
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
            console.error("Error en la inicialización de la aplicación:", error);
            showMessageModal("Error", "Error al inicializar la aplicación. Intenta de nuevo.");
        }
    }

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