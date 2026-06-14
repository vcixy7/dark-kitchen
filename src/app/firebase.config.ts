import { initializeApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: "AIzaSyAKUqiI1mnle8Y5zX5JUqD3tNrCO-MGkdg",
  authDomain: "flashfood-5956a-4f1e8.firebaseapp.com",
  projectId: "flashfood-5956a-4f1e8",
  storageBucket: "flashfood-5956a-4f1e8.firebasestorage.app",
  messagingSenderId: "806524530087",
  appId: "1:806524530087:web:e5e686b4e9ab4a8dda9a82"
};

export const app = initializeApp(firebaseConfig);