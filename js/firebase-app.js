/* ==========================================================
    FIREBASE APP - GESTION DYNAMIQUE (AUTH, DATABASE & STORAGE)
    ========================================================== */

// 1. IMPORT DES FONCTIONS FIREBASE (SDK MODULAIRE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// IMPORTANT: deleteDoc est déjà importé, c'est parfait.
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// NOTE: L'IMPORT DU STORAGE EST RETIRÉ CAR IL N'EST PLUS UTILISÉ.
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 2. CONFIGURATION FIREBASE (REMPLACE PAR TES CLÉS !)
const firebaseConfig = {
    // Insère ici ton apiKey: "AIzaSyDF7XWK56sp4x5ASvi0ipzkTrcp4bZEfwo",
    apiKey: "AIzaSyDF7XWK56sp4x5ASvi0ipzkTrcp4bZEfwo", // Remplacer par ta clé réelle
    authDomain: "youssouf-paris-meuble.firebaseapp.com",
    projectId: "youssouf-paris-meuble",
    storageBucket: "youssouf-paris-meuble.firebasestorage.app",
    messagingSenderId: "149032130636",
    appId: "1:149032130636:web:6f86b64064447fd63ebce9"
};

// 3. INITIALISATION
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// NOTE: L'INITIALISATION DU STORAGE EST RETIRÉE CAR IL N'EST PLUS UTILISÉ.
// const storage = getStorage(app); 

// DOM ELEMENTS
const loginModal = document.getElementById('login-modal');
const adminPanel = document.getElementById('admin-panel');
const adminTrigger = document.getElementById('admin-trigger');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const projectForm = document.getElementById('add-project-form');
const portfolioList = document.getElementById('portfolio-list');
// const uploadProgress = document.getElementById('upload-progress'); // Non utilisé sans Storage

let isAdmin = false; // Flag pour l'affichage conditionnel

/* ==================== 1. GESTION DE L'AUTHENTIFICATION ==================== */

// Vérifier si l'utilisateur est connecté (Admin)
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAdmin = true;
        adminPanel.classList.remove('hidden');
        loginModal.classList.add('hidden');
        adminTrigger.style.display = 'none'; 
    } else {
        isAdmin = false;
        adminPanel.classList.add('hidden');
        adminTrigger.style.display = 'block';
    }
    // Recharger les projets pour appliquer l'affichage Admin/Suppression
    loadProjects(); 
});

// Ouvrir le modal login
if (adminTrigger) {
    adminTrigger.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });
}

// Fermer le modal (croix)
const closeModalBtn = document.querySelector('.close-modal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });
}


// Connexion (Login)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                loginForm.reset();
                alert("Bienvenue Maître Artisan !");
            })
            .catch((error) => {
                alert("Erreur de connexion : Vérifiez l'email et le mot de passe.");
            });
    });
}


// Déconnexion
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert("Déconnecté avec succès.");
            window.location.reload();
        });
    });
}


/* ==================== 2. LECTURE & SUPPRESSION DES PROJETS (GALERIE) ==================== */

// Fonction pour générer le HTML d'un projet
function createProjectHTML(projet, projectId) {
    let adminControls = '';
    // Ajout du bouton de suppression si l'utilisateur est Admin
    if (isAdmin) {
        adminControls = `
            <div class="admin-controls">
                <button onclick="window.deleteItem('projets', '${projectId}')" class="delete-btn" title="Supprimer le projet">
                    <i class='bx bx-trash'></i> Supprimer
                </button>
            </div>
        `;
    }

    return `
        <div class="portfolio-box" data-category="${projet.categorie}">
            <img src="${projet.imageUrl}" alt="${projet.titre}">
            <div class="portfolio-layer">
                <h4>${projet.titre}</h4>
                <p>${projet.description}</p>
                <a href="${projet.imageUrl}" target="_blank" title="Voir l'image en grand"><i class='bx bx-search-alt-2'></i></a>
            </div>
            ${adminControls}
        </div>
    `;
}

