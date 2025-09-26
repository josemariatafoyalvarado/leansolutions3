import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando la aplicaciÃ³n.");

    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    let auth;
    let db; 
    let userId;

    const loginModal = document.getElementById('login-modal');
    const errorMessage = document.getElementById('error-message');
    const loginBtnDesktop = document.getElementById('login-btn-desktop');
    const loginBtnMobile = document.getElementById('login-btn-mobile');
    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    const panelBtnDesktop = document.getElementById('panel-btn-desktop');
    const panelBtnMobile = document.getElementById('panel-btn-mobile');
    const registerBtn = document.getElementById('register-btn');
    const signinBtn = document.getElementById('signin-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const modalCloseBtn = document.querySelector('#login-modal .close-button');

    const closeMenuButton = document.getElementById('close-menu-btn');
    const sidebarMenu = document.getElementById('sidebar-menu');

    const messageModal = document.getElementById('message-modal');
    const messageTitle = document.getElementById('message-title');
    const messageText = document.getElementById('message-text');
    const messageCloseBtn = document.getElementById('message-close-btn');

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
        }
    }

    // FunciÃ³n para el carrusel del hÃ©roe
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

    // FunciÃ³n para el carrusel de testimonios
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
            menuToggleButton.addEventListener('click', () => {
                sidebarMenu.classList.add('open');
            });
            closeMenuButton.addEventListener('click', () => {
                sidebarMenu.classList.remove('open');
            });
            document.addEventListener('click', (e) => {
                if (!sidebarMenu.contains(e.target) && !menuToggleButton.contains(e.target)) {
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

                        // Cierra todos los demÃ¡s
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
                        
                        // 1. Cierra todos los demÃ¡s Ã­tems (comportamiento de acordeÃ³n)
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

                        // 2. Alterna la clase 'active' del Ã­tem actual (habilita la minimizaciÃ³n)
                        item.classList.toggle('active');

                        // 3. Actualiza el Ã­cono basÃ¡ndose en el NUEVO estado del Ã­tem
                        if (icon) {
                            if (item.classList.contains('active')) {
                                // Si ahora estÃ¡ ABIERTO, mostrar '-'
                                icon.classList.remove('fa-plus');
                                icon.classList.add('fa-minus');
                            } else {
                                // Si ahora estÃ¡ CERRADO, mostrar '+'
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
                showMessageModal('Â¡Mensaje Enviado!', 'Â¡Mensaje enviado con Ã©xito! Nos pondremos en contacto contigo pronto.');
                contactForm.reset();
            });
        }
    }

    async function handleRegistration() {
        clearError();
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) {
            displayError('Por favor, ingresa un correo y una contraseÃ±a.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/userData`, user.uid), {
                email: user.email,
                createdAt: new Date()
            });
            closeLoginModal();
            window.location.replace("panel.html");
        } catch (error) {
            let message = 'Error de registro. Por favor, intenta de nuevo.';
            switch(error.code) {
                case 'auth/email-already-in-use':
                    message = 'El correo electrÃ³nico ya estÃ¡ en uso. Por favor, inicia sesiÃ³n.';
                    break;
                case 'auth/weak-password':
                    message = 'La contraseÃ±a debe tener al menos 6 caracteres.';
                    break;
                case 'auth/invalid-email':
                    message = 'El correo electrÃ³nico no es vÃ¡lido.';
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
            displayError('Por favor, ingresa un correo y una contraseÃ±a.');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            closeLoginModal();
            window.location.replace("panel.html");
        } catch (error) {
            let message = 'Error de inicio de sesiÃ³n. Revisa tu correo y contraseÃ±a.';
            switch(error.code) {
                case 'auth/invalid-credential':
                    message = 'Credenciales invÃ¡lidas. Revisa tu correo y contraseÃ±a.';
                    break;
                case 'auth/invalid-email':
                    message = 'El correo electrÃ³nico no es vÃ¡lido.';
                    break;
                case 'auth/wrong-password':
                    message = 'ContraseÃ±a incorrecta.';
                    break;
                case 'auth/user-not-found':
                    message = 'El usuario no existe.';
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
                    showMessageModal('Funcionalidad en Desarrollo', 'Esta secciÃ³n estarÃ¡ disponible en una futura actualizaciÃ³n. Â¡Gracias por tu paciencia!');
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
            
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }

            onAuthStateChanged(auth, user => {
                if (user) {
                    userId = user.uid;
                    // Actualizar botones de escritorio
                    if (loginBtnDesktop) loginBtnDesktop.style.display = 'none';
                    if (logoutBtnDesktop) logoutBtnDesktop.style.display = 'block';
                    if (panelBtnDesktop) panelBtnDesktop.style.display = 'block';
                    // Actualizar botones mÃ³viles
                    if (loginBtnMobile) loginBtnMobile.style.display = 'none';
                    if (logoutBtnMobile) logoutBtnMobile.style.display = 'block';
                    if (panelBtnMobile) panelBtnMobile.style.display = 'block';
                    
                    if (window.location.pathname.endsWith('panel.html')) {
                        setupPanelPage(user);
                    }
                } else {
                    userId = null;
                    // Actualizar botones de escritorio
                    if (loginBtnDesktop) loginBtnDesktop.style.display = 'block';
                    if (logoutBtnDesktop) logoutBtnDesktop.style.display = 'none';
                    if (panelBtnDesktop) panelBtnDesktop.style.display = 'none';
                    // Actualizar botones mÃ³viles
                    if (loginBtnMobile) loginBtnMobile.style.display = 'block';
                    if (logoutBtnMobile) logoutBtnMobile.style.display = 'none';
                    if (panelBtnMobile) panelBtnMobile.style.display = 'none';
                    
                    if (window.location.pathname.endsWith('panel.html')) {
                        window.location.replace("index.html");
                    }
                }
            });

            if (registerBtn) registerBtn.addEventListener('click', handleRegistration);
            if (signinBtn) signinBtn.addEventListener('click', handleSignIn);

            const logoutButtons = [logoutBtnDesktop, logoutBtnMobile];
            logoutButtons.forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', () => {
                        signOut(auth).then(() => {
                            console.log("SesiÃ³n cerrada correctamente.");
                        }).catch((error) => {
                            console.error("Error al cerrar sesiÃ³n:", error);
                        });
                        closeSidebarMenu();
                    });
                }
            });

            const panelButtons = [panelBtnDesktop, panelBtnMobile];
            panelButtons.forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', () => {
                        window.location.href = "panel.html";
                    });
                }
            });
            

        } catch (error) {
            console.error("Error en la inicializaciÃ³n de la aplicaciÃ³n:", error);
            showMessageModal("Error", "Error al inicializar la aplicaciÃ³n. Intenta de nuevo.");
        }
    }
    setupModal();
    setupAccordion();
    setupFaq();
    setupMenu();
    setupContactForm();
    setTimeout(setupHeroCarousel, 100);
    setTimeout(setupTestimonialsCarousel, 100);
    initApp();
});
