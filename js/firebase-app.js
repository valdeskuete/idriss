import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

/* ==================================================================== */
/* ======================== 1. CONFIGURATION FIREBASE ======================== */
/* ==================================================================== */

// !!! VEUILLEZ REMPLACER CES VALEURS PAR VOS PROPRES CLÉS DE CONFIGURATION FIREBASE !!!
const firebaseConfig = {
    apiKey: "AIzaSyDF7XWK56sp4x5ASvi0ipzkTrcp4bZEfwo",
    authDomain: "youssouf-paris-meuble.firebaseapp.com",
    projectId: "youssouf-paris-meuble",
    storageBucket: "youssouf-paris-meuble.firebasestorage.app",
    messagingSenderId: "149032130636",
    
};

// Initialisation des services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales pour l'état d'authentification
let isAdmin = false;

/* ==================================================================== */
/* ================== 2. FONCTIONS GÉNÉRIQUES (CRUD) ================== */
/* ==================================================================== */

/**
 * Fonction générique pour supprimer un document (projet ou témoignage).
 * @param {string} collectionName - Nom de la collection (ex: 'projets', 'temoignages').
 * @param {string} id - ID du document à supprimer.
 */
window.deleteItem = async (collectionName, id) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet élément (${collectionName}) ? Cette action est irréversible.`)) {
        return;
    }

    try {
        await deleteDoc(doc(db, collectionName, id));
        alert('Suppression réussie !');
        
        // Rafraîchir l'affichage
        if (collectionName === 'projets') {
            // Recharger les projets pour le filtre actif
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
            window.loadProjects(activeFilter); 
        } else if (collectionName === 'temoignages') {
            window.loadTestimonials();
        }

    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert('Erreur lors de la suppression: ' + error.message);
    }
}

/**
 * Met à jour le statut (approuvé/non approuvé) d'un témoignage.
 */
window.updateStatus = async (id, status) => {
    try {
        await updateDoc(doc(db, "temoignages", id), {
            approved: status
        });
        alert(status ? 'Témoignage approuvé et publié !' : 'Témoignage mis en attente !');
        window.loadTestimonials(); // Rechargement
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        alert('Erreur lors de la mise à jour: ' + error.message);
    }
}


/* ==================================================================== */
/* ============= 3. GESTION DE L'AUTHENTIFICATION (ADMIN) ============= */
/* ==================================================================== */

// Récupération des éléments DOM
const adminTrigger = document.getElementById('admin-trigger');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const closeModal = document.querySelector('.close-modal');
const adminPanel = document.getElementById('admin-panel');
const logoutBtn = document.getElementById('logout-btn');


// Afficher le modal de connexion
if (adminTrigger && loginModal) {
    adminTrigger.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });
}

// Fermer le modal
if (closeModal && loginModal) {
    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });
}

// Soumission du formulaire de connexion
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Assurez-vous que ces IDs correspondent à index.html
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            // C'EST LA LIGNE CRITIQUE : Vérifiez les imports en haut du fichier !
            await signInWithEmailAndPassword(auth, email, password);
            
            loginModal.classList.add('hidden');
            loginForm.reset();
            // onAuthStateChanged gérera l'affichage du panneau
        } catch (error) {
            alert("Erreur de connexion: Email ou mot de passe incorrect.");
            // Le message d'erreur réel s'affiche ici. 
            console.error("Erreur Firebase Auth :", error); 
        }
    });
}

// Déconnexion
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // onAuthStateChanged gérera la masquage du panneau
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
        }
    });
}

// Vérification de l'état d'authentification en temps réel
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Utilisateur connecté
        isAdmin = true;
        adminPanel?.classList.remove('hidden');
        adminTrigger?.classList.add('hidden');
        window.loadProjects('all'); // Recharger les projets pour afficher les boutons admin
        window.loadTestimonials(); // Recharger les témoignages pour l'admin
        window.loadMessages(); // <--- AJOUT CRITIQUE ICI
    } else {
        // Utilisateur déconnecté
        isAdmin = false;
        adminPanel?.classList.add('hidden');
        adminTrigger?.classList.remove('hidden');
        window.loadProjects('all'); // Recharger les projets sans les boutons admin
    }

  
});


/* ==================================================================== */
/* ============= 4. GESTION DES PROJETS (CRUD + FILTRAGE) ============= */
/* ==================================================================== */

const addProjectForm = document.getElementById('add-project-form');
const portfolioList = document.getElementById('portfolio-list');

// Soumission du formulaire d'ajout de projet
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('proj-title').value;
        const category = document.getElementById('proj-category').value;
        const description = document.getElementById('proj-desc').value;
        const imageUrl = document.getElementById('proj-image-url').value;

        try {
            await addDoc(collection(db, "projets"), {
                title: title,
                category: category,
                description: description,
                imageUrl: imageUrl,
                timestamp: new Date()
            });

            alert('Projet publié avec succès !');
            addProjectForm.reset();
            window.loadProjects('all'); // Recharger la liste
        } catch (error) {
            console.error("Erreur lors de l'ajout du projet:", error);
            alert("Erreur lors de l'ajout du projet: " + error.message);
        }
    });
}

/**
 * Charge les projets depuis la base de données avec un filtre.
 * @param {string} filter - La catégorie à filtrer ('all', 'ameublement', etc.)
 */
window.loadProjects = async (filter) => {
    if (!portfolioList) return;

    let q = query(collection(db, "projets"), orderBy("timestamp", "desc"));
    if (filter !== 'all') {
        q = query(collection(db, "projets"), where("category", "==", filter), orderBy("timestamp", "desc"));
    }

    try {
        const querySnapshot = await getDocs(q);
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const project = doc.data();
            const projectId = doc.id;
            
            // Logique pour le bouton de suppression (uniquement si l'administrateur est connecté)
            const adminButton = isAdmin ? 
                `<div class="admin-controls">
                    <button onclick="window.deleteItem('projets', '${projectId}')" class="delete-btn">
                        <i class='bx bx-trash'></i> Supprimer
                    </button>
                </div>` : '';
            
            htmlContent += `
                <div class="portfolio-box" data-category="${project.category}">
                    <img src="${project.imageUrl}" alt="${project.title}">
                    <div class="portfolio-layer">
                        <h4>${project.title}</h4>
                        <p>${project.description}</p>
                    </div>
                    ${adminButton}
                </div>
            `;
        });

        portfolioList.innerHTML = htmlContent;
        // La fonction UI (script.js) est appelée ici pour réinitialiser les événements
        if (window.setupPortfolioFilter) {
            window.setupPortfolioFilter();
        }

    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
        portfolioList.innerHTML = '<p class="error-msg">Impossible de charger les projets.</p>';
    }
};

// Charge les projets initiaux
window.loadProjects('all');


/* ==================================================================== */
/* ============= 5. GESTION DES TÉMOIGNAGES (MODÉRATION + PUBLIC) ============= */
/* ==================================================================== */

/**
 * Génère le HTML des témoignages pour le public et l'admin.
 */
window.loadTestimonials = async () => {
    const temoignagesSlider = document.querySelector('#temoignages-slider');
    const adminTemoignagesList = document.querySelector('#admin-temoignages-list'); 

    // Requête pour l'affichage public : seulement les approuvés
    const publicQ = query(collection(db, "temoignages"), where("approved", "==", true), orderBy("date", "desc"));
    
    // Requête pour l'administration : tous, approuvés et en attente
    const adminQ = query(collection(db, "temoignages"), orderBy("date", "desc"));

    try {
        // --- PUBLIC : Affichage des témoignages approuvés ---
        const publicSnapshot = await getDocs(publicQ);
        let publicHtmlContent = '';
        let publicCount = 0;
        
        publicSnapshot.forEach((doc) => {
            const temoignage = doc.data();
            publicCount++;
            
            publicHtmlContent += `
                <div class="temoignages-item">
                    <i class='bx bxs-quote-alt-left'></i>
                    <p>${temoignage.citation}</p>
                    <h3>${temoignage.auteur}</h3>
                    <span>${temoignage.note}</span>
                </div>
            `;
        });
        
        if (temoignagesSlider) {
            if (publicCount === 0) {
                temoignagesSlider.innerHTML = '<p class="info-msg">Soyez le premier à laisser votre témoignage !</p>';
            } else {
                temoignagesSlider.innerHTML = publicHtmlContent;
            }
        }
        
        // --- ADMIN : Affichage de tous les témoignages pour modération ---
       // --- ADMIN : Affichage de tous les témoignages pour modération ---
            if (adminTemoignagesList && isAdmin) {
                const adminSnapshot = await getDocs(adminQ);
                let adminHtmlContent = '';
                let adminCount = 0;
                
                adminSnapshot.forEach((doc) => {
                    const temoignage = doc.data();
                    const temoignageId = doc.id; 
                    adminCount++; // Compte les documents avant toute erreur
                    const isApproved = temoignage.approved === true;
                    
                    // NOUVEAU: SÉCURISATION DE LA DATE. C'EST LA CORRECTION CRITIQUE.
                    const formattedDate = temoignage.date && temoignage.date.toDate ? 
                                          temoignage.date.toDate().toLocaleDateString() : 
                                          'Date inconnue'; 

                    // 1. Bouton(s) d'action
                    let actionButtons = `<button onclick="window.deleteItem('temoignages', '${temoignageId}')" class="delete-btn" style="background: #990000; color: white; border: none; padding: 8px 15px; font-size: 0.9rem; margin-left: 10px;">
                                        <i class='bx bx-trash'></i> Supprimer
                                    </button>`;
                    let statusLabel = isApproved ? 
                        '<span style="color: green; font-weight: bold;">Approuvé (Public)</span>' : 
                        '<span style="color: red; font-weight: bold;">En Attente (Privé)</span>';
                    
                    if (!isApproved) {
                        // Ajoute un bouton Approuver pour les éléments en attente
                        actionButtons = `
                            <button onclick="window.updateStatus('${temoignageId}', true)" class="btn" style="background: var(--clr-gold); margin-right: 10px; padding: 8px 15px; font-size: 0.9rem;">
                                <i class='bx bx-check'></i> Approuver
                            </button>
                            ${actionButtons}
                        `;
                    } else {
                        // Ajoute un bouton 'Mettre en attente' si déjà approuvé
                        actionButtons = `
                            <button onclick="window.updateStatus('${temoignageId}', false)" class="btn" style="background: var(--clr-dark); margin-right: 10px; padding: 8px 15px; font-size: 0.9rem;">
                                <i class='bx bx-minus'></i> Mettre en attente
                            </button>
                            ${actionButtons}
                        `;
                    }

                    // 2. Construction de la boîte admin
                    adminHtmlContent += `
                        <div class="admin-temoignage-box">
                            <p><strong>Statut :</strong> ${statusLabel}</p>
                            <p><strong>De:</strong> ${temoignage.auteur} (${temoignage.note})</p>
                            <p class="citation-text">"${temoignage.citation}"</p>
                            <p class="date-text">Soumis le: ${formattedDate}</p>
                            
                            <div style="text-align: right; margin-top: 10px;">${actionButtons}</div>
                        </div>
                    `;
                });

                if (adminCount === 0) {
                    adminTemoignagesList.innerHTML = '<p class="info-msg">Aucun témoignage à modérer.</p>';
                } else {
                    adminTemoignagesList.innerHTML = adminHtmlContent;
                }
            }


    } catch (error) {
        console.error("Erreur lors du chargement des témoignages :", error);
        if (temoignagesSlider) {
            temoignagesSlider.innerHTML = '<p class="error-msg">Impossible de charger les témoignages.</p>';
        }
    }
};
// Charge les témoignages initiaux
window.loadTestimonials();

// Charge les messages initiaux pour le conteneur admin (sera écrasé à la connexion)
window.loadMessages(); // <--- AJOUT CRITIQUE ICI


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
            await addDoc(collection(db, "temoignages"), {
                auteur: auteur,
                note: note,
                citation: citation,
                date: new Date(),
                approved: false // <--- MODÉRATION ACTIVÉE
            });

            messageDiv.textContent = "✅ Merci ! Votre témoignage a été soumis à l'administrateur pour validation.";
            temoignageForm.reset();
            
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
/* ============ 7. GESTION DU FORMULAIRE DE CONTACT (MESSAGES) ============= */
/* ==================================================================== */

const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const phone = document.getElementById('contact-phone').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi...";
        
        try {
            await addDoc(collection(db, "messages"), {
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message,
                date: new Date()
            });

            alert('Votre message a été envoyé avec succès. Nous vous recontacterons bientôt !');
            contactForm.reset();
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            alert("Erreur lors de l'envoi du message: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Envoyer le Message";
        }
    });
}
/* ==================================================================== */
/* ============= 8. GESTION DES MESSAGES DE CONTACT (ADMIN) ============= */
/* ==================================================================== */

/**
 * CHARGE ET AFFICHE TOUS LES MESSAGES DE CONTACT POUR L'ADMINISTRATEUR.
 */
window.loadMessages = async () => {
    const adminMessagesList = document.querySelector('#admin-messages-list');
    if (!adminMessagesList) return;

    if (!isAdmin) {
        // Ne charge pas les messages si l'utilisateur n'est pas admin
        adminMessagesList.innerHTML = '<p class="info-msg">Accès réservé à l\'administrateur.</p>';
        return;
    }

    // Requête : Tous les messages, triés par date (du plus récent au plus ancien)
    const q = query(collection(db, "messages"), orderBy("date", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        let htmlContent = '';
        let messageCount = 0;

        querySnapshot.forEach((doc) => {
            const message = doc.data();
            const messageId = doc.id;
            messageCount++;

            // Sécurisation de la date
            const formattedDate = message.date && message.date.toDate ? 
                                  message.date.toDate().toLocaleString() : 
                                  'Date inconnue';

            htmlContent += `
                <div class="admin-message-box" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 0.5rem; background: #fff;">
                    <p style="font-weight: bold;">De: ${message.name} (${message.email})</p>
                    <p><strong>Sujet:</strong> ${message.subject}</p>
                    <p><strong>Téléphone:</strong> ${message.phone || 'Non fourni'}</p>
                    <p style="white-space: pre-wrap; margin: 10px 0;">${message.message}</p>
                    <p style="font-size: 0.8em; color: #777;">Reçu le: ${formattedDate}</p>

                    <div style="text-align: right; margin-top: 10px;">
                        <button onclick="window.deleteItem('messages', '${messageId}')" class="delete-btn" style="background: #990000; color: white; border: none; padding: 8px 15px; font-size: 0.9rem; border-radius: 0.5rem;">
                            <i class='bx bx-trash'></i> Archiver/Supprimer
                        </button>
                    </div>
                </div>
            `;
        });

        if (messageCount === 0) {
            adminMessagesList.innerHTML = '<p class="info-msg">Aucun message de contact reçu pour l\'instant.</p>';
        } else {
            adminMessagesList.innerHTML = htmlContent;
        }

    } catch (error) {
        console.error("Erreur lors du chargement des messages :", error);
        adminMessagesList.innerHTML = '<p class="error-msg" style="color: red;">Impossible de charger les messages.</p>';
    }
};