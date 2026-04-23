export const fr = {
  appName: "Quizzy",
  common : {
    'ok': 'Ok',
  },
  header : {
    statusTooltip: {
      ko: 'Accés : Quiz de démos uniquement',
      partial: 'Accés : Quiz de démos uniquement',
      ok: 'Accés aux quiz disponibles',
      pending: 'Accés serveur en cours...'
    },
    userMissing: 'Utilisateur inconnu (issue #4)',
    userMenu: 'Menu du compte'
  },
  quiz: {
    defaultTitle: 'Nouveau Quiz',
    defaultDescription: '',
    defaultQuestionTitle: 'Nouvelle question'
  },
  registerPage: {
    title: 'Inscription',
    username: {
      placeholder: 'Nom d\'utilisateur',
      error : {
        required: 'Le nom d\'utilisateur est requis',
      }
    },
    email: {
      placeholder: 'Adresse email',
      error : {
        required: 'L\'adresse email est requise',
        email: 'L\'adresse email n\'est pas valide'
      }
    },
    password: {
      placeholder: 'Mot de passe',
      error: {
        required: 'Le mot de passe est requis',
        minlength: 'Le mot de passe doit contenir au moins 8 caractères'
      }
    },
    confirmPassword: {
      placeholder: 'Confirmez le mot de passe',
      error: {
        required: 'La confirmation du mot de passe est requise',
      }
    },
    error : {
      passwordsDoNotMatch: 'Les mots de passe ne correspondent pas'
    },
    button: {
      label: 'S\'inscrire',
    },
    login : {
      label: 'Déjà inscrit ?',
      link: 'Connectez-vous !'
    }
  },
  loginPage: {
    title: 'Connexion',
    email: {
      placeholder: 'E-mail*',
      error: {
        required: "L'e-mail est obligatoire",
        email: "L'e-mail n'est pas valide",
      },
    },
    password: {
      placeholder: 'Mot de passe*',
      error: {
        required: 'Le mot de passe est obligatoire',
      },
    },
    button: {
      label: 'Connexion',
    },
    register: {
      label: 'Créer un compte',
    },
    error: {
      loginFailed: 'Email / mot de passe invalide',
    },
    help: {
      text: "Besoin d'aide ?",
      link: 'Contactez-nous',
    },
  },
  welcomePage: {
    pretitle: 'Bienvenue sur le',
    title: 'Quiz du jour !',
    description: 'Affrontez vos amis dans des quiz de culture générale !',
    join : {
      title : 'Rejoignez un questionnaire !',
      label: 'Entrez le code du questionnaire',
      placeholder: 'Code du questionnaire',
      button: 'Rejoindre',
    },
    notLogged: {
      button: 'Connectez-vous pour accéder à vos questionnaires !'
    },
    dashboard: {
      title: 'Vos Quiz',
      errorLoadingQuizzes: 'Erreur lors du chargement des questionnaires. Veuillez vous reconnecter.',
      createQuiz: 'Nouveau Quiz',
      loading: 'Chargement des quizz en cours...',
      empty: 'Vous n\'avez pas encore de quiz. Créez-en un !',
      hateoas: {
        createMissing: 'Aucun lien dans la réponse de la liste des quiz ne permet la creation de quiz',
      },
      list : {
        title: '{{nb}} quizzes',
      }
    }
  },
  myQuizzes: {
    title: 'Mes questionnaires',
  },
  quizQuestions: {
    number: 'Question',
    total: 'sur',
    title: 'Questionnaire',
    completedTitle: 'Quiz termine.',
    youScored: 'Votre score...',
    submit: 'Valider la reponse',
    nextQuestion: 'Question suivante',
    getScore: 'Voir le score',
    scoreTitle: 'Votre score',
    playAgain: 'Rejouer',
    noAnswers: 'Aucune reponse disponible',
    notReadyYet:
      'Le quiz n’est pas pret : il doit contenir au moins 2 questions et chaque question doit avoir au moins 2 reponses.',
  },
  quizEditPage: {
    notFound: 'Quiz non trouvé',
    error: 'Erreur lors du chargement du quiz',
    title: {
      updated: 'Titre mis à jour',
      updateError: 'Erreur lors de la mise à jour du titre'
    },
    questions: {
      title: 'Questions',
      add: "Ajouter une question",
      empty: "Pas encore de questions",
      noQuestionReturned: 'Aucune question renvoyée par le backend',
    },
    question: {
      title: 'Question',
      newAnswer: {
        placeholder: 'Nouvelle réponse',
      }
    }
  },
  hostQuizPage: {
    hostingTitle: 'Animation du quiz : {{title}}',
    noQuizHosted: 'Aucun quiz n’est animé avec ce code.',
    shareCode: 'Partagez le code :',
    codeMissingHint:
      'Aucun quiz ne correspond au code {{code}} parmi les quiz démarrables. Avez-vous lancé le quiz depuis le tableau de bord ?',
    statusLabel: 'Statut :',
    participantsLabel: 'Participants :',
    statusUnknown: 'Statut : inconnu',
    button: {
      startQuiz: 'Démarrer le quiz',
      nextQuestion: 'Question suivante',
      endQuiz: 'Terminer le quiz',
    },
    completed: 'Le quiz est terminé. Merci aux participant·es !',
    backHome: 'Retour à l’accueil',
  },
  joinQuizPage: {
    joined: 'Vous avez rejoint le quiz : {{quizTitle}}',
    participants: 'Nombre de participants : {{count}}',
    waitFirstQuestion:
      'Patientez : l’enseignant·e enverra la première question sous peu.',
    quizStarted: 'Le quiz a commencé !',
    /** Shown when the host has sent the closing message (payload sans réponses). */
    quizCompleted: 'Le quiz est terminé.',
    loadingQuestion: 'Chargement de la question…',
    /** Avant la première réponse socket `joinDetails` (code en cours de vérification). */
    verifyingCode: 'Vérification du code…',
    /**
     * Après `joinDetails`, en attente du premier événement `status` (bref délai possible).
     */
    connecting: 'Connexion à la session…',
    /**
     * Aucun `joinDetails` reçu à temps : code fictif, session inexistante en base,
     * ou animateur n’a pas ouvert la page hôte (pas de salle WebSocket).
     */
    sessionUnavailable:
      'Impossible de rejoindre cette session : le code est incorrect ou le quiz n’a pas été démarré par l’animateur (page hôte non ouverte).',
    waitForHost: 'Attendez l’animateur pour la question suivante.',
    questionProgress: 'Question {{current}} / {{total}}',
    sessionScore: 'Ton score sur cette session : {{correct}} / {{total}}',
  },
}
