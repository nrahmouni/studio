
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration (Hardcoded as per user request)
// IMPORTANT: Make sure these values exactly match the Firebase project configuration
// in your Firebase console. Any mismatch will cause connection errors.
const firebaseConfig = {
  apiKey: "AIzaSyBuf2wYHrRR5_ZQXFFVZ8c53fJmao7P7UE",
  authDomain: "obralink-keqrc.firebaseapp.com",
  projectId: "obralink-keqrc",
  storageBucket: "obralink-keqrc.appspot.com", // Corrected storage bucket
  messagingSenderId: "412359783854",
  appId: "1:412359783854:web:f60777fc833ebf6503c43f"
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);
storage = getStorage(app);
auth = getAuth(app);

export { app, db, storage, auth };
