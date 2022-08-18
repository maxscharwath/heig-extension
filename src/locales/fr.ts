export default {
  routes: {
    grade: 'Notes',
    menu: 'Menu',
    settings: 'Réglages',
    debug: 'Débogage',
    chat: 'Chat',
  },
  weeks: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  },
  grades: {
    lastCheckAt: 'Dernière vérification à',
    hasExam: 'A un examen',
    checkAll: 'Tout marquer',
  },
  menu: {
    menuOfDay: 'Menu du jour',
    noMenu: 'Pas de menu disponible aujourd\'hui...',
  },
  settings: {
    title: 'Réglages',
    email: 'Email',
    password: 'Mot de passe',
    username: 'Nom d\'utilisateur',
    phone: 'Téléphone',
    address: 'Adresse',
    birthday: 'Date de naissance',
    gapsCredentials: {
      title: 'Gaps Connexion',
      alert: {
        success: 'Connexion réussie',
        error: 'Connexion échouée',
      },
      status: {
        pending: 'En cours...',
        connectedToken: 'Connecté avec le token',
        connectedCredentials: 'Connecté avec les identifiants',
        notConnected: 'Non connecté',
        unknown: 'Inconnu',
      },
    },
    logout: 'Déconnexion',
    login: 'Connexion',
    save: 'Enregistrer',
    reload: 'Recharger l\'extension',
    clearCache: {
      title: 'Vider le cache',
    },
    language: {
      title: 'Langue',
    },
    alarm: {
      title: 'Verification des notes',
      data: 'Toutes les {0} minutes',
    },
  },
  chat: {
    alert: {
      needToBeConnected: 'Vous devez être connecté pour pouvoir discuter',
    },
    sendMessage: 'Envoyer un message',
  },
};
