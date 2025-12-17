import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

/* ==================================================================== */
/* ======================== 1. CONFIGURATION FIREBASE ================= */
/* ==================================================================== */

// Configuration de votre projet
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
 * Fonction générique pour supprimer un document et rafraîchir la bonne liste.
 */
window.deleteItem = async (collectionName, id) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.`)) {
        return;
    }

    try {
        await deleteDoc(doc(db, collectionName, id));
        
        // Rafraîchir l'affichage correspondant
        if (collectionName === 'projets') {
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
            window.loadProjects(activeFilter); 
        } else if (collectionName === 'temoignages') {
            window.loadTestimonials();
        } else if (collectionName === 'messages') {
            window.loadMessages(); // <--- AJOUTÉ : Rafraîchit la boîte de réception
        }
        
        // Petit feedback visuel (optionnel)
        console.log("Suppression réussie");

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
        window.loadTestimonials(); // Rechargement immédiat
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        alert('Erreur lors de la mise à jour: ' + error.message);
    }
}

/* ==================================================================== */
/* ============= 3. GESTION DE L'AUTHENTIFICATION (ADMIN) ============= */
/* ==================================================================== */

const adminTrigger = document.getElementById('admin-trigger');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const closeModal = document.querySelector('.close-modal');
const adminPanel = document.getElementById('admin-panel');
const logoutBtn = document.getElementById('logout-btn');

// Gestionnaires d'événements UI pour le modal
if (adminTrigger && loginModal) adminTrigger.addEventListener('click', () => loginModal.classList.remove('hidden'));
if (closeModal && loginModal) closeModal.addEventListener('click', () => loginModal.classList.add('hidden'));

// Soumission du formulaire de connexion
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginModal.classList.add('hidden');
            loginForm.reset();
        } catch (error) {
            alert("Erreur de connexion : Email ou mot de passe incorrect.");
            console.error("Auth Error:", error); 
        }
    });
}

// Déconnexion
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.reload(); // Recharger la page pour être propre
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
        }
    });
}

// SURVEILLANCE DE L'ÉTAT D'AUTHENTIFICATION (Cœur du système)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- MODE ADMIN ---
        isAdmin = true;
        adminPanel?.classList.remove('hidden');
        adminTrigger?.classList.add('hidden');
        
        // Charger les données avec les droits Admin
        window.loadProjects('all'); 
        window.loadTestimonials(); 
        window.loadMessages(); // Charge la boîte de réception
    } else {
        // --- MODE PUBLIC ---
        isAdmin = false;
        adminPanel?.classList.add('hidden');
        adminTrigger?.classList.remove('hidden');
        
        // Charger les données en mode Public
        window.loadProjects('all');
        window.loadTestimonials(); // Charge uniquement les approuvés
    }
});

/* ==================================================================== */
/* ============= 4. GESTION DES PROJETS (CRUD + FILTRAGE) ============= */
/* ==================================================================== */

const addProjectForm = document.getElementById('add-project-form');
const portfolioList = document.getElementById('portfolio-list');

// Ajout d'un projet
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('proj-title').value;
        const category = document.getElementById('proj-category').value;
        const description = document.getElementById('proj-desc').value;
        const imageUrl = document.getElementById('proj-image-url').value;

        try {
            await addDoc(collection(db, "projets"), {
                title, category, description, imageUrl,
                timestamp: new Date()
            });
            alert('Projet publié avec succès !');
            addProjectForm.reset();
            window.loadProjects('all');
        } catch (error) {
            console.error("Erreur ajout projet:", error);
            alert("Erreur: " + error.message);
        }
    });
}

// Chargement des projets
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
                </div>`;
        });

        portfolioList.innerHTML = htmlContent;
        if (window.setupPortfolioFilter) window.setupPortfolioFilter();

    } catch (error) {
        console.error("Erreur chargement projets:", error);
    }
};

/* ==================================================================== */
/* ============= 5. GESTION DES TÉMOIGNAGES (PUBLIC & ADMIN) ========== */
/* ==================================================================== */

