
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const initFirebase = (config: any) => {
    try {
        // Check if apps are already initialized to prevent errors during hot reloads
        if (getApps().length === 0) {
            app = initializeApp(config);
        } else {
            app = getApp();
        }
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("Firebase init error:", error);
        return false;
    }
};

export const getDb = () => db;

export const saveToCloud = async (data: any) => {
    if (!db) return;
    try {
        // Reference: collection 'ecorecycle', document 'db'
        const docRef = doc(db, 'ecorecycle', 'db');
        await setDoc(docRef, data);
        console.log("Data saved to Google Cloud Firestore");
    } catch (e) {
        console.error("Error saving to cloud:", e);
    }
};

export const loadFromCloud = async () => {
    if (!db) throw new Error("Database not initialized");
    try {
        const docRef = doc(db, 'ecorecycle', 'db');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log("Data loaded from Google Cloud Firestore");
            return docSnap.data();
        }
        return null;
    } catch (e) {
        console.error("Error loading from cloud:", e);
        return null;
    }
};
