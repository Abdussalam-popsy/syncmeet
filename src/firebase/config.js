import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9SlbHJaeQIAByaL3Kjy895IoIQkFinUM",
  authDomain: "syncmeet-a04c6.firebaseapp.com",
  projectId: "syncmeet-a04c6",
  storageBucket: "syncmeet-a04c6.firebasestorage.app",
  messagingSenderId: "227560519674",
  appId: "1:227560519674:web:8b1e52576c3fd5fbac9643",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