window.loadTestimonials = async () => {
    const temoignagesSlider = document.querySelector('#temoignages-slider');
    const adminTemoignagesList = document.querySelector('#admin-temoignages-list'); 

    // Requêtes
    const publicQ = query(collection(db, "temoignages"), where("approved", "==", true), orderBy("date", "desc"));
    const adminQ = query(collection(db, "temoignages"), orderBy("date", "desc"));

    try {
        // 1. PARTIE PUBLIQUE
        const publicSnapshot = await getDocs(publicQ);
        let publicHtmlContent = '';
        let publicCount = 0;
        
        publicSnapshot.forEach((doc) => {
            const t = doc.data();
            publicCount++;
            publicHtmlContent += `
                <div class="temoignages-item">
                    <i class='bx bxs-quote-alt-left'></i>
                    <p>${t.citation || ''}</p>
                    <h3>${t.auteur || 'Client'}</h3>
                    <span>${t.note || ''}</span>
                </div>`;
        });
        
        if (temoignagesSlider) {
            temoignagesSlider.innerHTML = publicCount === 0 
                ? '<p class="info-msg">Aucun témoignage pour le moment.</p>' 
                : publicHtmlContent;
            
            // Relancer le slider si la fonction existe (dans script.js)
            if (window.initTestimonialSlider) window.initTestimonialSlider();
        }
        
        // 2. PARTIE ADMIN
        if (adminTemoignagesList && isAdmin) {
            const adminSnapshot = await getDocs(adminQ);
            let adminHtmlContent = '';
            let adminCount = 0;
            
            adminSnapshot.forEach((doc) => {
                const t = doc.data();
                const id = doc.id; 
                adminCount++;
                const isApproved = t.approved === true;
                const formattedDate = t.date && t.date.toDate ? t.date.toDate().toLocaleDateString() : 'Date inconnue'; 

                // Boutons dynamiques
                let actionButtons = `<button onclick="window.deleteItem('temoignages', '${id}')" class="delete-btn" style="background: #990000; color: white; border: none; padding: 8px 15px; margin-left: 10px; border-radius: 4px;"><i class='bx bx-trash'></i> Supprimer</button>`;
                
                if (!isApproved) {
                    actionButtons = `<button onclick="window.updateStatus('${id}', true)" class="btn" style="background: var(--clr-gold); margin-right: 10px; padding: 8px 15px; border-radius: 4px;"><i class='bx bx-check'></i> Approuver</button>${actionButtons}`;
                } else {
                    actionButtons = `<button onclick="window.updateStatus('${id}', false)" class="btn" style="background: var(--clr-dark); margin-right: 10px; padding: 8px 15px; border-radius: 4px;"><i class='bx bx-minus'></i> Masquer</button>${actionButtons}`;
                }

                adminHtmlContent += `
                    <div class="admin-temoignage-box" style="background: #fff; padding: 15px; margin-bottom: 10px; border: 1px solid #ddd; border-left: 5px solid ${isApproved ? 'green' : 'red'};">
                        <p><strong>Statut :</strong> ${isApproved ? '<span style="color:green">Public</span>' : '<span style="color:red">En Attente</span>'}</p>
                        <p><strong>De:</strong> ${t.auteur} (${t.note})</p>
                        <p><i>"${t.citation}"</i></p>
                        <p style="font-size: 0.8em; color: #666;">${formattedDate}</p>
                        <div style="text-align: right; margin-top: 10px;">${actionButtons}</div>
                    </div>`;
            });

            adminTemoignagesList.innerHTML = adminCount === 0 ? '<p>Aucun témoignage à modérer.</p>' : adminHtmlContent;
        }

    } catch (error) {
        console.error("Erreur témoignages:", error);
    }
};

/* ==================================================================== */
/* ============= 6. SOUMISSION DES TÉMOIGNAGES PAR LE CLIENT ========== */
/* ==================================================================== */

const temoignageForm = document.querySelector('#add-temoignage-form');

if (temoignageForm) {
    temoignageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = temoignageForm.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('tem-message');
        
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi...";

        try {
            await addDoc(collection(db, "temoignages"), {
                auteur: document.getElementById('tem-auteur').value,
                note: document.getElementById('tem-note').value,
                citation: document.getElementById('tem-citation').value,
                date: new Date(),
                approved: false
            });
            messageDiv.textContent = "✅ Merci ! Votre témoignage sera publié après validation.";
            temoignageForm.reset();
        } catch (error) {
            console.error("Erreur envoi témoignage:", error);
            messageDiv.textContent = "❌ Erreur technique.";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Soumettre mon Témoignage";
        }
    });
}

