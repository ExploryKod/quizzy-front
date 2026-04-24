export const environment = {
  baseUrl: 'http://194.164.76.63:3002',
  apiUrl: 'http://194.164.76.63:3002/api',
  fakeApiUrl: 'assets/data/quizzes.json',
  fakeUsersUrl: 'assets/data/user.json',
  useFakeApi: false,
  useFakeAuth: false,
  authType: 'JWT', // 'JWT' or 'FIREBASE' - default to JWT
  // You will need to create a Firebase project and replace the configuration here with yours
  firebase : {
    apiKey: '<TODO>',
    authDomain: '<TODO>',
    projectId: '<TODO>',
    storageBucket: '<TODO>',
    messagingSenderId: '<TODO>',
    appId: '<TODO>',
  }, 
  useSocketIo: true
};