// Fonction pour charger et afficher tous les projets
window.loadProjects = async function(filterCategory = 'all') {
    if (!portfolioList) return; 

    portfolioList.innerHTML = '<p style="color:white; text-align:center;">Chargement des réalisations en cours...</p>';
    
    const q = query(collection(db, "projets"), orderBy("date", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        let htmlContent = '';
        let projectsCount = 0;

        querySnapshot.forEach((doc) => {
            const projet = doc.data();
            const projectId = doc.id; // Récupère l'ID pour la suppression
            
            if (filterCategory === 'all' || projet.categorie === filterCategory) {
                 htmlContent += createProjectHTML(projet, projectId);
                 projectsCount++;
            }
        });

        if(projectsCount === 0 && filterCategory === 'all') {
            portfolioList.innerHTML = '<p style="color:white; text-align:center;">Aucun projet n\'a encore été publié par l\'administrateur.</p>';
        } else if (projectsCount === 0 && filterCategory !== 'all') {
            portfolioList.innerHTML = `<p style="color:white; text-align:center;">Aucun projet dans la catégorie "${filterCategory}".</p>`;
        } else {
            portfolioList.innerHTML = htmlContent;
        }

        if(window.setupPortfolioFilter) window.setupPortfolioFilter(); 

    } catch (error) {
        console.error("Erreur chargement des projets:", error);
        portfolioList.innerHTML = '<p style="color:white; text-align:center;">Erreur de connexion à la base de données.</p>';
    }
}

// Lancement au démarrage
loadProjects();


/* ==================== FONCTION DE SUPPRESSION GÉNÉRIQUE ==================== */

/**
 * Supprime un document dans une collection spécifiée.
 * @param {string} collectionName - Le nom de la collection (ex: 'projets').
 * @param {string} docId - L'ID du document à supprimer.
 */
window.deleteItem = async (collectionName, docId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;

    try {
        await deleteDoc(doc(db, collectionName, docId));
        alert("✅ Élément supprimé avec succès !");
        
        // Rafraîchir l'affichage après la suppression
        if (collectionName === 'projets') {
            window.loadProjects();
        } 
        if (collectionName === 'temoignages') {
            window.loadTestimonials(); 
        }

    } catch (error) {
        console.error(`Erreur lors de la suppression de l'élément dans ${collectionName}:`, error);
        alert("Erreur lors de la suppression : Vérifiez les permissions Firestore ou la connexion. " + error.message);
    }
};


/* ==================== 3. AJOUT DE PROJET (SANS UPLOAD) ==================== */

if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('proj-title').value;
        const category = document.getElementById('proj-category').value;
        const desc = document.getElementById('proj-desc').value;
        // Nouvelle variable pour récupérer l'URL au lieu du fichier
        const imageUrl = document.getElementById('proj-image-url').value; 

        if (!imageUrl || !imageUrl.startsWith('http')) return alert("Veuillez coller une URL d'image valide.");

        const submitBtn = projectForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Publication en cours...";

        try {
            // A. SAUVEGARDE DES DONNÉES DANS FIRESTORE
            await addDoc(collection(db, "projets"), {
                titre: title,
                categorie: category,
                description: desc,
                // Utilisation directe de l'URL fournie
                imageUrl: imageUrl, 
                date: new Date()
            });

            alert("✅ Projet ajouté avec succès !");
            projectForm.reset();
            submitBtn.textContent = "Publier le projet";
            submitBtn.disabled = false;

            // Recharger la galerie pour voir le nouveau projet
            loadProjects();

        } catch (error) {
            console.error("Erreur critique lors de l'ajout:", error);
            alert("Erreur lors de l'ajout : " + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = "Publier le projet";
        }
    });
}


/* ==================================================================== */
/* ============= 4. GESTION DU FORMULAIRE DE CONTACT (MESSAGES) ============= */
/* ==================================================================== */

// Référence au formulaire de contact
const contactForm = document.querySelector('#contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";

        try {
            // Sauvegarde le message dans la collection 'messages'
            await addDoc(collection(db, "messages"), {
                nom: name,
                email: email,
                sujet: subject,
                message: message,
                date: new Date(),
                traite: false 
            });

            alert("✅ Votre message a été envoyé avec succès ! Consultez la base de données.");
            contactForm.reset();

        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
            alert("Erreur lors de l'envoi du message : " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Envoyer le message";
        }
    });
}

/* ==================================================================== */
/* ============= 6. SOUMISSION DES TÉMOIGNAGES PAR LE CLIENT ============= */
/* ==================================================================== */

const temoignageForm = document.querySelector('#add-temoignage-form');

if (temoignageForm) {
    temoignageForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const auteur = document.getElementById('tem-auteur').value;
        const note = document.getElementById('tem-note').value;
        const citation = document.getElementById('tem-citation').value;
        const messageDiv = document.getElementById('tem-message');

        const submitBtn = temoignageForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";
        messageDiv.textContent = "";

        try {
            // Sauvegarde le témoignage dans la collection 'temoignages'
            await addDoc(collection(db, "temoignages"), {
                auteur: auteur,
                note: note,
                citation: citation,
                date: new Date(),
                // Vous pouvez ajouter ici un champ 'approuve: false' si vous voulez modérer les avis
            });

            messageDiv.textContent = "✅ Merci ! Votre témoignage a été soumis et sera visible après le rechargement de la page.";
            temoignageForm.reset();
            
            // Rafraîchir l'affichage (optionnel, mais sympa)
            window.loadTestimonials();

        } catch (error) {
            console.error("Erreur lors de la soumission du témoignage :", error);
            messageDiv.textContent = "❌ Erreur lors de la soumission : " + error.message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Soumettre mon Témoignage";
        }
    });
}

/* ==================================================================== */
/* ============= 5. GESTION DES TÉMOIGNAGES (AFFICHAGE) ============= */
/* ==================================================================== */

/**
 * Génère le HTML des témoignages à partir de la base de données.
 */
window.loadTestimonials = async () => {
    const temoignagesSlider = document.querySelector('#temoignages-slider');
    if (!temoignagesSlider) return;

    temoignagesSlider.innerHTML = '<p class="loading-msg">Chargement des témoignages...</p>';

    const q = query(collection(db, "temoignages"), orderBy("date", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        let htmlContent = '';
        let count = 0;
        
        querySnapshot.forEach((doc) => {
            const temoignage = doc.data();
            const temoignageId = doc.id; // Récupère l'ID pour une potentielle suppression admin
            count++;
            
            // Note: Nous n'affichons pas le bouton de suppression sur le site public
            // L'ajout d'une interface d'admin pour les témoignages n'est pas prévue ici.

            htmlContent += `
                <div class="temoignages-item">
                    <i class='bx bxs-quote-alt-left'></i>
                    <p>${temoignage.citation}</p>
                    <h3>${temoignage.auteur}</h3>
                    <span>${temoignage.note}</span>
                </div>
            `;
        });
        
        if (count === 0) {
            temoignagesSlider.innerHTML = '<p class="info-msg">Aucun témoignage n\'a encore été publié.</p>';
        } else {
            temoignagesSlider.innerHTML = htmlContent;
        }


    } catch (error) {
        console.error("Erreur lors du chargement des témoignages :", error);
        temoignagesSlider.innerHTML = '<p class="error-msg">Impossible de charger les témoignages.</p>';
    }
};

// --- Appel de la fonction au chargement ---
window.loadTestimonials();