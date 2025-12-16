/* ==================================================================== */
/* === SCRIPT.JS : LOGIQUE D'INTERACTIVITÉ ET FILTRES (UI) === */
/* ==================================================================== */

/* -------------------- MENU MOBILE & NAVIGATION -------------------- */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
    menuIcon.onclick = () => {
        // Bascule entre l'icône burger et la croix
        menuIcon.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    };
}


/* -------------------- LIEN ACTIF AU SCROLL & STICKY HEADER -------------------- */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');
let header = document.querySelector('header');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150; 
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                // Trouve et active le lien correspondant dans la navigation
                let targetLink = document.querySelector('header nav a[href*=' + id + ']');
                if (targetLink) {
                    targetLink.classList.add('active');
                }
            });
        };
    });

    // --- Sticky Navbar 
    if (header) {
        header.classList.toggle('sticky', window.scrollY > 100);
    }

    // --- Fermer le menu mobile au scroll
    if (menuIcon && navbar) {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    }
};


/* ==================================================================== */
/* === GESTION DES FILTRES DE PROJETS (INTERFACE SEULEMENT) === */
/* ==================================================================== */

/**
 * Attache les écouteurs d'événements aux boutons de filtre.
 * Cette fonction est appelée par `firebase-app.js` après chaque chargement/mise à jour.
 */
window.setupPortfolioFilter = function() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    // On parcourt les boutons de filtre
    filterButtons.forEach(button => {
        // Supprime l'ancien écouteur avant d'en ajouter un nouveau (sécurité après rechargement)
        // Ceci évite d'avoir plusieurs gestionnaires d'événements attachés au même bouton.
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', (e) => {
            const filterValue = e.target.getAttribute('data-filter');

            // 1. Mise à jour de la classe active du bouton
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // 2. Déclenche le rechargement des projets via la fonction de Firebase
            if (window.loadProjects) {
                window.loadProjects(filterValue);
            } else {
                console.error("Erreur: La fonction loadProjects (Firebase) n'est pas définie. Vérifiez l'ordre de chargement des scripts.");
            }
        });
    });
};


/* ==================================================================== */
/* === FONCTION D'INITIALISATION GÉNÉRALE === */
/* ==================================================================== */

// Exécute les fonctions d'interface une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise les événements de filtre
    if (window.setupPortfolioFilter) {
        window.setupPortfolioFilter();
    }
    
    // Remarque: Le chargement initial des projets et témoignages est géré à la fin
    // de `firebase-app.js` pour s'assurer que Firebase est initialisé.
});