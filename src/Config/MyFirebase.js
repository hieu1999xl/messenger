import firebase from "firebase";

const config = {
  apiKey: "AIzaSyA3dBbBhwu3Tg-lbbqaFv76PqDyq5h-Q-0",
  authDomain: "messenger-8fbf5.firebaseapp.com",
  projectId: "messenger-8fbf5",
  storageBucket: "messenger-8fbf5.appspot.com",
  messagingSenderId: "495266811408",
  appId: "1:495266811408:web:71ba7b2f53f18ddd468495",
  measurementId: "G-7HT26VMEQW",
};
firebase.initializeApp(config);
firebase.firestore().settings({
  timestampsInSnapshots: true,
});

export const myFirebase = firebase;
export const myFirestore = firebase.firestore();
export const myStorage = firebase.storage();
