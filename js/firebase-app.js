/* ==========================================================
   FIREBASE APP - GESTION DYNAMIQUE (AUTH, DATABASE & STORAGE)
   ========================================================== */

// 1. IMPORT DES FONCTIONS FIREBASE (SDK MODULAIRE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const storage = getStorage(app);

// DOM ELEMENTS
const loginModal = document.getElementById('login-modal');
const adminPanel = document.getElementById('admin-panel');
const adminTrigger = document.getElementById('admin-trigger');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const projectForm = document.getElementById('add-project-form');
const portfolioList = document.getElementById('portfolio-list');
const uploadProgress = document.getElementById('upload-progress');


/* ==================== 1. GESTION DE L'AUTHENTIFICATION ==================== */

// Vérifier si l'utilisateur est connecté (Admin)
onAuthStateChanged(auth, (user) => {
    if (user) {
        adminPanel.classList.remove('hidden');
        loginModal.classList.add('hidden');
        adminTrigger.style.display = 'none'; 
    } else {
        adminPanel.classList.add('hidden');
        adminTrigger.style.display = 'block';
    }
});

// Ouvrir le modal login
adminTrigger.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
});

// Fermer le modal (croix)
document.querySelector('.close-modal').addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

// Connexion (Login)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginForm.reset();
            // Le onAuthStateChanged ci-dessus va gérer l'affichage de l'Admin Panel
            alert("Bienvenue Maître Artisan !");
        })
        .catch((error) => {
            alert("Erreur de connexion : Vérifiez l'email et le mot de passe.");
        });
});

// Déconnexion
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Déconnecté avec succès.");
        // Redémarrer le chargement des projets pour garantir la visibilité publique
        loadProjects(); 
        window.location.reload();
    });
});


/* ==================== 2. LECTURE DES PROJETS (GALERIE) ==================== */

// Fonction pour générer le HTML d'un projet
function createProjectHTML(projet) {
    return `
        <div class="portfolio-box" data-category="${projet.categorie}">
            <img src="${projet.imageUrl}" alt="${projet.titre}">
            <div class="portfolio-layer">
                <h4>${projet.titre}</h4>
                <p>${projet.description}</p>
                <a href="${projet.imageUrl}" target="_blank" title="Voir l'image en grand"><i class='bx bx-search-alt-2'></i></a>
            </div>
        </div>
    `;
}

// Fonction pour charger et afficher tous les projets
window.loadProjects = async function(filterCategory = 'all') {
    portfolioList.innerHTML = '<p style="color:white; text-align:center;">Chargement des réalisations en cours...</p>';
    
    // Requête : on trie par date pour que les plus récents apparaissent en premier
    const q = query(collection(db, "projets"), orderBy("date", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        let htmlContent = '';
        let projectsCount = 0;

        querySnapshot.forEach((doc) => {
            const projet = doc.data();
            // Filtrage côté client (plus simple pour la galerie filtrable)
            if (filterCategory === 'all' || projet.categorie === filterCategory) {
                 htmlContent += createProjectHTML(projet);
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

        // Si la fonction de filtrage existe (dans script.js), on la réinitialise
        if(window.setupPortfolioFilter) window.setupPortfolioFilter(); 

    } catch (error) {
        console.error("Erreur chargement des projets:", error);
        portfolioList.innerHTML = '<p style="color:white; text-align:center;">Erreur de connexion à la base de données.</p>';
    }
}

// Lancement au démarrage
loadProjects();

/* ==================== 3. AJOUT DE PROJET (SANS UPLOAD) ==================== */

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
        // A. SAUVEGARDE DES DONNÉES DANS FIRESTORE (sans passer par l'upload)
        await addDoc(collection(db, "projets"), {
            titre: title,
            categorie: category,
            description: desc,
            // Utilisation directe de l'URL fournie
            imageUrl: imageUrl, 
            date: new Date()
        });

        alert("✅ Projet ajouté avec succès ! (Utilisation d'une URL externe)");
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

/* ==================== 3. AJOUT DE PROJET (UPLOAD & SAVE) ==================== */

    /*projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('proj-title').value;
        const category = document.getElementById('proj-category').value;
        const desc = document.getElementById('proj-desc').value;
        const file = document.getElementById('proj-image').files[0];

        if (!file) return alert("Veuillez sélectionner une image.");

        const submitBtn = projectForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Téléchargement en cours (0%)...";

        try {
            // A. UPLOAD IMAGE VERS FIREBASE STORAGE
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, 'projets/' + fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Suivi de la progression (Barre de progression visuelle)
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    uploadProgress.style.width = progress + '%';
                    submitBtn.textContent = `Téléchargement en cours (${Math.round(progress)}%)...`;
                }, 
                (error) => {
                    throw new Error("Erreur d'upload : " + error.message);
                }, 
                async () => {
                    // B. SAUVEGARDE DES DONNÉES DANS FIRESTORE
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    await addDoc(collection(db, "projets"), {
                        titre: title,
                        categorie: category,
                        description: desc,
                        imageUrl: downloadURL,
                        date: new Date()
                    });

                    alert("✅ Projet ajouté avec succès !");
                    projectForm.reset();
                    uploadProgress.style.width = '0%';
                    submitBtn.textContent = "Publier le projet";
                    submitBtn.disabled = false;
                    
                    // Recharger la galerie pour voir le nouveau projet
                    loadProjects();
                }
            );

        } catch (error) {
            console.error("Erreur critique :", error);
            alert("Erreur lors de l'ajout : " + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = "Publier le projet";
            uploadProgress.style.width = '0%';
        }
    });*/


