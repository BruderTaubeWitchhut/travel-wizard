// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCVQH5WyyPU_yHeQB72k31dUqppiiuQjQI",
  authDomain: "travel-wizard-ttt.firebaseapp.com",
  projectId: "travel-wizard-ttt",
  storageBucket: "travel-wizard-ttt.firebasestorage.app",
  messagingSenderId: "792327035069",
  appId: "1:792327035069:web:61f84dec1a46d5e5ba3fd4",
  measurementId: "G-HDLDF9M6BZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export default app;