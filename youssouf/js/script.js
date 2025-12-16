/* ==================================================================== */
/* === SCRIPT.JS : LOGIQUE D'INTERACTIVITÉ ET CONTENU DYNAMIQUE === */
/* ==================================================================== */

// Le code sera commenté pour faciliter les mises à jour et la compréhension.

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
        // Décalage ajusté pour une meilleure navigation
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

    // --- Sticky Navbar (Ajoute la classe 'sticky' au header après 100px de scroll)
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    // --- Fermer le menu mobile au scroll (pour éviter qu'il reste ouvert sur mobile)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};


/* ==================================================================== */
/* === GESTION DU CONTENU DYNAMIQUE (PROJETS & TÉMOIGNAGES) === */
/* ==================================================================== */

// Le contenu des tableaux `projetsData` et `temoignagesData` est dans data.js

/* -------------------- 1. GALERIE PROJETS FILTRABLE -------------------- */

// Référence au conteneur où les projets seront affichés
const portfolioContainer = document.querySelector('#portfolio-list');

function generatePortfolioHTML() {
    let htmlContent = '';
    
    // Pour chaque objet dans le tableau `projetsData` (dans data.js)
    projetsData.forEach(projet => {
        // Crée le code HTML pour un seul projet
        htmlContent += `
            <div class="portfolio-box" data-category="${projet.categorie}">
                <img src="${projet.image}" alt="Image de ${projet.titre}">
                <div class="portfolio-layer">
                    <h4>${projet.titre}</h4>
                    <p>${projet.description}</p>
                    <a href="${projet.image}" target="_blank" title="Agrandir l'image">
                        <i class='bx bx-search-alt-2'></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    // Injecte tout le code HTML dans le conteneur principal
    portfolioContainer.innerHTML = htmlContent;
}

function setupPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioBoxes = document.querySelectorAll('.portfolio-box');

    // Événement de clic sur chaque bouton de filtre
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filterValue = e.target.getAttribute('data-filter');

            // 1. Mise à jour de la classe active du bouton
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // 2. Filtrage des projets
            portfolioBoxes.forEach(box => {
                const boxCategory = box.getAttribute('data-category');

                if (filterValue === 'all' || boxCategory === filterValue) {
                    // Si le projet correspond au filtre ou si c'est 'all', on l'affiche
                    box.classList.remove('hidden');
                    // On remet la hauteur pour l'animation
                    box.style.height = 'auto'; 
                    box.style.padding = '2.5rem 0'; // Remettre le padding par défaut
                    box.style.margin = '0';
                } else {
                    // Sinon, on le cache
                    box.classList.add('hidden');
                    // Retirer la hauteur après l'animation pour un filtre propre
                    setTimeout(() => {
                        box.style.height = '0';
                        box.style.padding = '0';
                        box.style.margin = '0';
                    }, 500); 
                }
            });
        });
    });
}

/* -------------------- 2. TÉMOIGNAGES (GRILLE SIMPLE) -------------------- */

// Référence au conteneur où les témoignages seront affichés
const temoignagesSlider = document.querySelector('#temoignages-slider');

function generateTemoignagesHTML() {
    let htmlContent = '';

    // Pour chaque objet dans le tableau `temoignagesData` (dans data.js)
    temoignagesData.forEach(temoignage => {
        // Crée le code HTML pour un seul témoignage
        htmlContent += `
            <div class="temoignages-item">
                <i class='bx bxs-quote-alt-left'></i>
                <p>${temoignage.citation}</p>
                <h3>${temoignage.auteur}</h3>
                <span>${temoignage.note}</span>
            </div>
        `;
    });

    // Injecte tout le code HTML dans le conteneur principal
    temoignagesSlider.innerHTML = htmlContent;
}


/* -------------------- FONCTION D'INITIALISATION -------------------- */

// Exécute les fonctions de génération de contenu une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    generatePortfolioHTML();
    setupPortfolioFilter();
    generateTemoignagesHTML();
});