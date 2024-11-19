// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA7pKAvCYPG4JnTG5RNk0T2FTSZHyAEpS4",
    authDomain: "keep-42e22.firebaseapp.com",
    projectId: "keep-42e22",
    storageBucket: "keep-42e22.firebasestorage.app",
    messagingSenderId: "699578720864",
    appId: "1:699578720864:android:46dda5b884b12d545f9905",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
