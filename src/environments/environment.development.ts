export const environment = {
  baseUrl: 'http://localhost:3002',
  apiUrl: 'http://localhost:3002/api',
  fakeApiUrl: 'assets/data/data.json',
  useFakeApi: true,
  useFakeAuth: true,
  authType: 'JWT', // 'JWT' or 'FIREBASE' - default to JWT
  // You will need to create a Firebase project and replace the configuration here with yours
  firebase: {
    apiKey: "AIzaSyDwtB8c1BsnVI6R8dwHc9S5yl6DY6IEFWA",
    authDomain: "quizzam.firebaseapp.com",
    projectId: "quizzam",
    storageBucket: "quizzam.firebasestorage.app",
    messagingSenderId: "316827895691",
    appId: "1:316827895691:web:9972a41a493d1222b1d18e"
  },
  useSocketIo: true
};
