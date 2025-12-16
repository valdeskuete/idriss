/* ==================================================================== */
/* === SCRIPT.JS : LOGIQUE D'INTERACTIVITÉ ET FILTRES (UI) === */
/* ==================================================================== */

// Le code est commenté pour faciliter les mises à jour et la compréhension.

/* -------------------- MENU MOBILE & NAVIGATION -------------------- */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    // Bascule entre l'icône burger et la croix
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

/* -------------------- LIEN ACTIF AU SCROLL & STICKY HEADER -------------------- */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

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
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    // --- Fermer le menu mobile au scroll
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
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
        // Pour éviter les bugs de double clic après le rechargement, on supprime/ré-ajoute
        button.onclick = null; 
        
        button.addEventListener('click', (e) => {
            const filterValue = e.target.getAttribute('data-filter');

            // 1. Mise à jour de la classe active du bouton
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // 2. Déclenche le rechargement des projets via la fonction de Firebase
            // Cette fonction existe dans firebase-app.js
            if (window.loadProjects) {
                window.loadProjects(filterValue);
            } else {
                console.error("Erreur: La fonction loadProjects (Firebase) n'est pas définie.");
            }
        });
    });
};


/* ==================================================================== */
/* === TÉMOIGNAGES (CONTENU STATIQUE LOCAL) === */
/* ==================================================================== */

// Référence au conteneur où les témoignages seront affichés
const temoignagesSlider = document.querySelector('#temoignages-slider');

// Données statiques pour les témoignages (pas besoin de Firebase pour ça)
const temoignagesData = [
    {
        citation: "Le travail est d'une finesse incroyable. Le meuble sur mesure a transformé mon salon.",
        auteur: "M. Tchameni, Douala",
        note: "5 étoiles"
    },
    {
        citation: "Professionnalisme et respect des délais, la cuisine est parfaite !",
        auteur: "Mme. Fotso, Yaoundé",
        note: "5 étoiles"
    },
    {
        citation: "Un artisan passionné et minutieux. J'ai été bluffé par la robustesse.",
        auteur: "Dr. Njock, Babadjou",
        note: "5 étoiles"
    },
    // Ajoute d'autres témoignages ici si tu le souhaites
];

function generateTemoignagesHTML() {
    if (!temoignagesSlider) return; // Sécurité si la section n'existe pas
    
    let htmlContent = '';

    temoignagesData.forEach(temoignage => {
        htmlContent += `
            <div class="temoignages-item">
                <i class='bx bxs-quote-alt-left'></i>
                <p>${temoignage.citation}</p>
                <h3>${temoignage.auteur}</h3>
                <span>${temoignage.note}</span>
            </div>
        `;
    });

    temoignagesSlider.innerHTML = htmlContent;
}


/* -------------------- FONCTION D'INITIALISATION -------------------- */

// Exécute les fonctions d'interface une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise les événements de filtre (loadProjects dans firebase-app.js prendra le relais)
    window.setupPortfolioFilter();

    // 2. Génère le HTML des témoignages DYNAMIQUES
    // Assurez-vous que cette fonction est appelée APRES l'importation de firebase-app.js
    if (window.loadTestimonials) {
        window.loadTestimonials();
    }
});