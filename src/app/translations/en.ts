export const en = {
  appName: 'Quizzy',
  common: {
    ok: 'Ok',
  },
  header: {
    statusTooltip: {
      ko: 'Server Access KO: only demo quizzes',
      partial: 'Database Access KO: only demo quizzes',
      ok: 'Server access OK',
      pending: 'Server access checking...',
    },
    userMissing: 'Unknown user (issue #4)',
    userMenu: 'Account menu',
  },
  quiz: {
    defaultTitle: 'New Quiz',
    defaultDescription: '',
    defaultQuestionTitle: 'New Question',
  },
  registerPage: {
    title: 'Sign up',
    username: {
      placeholder: 'Username',
      error: {
        required: 'Username is required',
      },
    },
    email: {
      placeholder: 'Email address',
      error: {
        required: 'Email address is required',
        email: 'Email address is invalid',
      },
    },
    password: {
      placeholder: 'Password',
      error: {
        required: 'Password is required',
        minlength: 'Password must contain at least 8 characters',
      },
    },
    confirmPassword: {
      placeholder: 'Confirm password',
      error: {
        required: 'Password confirmation is required',
      },
    },
    error: {
      passwordsDoNotMatch: 'Passwords do not match',
    },
    button: {
      label: 'Sign up',
    },
    login: {
      label: 'Already registered?',
      link: 'Sign in!',
    },
  },
  loginPage: {
    title: 'Sign in',
    email: {
      placeholder: 'Email*',
      error: {
        required: 'Email is required',
        email: 'Email is invalid',
      },
    },
    password: {
      placeholder: 'Password*',
      error: {
        required: 'Password is required',
      },
    },
    button: {
      label: 'Sign in',
    },
    register: {
      label: 'Create an account',
    },
    error: {
      loginFailed: 'Invalid email / password',
    },
    help: {
      text: 'Need help?',
      link: 'Contact us',
    },
  },
  welcomePage: {
    pretitle: 'Welcome to',
    title: 'Quiz of the day!',
    description: 'Challenge your friends in general knowledge quizzes!',
    join: {
      title: 'Join a quiz!',
      label: 'Enter quiz code',
      placeholder: 'Quiz code',
      button: 'Join',
    },
    notLogged: {
      button: 'Sign in to access your quizzes!',
    },
    dashboard: {
      title: 'Your Quizzes',
      errorLoadingQuizzes: 'Error loading quizzes. Please sign in again.',
      createQuiz: 'New Quiz',
      loading: 'Loading quizzes...',
      empty: 'You do not have any quiz yet. Create one!',
      hateoas: {
        createMissing:
          'No link in quiz list response allows quiz creation',
      },
      list: {
        title: '{{nb}} quizzes',
      },
    },
  },
  myQuizzes: {
    title: 'My quizzes',
  },
  quizQuestions: {
    number: 'Question',
    total: 'of',
    title: 'Quiz',
    completedTitle: 'Quiz completed.',
    youScored: 'You scored...',
    submit: 'Submit answer',
    nextQuestion: 'Next question',
    getScore: 'Get score',
    scoreTitle: 'Your score',
    playAgain: 'Play again',
    noAnswers: 'No answers available',
  },
  quizEditPage: {
    notFound: 'Quiz not found',
    error: 'Error while loading quiz',
    title: {
      updated: 'Title updated',
      updateError: 'Error while updating title',
    },
    questions: {
      title: 'Questions',
      add: 'Add a question',
      empty: 'No questions yet',
      noQuestionReturned: 'No question returned by backend',
    },
    question: {
      title: 'Question',
      newAnswer: {
        placeholder: 'New answer',
      },
    },
  },
  hostQuizPage: {
    hostingTitle: 'Hosting quiz: {{title}}',
    noQuizHosted: 'No quiz is hosted with this code.',
    shareCode: 'Share code:',
    codeMissingHint:
      'No quiz matches code {{code}} among startable quizzes. Did you start the quiz from the dashboard?',
    statusLabel: 'Status:',
    participantsLabel: 'Participants:',
    statusUnknown: 'Status: unknown',
    button: {
      startQuiz: 'Start quiz',
      nextQuestion: 'Next question',
      endQuiz: 'End quiz',
    },
    completed: 'Quiz is over. Thanks to all participants!',
    backHome: 'Back to home',
  },
  joinQuizPage: {
    joined: 'You joined quiz: {{quizTitle}}',
    participants: 'Participants count: {{count}}',
    waitFirstQuestion:
      'Please wait: the host will send the first question soon.',
    quizStarted: 'Quiz started!',
    quizCompleted: 'Quiz is over.',
    loadingQuestion: 'Loading question...',
    verifyingCode: 'Checking code...',
    connecting: 'Connecting to session...',
    sessionUnavailable:
      'Unable to join this session: code is invalid or quiz was not started by host (host page not opened).',
  },
};