/* ==================================================================== */
/* ============ 7. GESTION DU FORMULAIRE DE CONTACT (CLIENT) ========== */
/* ==================================================================== */

const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi...";
        
        try {
            await addDoc(collection(db, "messages"), {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value,
                date: new Date()
            });
            alert('Votre message a été envoyé avec succès !');
            contactForm.reset();
        } catch (error) {
            console.error("Erreur contact:", error);
            alert("Erreur lors de l'envoi.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Envoyer le Message";
        }
    });
}

/* ==================================================================== */
/* ============= 8. BOÎTE DE RÉCEPTION DES MESSAGES (ADMIN) =========== */
/* ==================================================================== */

window.loadMessages = async () => {
    const adminMessagesList = document.querySelector('#admin-messages-list');
    if (!adminMessagesList) return;

    if (!isAdmin) {
        adminMessagesList.innerHTML = '<p class="info-msg">Accès réservé.</p>';
        return;
    }

    // IMPORTANT : Si cette requête échoue, vérifiez la console pour créer l'INDEX Firebase
    const q = query(collection(db, "messages"), orderBy("date", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        let htmlContent = '';
        let count = 0;

        querySnapshot.forEach((doc) => {
            const m = doc.data();
            count++;
            const formattedDate = m.date && m.date.toDate ? m.date.toDate().toLocaleString() : 'Date inconnue';

            htmlContent += `
                <div class="admin-message-box" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 0.5rem; background: #fff;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <p><strong>${m.name}</strong> <span style="font-size:0.9em; color:#666;">(${m.email})</span></p>
                            <p style="font-size:0.9em;">📞 ${m.phone || 'Non fourni'}</p>
                        </div>
                        <span style="font-size:0.8em; color:#888;">${formattedDate}</span>
                    </div>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
                    <p><strong>Sujet:</strong> ${m.subject}</p>
                    <p style="white-space: pre-wrap; margin-top: 10px; background:#f9f9f9; padding:10px; border-radius:4px;">${m.message}</p>
                    
                    <div style="text-align: right; margin-top: 10px;">
                        <button onclick="window.deleteItem('messages', '${doc.id}')" class="delete-btn" style="background: #990000; color: white; border: none; padding: 8px 15px; border-radius: 4px;">
                            <i class='bx bx-trash'></i> Archiver
                        </button>
                    </div>
                </div>`;
        });

        adminMessagesList.innerHTML = count === 0 ? '<p>Aucun message reçu.</p>' : htmlContent;

    } catch (error) {
        console.error("Erreur chargement messages (Avez-vous créé l'index ?):", error);
        // Lien d'aide si l'index manque
        if(error.code === 'failed-precondition') {
             adminMessagesList.innerHTML = '<p style="color:red">⚠️ Erreur d\'index Firebase. Ouvrez la console du navigateur (F12) et cliquez sur le lien fourni par Firebase pour activer le tri des messages.</p>';
        } else {
             adminMessagesList.innerHTML = '<p style="color:red">Impossible de charger les messages.</p>';
        }
    }
};

/* ==================================================================== */
/* ============= 9. INTÉGRATIONS EXTERNES (BOTPRESS) ================== */
/* ==================================================================== */

function loadExternalServices() {
    // 1. Script d'injection
    const botpressInject = document.createElement('script');
    botpressInject.src = "https://cdn.botpress.cloud/webchat/v3.5/inject.js";
    botpressInject.async = true;
    document.head.appendChild(botpressInject);

    botpressInject.onload = () => {
        // 2. Votre configuration spécifique
        const botpressConfig = document.createElement('script');
        botpressConfig.src = "https://files.bpcontent.cloud/2025/12/16/01/20251216012441-91PE11FM.js";
        botpressConfig.defer = true;
        document.head.appendChild(botpressConfig);

        botpressConfig.onload = () => {
            // 3. Envoyer un message automatique après 3 secondes
            setTimeout(() => {
                window.botpressWebChat.sendEvent({ type: 'show' }); // Ouvre la fenêtre
            }, 3000); 
        };
    };
}

document.addEventListener('DOMContentLoaded', loadExternalServices);