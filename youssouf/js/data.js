/* ==================================================================== */
/* === FICHIER DE DONNÉES : PROJETS ET TÉMOIGNAGES (FACILE À METTRE À JOUR) === */
/* ==================================================================== */

// Le code dans script.js va lire ces tableaux pour générer le HTML dynamiquement.
// Pour ajouter un projet ou un témoignage, il suffit de copier-coller un bloc existant
// et de modifier les valeurs à l'intérieur des accolades { }.

/* -------------------- TABLEAU DES PROJETS -------------------- */
/* CATÉGORIES POSSIBLES :
   - 'ameublement' (Lits, Armoires, Tables, Chaises, Canapés)
   - 'agencement' (Cuisines, Bureaux, Portes)
   - 'renovation' (Réfection, Charpenterie, Tapisserie)
*/
const projetsData = [
    /* 1. Projet d'Ameublement */
    {
        titre: "Lit King Size Design Moderne",
        description: "Création d'un lit King Size en bois de Noyer avec tête de lit capitonnée sur mesure.",
        image: "images/projets/lit-modern.jpg", // Nom de l'image (à placer dans le dossier images/projets/)
        categorie: "ameublement"
    },
    
    /* 2. Projet d'Agencement */
    {
        titre: "Cuisine Équipée et Aménagée",
        description: "Conception et installation d'une cuisine complète en chêne, optimisant l'espace et la fonctionnalité.",
        image: "images/projets/cuisine-amenagee.jpg",
        categorie: "agencement"
    },

    /* 3. Projet de Rénovation */
    {
        titre: "Réfection d'un Canapé d'Angle",
        description: "Remise à neuf d'un canapé ancien : structure, mousse et tapisserie neuves pour un look moderne.",
        image: "images/projets/canape-refait.jpg",
        categorie: "renovation"
    },

    /* 4. Projet d'Ameublement (Suite) */
    {
        titre: "Armoire 4 Portes Coulissantes",
        description: "Fabrication d'une grande armoire en bois massif avec miroirs intégrés pour un dressing élégant.",
        image: "images/projets/armoire-luxe.jpg",
        categorie: "ameublement"
    },

    /* 5. Projet d'Agencement (Suite) */
    {
        titre: "Porte d'Entrée en Acajou Massif",
        description: "Installation d'une porte d'entrée personnalisée, sécurisée et isolante, avec finitions vernies.",
        image: "images/projets/porte-bois.jpg",
        categorie: "agencement"
    },
    
    /* 6. PROJET PLACEHOLDER (COPIEZ/COLLEZ POUR AJOUTER) */
    {
        titre: "Chaise de Bureau Ergonomique",
        description: "Création d'une chaise de bureau en bois et cuir, alliant confort et durabilité.",
        image: "images/projets/chaise-bureau.jpg",
        categorie: "ameublement"
    },
    
    /* 7. PROJET PLACEHOLDER */
    {
        titre: "Bibliothèque Sur Mesure Murale",
        description: "Agencement d'un mur complet pour une grande bibliothèque d'angle, finitions parfaites.",
        image: "images/projets/bibliotheque-surmesure.jpg",
        categorie: "agencement"
    },

    /* 8. PROJET PLACEHOLDER */
    {
        titre: "Terrasse et Charpente en Iroko",
        description: "Construction d'une charpente extérieure solide et d'une terrasse en bois exotique durable.",
        image: "images/projets/charpente-terrasse.jpg",
        categorie: "renovation"
    },
    
    /* 9. PROJET PLACEHOLDER */
    {
        titre: "Table de Salle à Manger 8 Places",
        description: "Conception d'une grande table familiale en bois de Tali pour un style rustique et chic.",
        image: "images/projets/table-famille.jpg",
        categorie: "ameublement"
    },
    
    /* 10. PROJET PLACEHOLDER */
    {
        titre: "Comptoir de Réception Professionnel",
        description: "Création d'un comptoir d'accueil pour un bureau, intégrant des solutions de rangement et d'éclairage.",
        image: "images/projets/comptoir-accueil.jpg",
        categorie: "agencement"
    },
    // ***************** AJOUTEZ VOS NOUVEAUX PROJETS CI-DESSOUS *****************
    // N'oubliez pas la virgule après l'accolade de fermeture du bloc précédent.
];


/* -------------------- TABLEAU DES TÉMOIGNAGES -------------------- */
const temoignagesData = [
    {
        citation: "L'armoire est magnifique ! La qualité des finitions est bien au-delà de ce que j'espérais. Délais respectés et un service client irréprochable. Vraiment 'de Paris Meuble' !",
        auteur: "Mme. Tchami, Douala",
        note: "5 étoiles"
    },
    {
        citation: "Notre nouvelle cuisine est une œuvre d'art. Youssouf a su optimiser le moindre espace et le bois est d'une noblesse rare. Je recommande à 100%.",
        auteur: "M. Ekwalla, Yaoundé",
        note: "5 étoiles"
    },
    {
        citation: "J'avais besoin de refaire les chaises anciennes de ma grand-mère. Le travail de réfection est impressionnant. On dirait qu'elles sortent d'usine, avec l'âme du passé en plus.",
        auteur: "Mlle. Fotso, Bafoussam",
        note: "4.5 étoiles"
    },
    {
        citation: "J'ai été bluffé par la robustesse et le design de mon bureau. Un vrai professionnel du bois. La livraison à Babadjou s'est faite sans aucun problème.",
        auteur: "Dr. Njoya, Babadjou",
        note: "5 étoiles"
    },
    {
        citation: "Un artisan passionné et minutieux. Il a transformé mes idées de salon en canapé et tables basses sublimes. Un grand merci à l'équipe !",
        auteur: "Famille Sanga, Bonamoussadi",
        note: "5 étoiles"
    },
    // ***************** AJOUTEZ VOS NOUVEAUX TÉMOIGNAGES CI-DESSOUS *****************
];