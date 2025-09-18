import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando la aplicación.");

    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    let auth;
    let db;
    let userId;

    const loginModal = document.getElementById('login-modal');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const panelBtn = document.getElementById('panel-btn');
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

    function setupCarousel() {
        const carouselElement = document.querySelector('.hero-carousel');
        if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel && carouselElement) {
            $('.hero-carousel').owlCarousel({
                loop: true,
                margin: 0,
                nav: false,
                dots: false,
                autoplay: true,
                autoplayTimeout: 5000,
                autoplayHoverPause: false,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                items: 1
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
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                closeSidebarMenu();
                loginModal.style.display = 'flex';
            });
            if (modalCloseBtn) {
                modalCloseBtn.addEventListener('click', closeLoginModal);
            }
            window.addEventListener('click', (event) => {
                if (event.target === loginModal) {
                    closeLoginModal();
                }
            });
        }
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
        const courseItems = document.querySelectorAll('.course-header');
        if (courseItems.length > 0) {
            courseItems.forEach(item => {
                item.addEventListener('click', () => {
                    const parent = item.parentElement;
                    const details = parent.querySelector('.course-details');
                    const icon = item.querySelector('.toggle-icon');
                    document.querySelectorAll('.course-item.active').forEach(activeItem => {
                        if (activeItem !== parent) {
                            activeItem.classList.remove('active');
                            activeItem.querySelector('.course-details').style.maxHeight = null;
                            const activeIcon = activeItem.querySelector('.toggle-icon');
                            if (activeIcon) {
                                activeIcon.classList.remove('fa-minus');
                                activeIcon.classList.add('fa-plus');
                            }
                        }
                    });
                    parent.classList.toggle('active');
                    if (parent.classList.contains('active')) {
                        details.style.maxHeight = details.scrollHeight + "px";
                        if (icon) {
                            icon.classList.remove('fa-plus');
                            icon.classList.add('fa-minus');
                        }
                    } else {
                        details.style.maxHeight = null;
                        if (icon) {
                            icon.classList.remove('fa-minus');
                            icon.classList.add('fa-plus');
                        }
                    }
                });
            });
        }
    }

    function setupFaq() {
        const faqItems = document.querySelectorAll('.faq-item h3');
        if (faqItems.length > 0) {
            faqItems.forEach(item => {
                item.addEventListener('click', () => {
                    const answer = item.nextElementSibling;
                    const allAnswers = document.querySelectorAll('.faq-answer');
                    allAnswers.forEach(ans => {
                        if (ans !== answer) {
                            ans.style.display = 'none';
                        }
                    });
                    if (answer.style.display === 'block') {
                        answer.style.display = 'none';
                    } else {
                        answer.style.display = 'block';
                    }
                });
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
                    message = 'Credenciales inválidas. Revisa tu correo y contraseña.';
                    break;
                case 'auth/invalid-email':
                    message = 'El correo electrónico no es válido.';
                    break;
                case 'auth/wrong-password':
                    message = 'Contraseña incorrecta.';
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
            
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }

            onAuthStateChanged(auth, user => {
                if (user) {
                    userId = user.uid;
                    if (loginBtn) loginBtn.style.display = 'none';
                    if (logoutBtn) logoutBtn.style.display = 'block';
                    if (panelBtn) panelBtn.style.display = 'block';
                    
                    if (window.location.pathname.endsWith('panel.html')) {
                        setupPanelPage(user);
                    }
                } else {
                    userId = null;
                    if (loginBtn) loginBtn.style.display = 'block';
                    if (logoutBtn) logoutBtn.style.display = 'none';
                    if (panelBtn) panelBtn.style.display = 'none';
                    
                    if (window.location.pathname.endsWith('panel.html')) {
                        window.location.replace("index.html");
                    }
                }
            });

            if (registerBtn) registerBtn.addEventListener('click', handleRegistration);
            if (signinBtn) signinBtn.addEventListener('click', handleSignIn);
            if (logoutBtn) logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    console.log("Sesión cerrada correctamente.");
                }).catch((error) => {
                    console.error("Error al cerrar sesión:", error);
                });
                closeSidebarMenu();
            });

            if (panelBtn) panelBtn.addEventListener('click', () => {
                window.location.href = "panel.html";
            });
            
            setupModal();
            setupAccordion();
            setupFaq();
            setupMenu();
            setupContactForm();
            setTimeout(setupCarousel, 100);

        } catch (error) {
            console.error("Error en la inicialización de la aplicación:", error);
            showMessageModal("Error", "Error al inicializar la aplicación. Intenta de nuevo.");
        }
    }
    initApp();
});
