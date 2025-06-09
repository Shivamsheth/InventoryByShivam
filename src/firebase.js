// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
//import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDGEkYjszpVuXjaGOOPHWeTbMHRKQZ_jz8",
  authDomain: "inventor-pro.firebaseapp.com",
  projectId: "inventor-pro",
  storageBucket: "inventor-pro.appspot.com",
  messagingSenderId: "1040495249262",
  appId: "1:1040495249262:web:1cd605f2e83250d6f5637f",
  measurementId: "G-N9KM3D8GGR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
//const analytics = getAnalytics(app);

export { auth, db, storage };
