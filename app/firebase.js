import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqe4Nd2NM0dqruq59vda6e915OwtLd7RE",
  authDomain: "inventory-management-app-eea6e.firebaseapp.com",
  projectId: "inventory-management-app-eea6e",
  storageBucket: "inventory-management-app-eea6e.appspot.com",
  messagingSenderId: "156805995942",
  appId: "1:156805995942:web:e28d58ccf13a929b024367",
  measurementId: "G-MTTMRMD1ED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export {app, firestore};