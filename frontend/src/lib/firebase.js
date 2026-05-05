import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-fHl6gpwBAsAnPKOe3qRL-tf7Wwiavqk",
  authDomain: "datacapture-80889.firebaseapp.com",
  databaseURL:
    "https://datacapture-80889-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "datacapture-80889",
  storageBucket: "datacapture-80889.firebasestorage.app",
  messagingSenderId: "384587628586",
  appId: "1:384587628586:web:059c1626ef2ddd46fb4353",
  measurementId: "G-WEZQGDXZNN",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
