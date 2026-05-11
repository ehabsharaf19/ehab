// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCp-m2DkIIwIoKUeuntHLvDbEclB041pz4",
  authDomain: "shrouk-ehab.firebaseapp.com",
  databaseURL: "https://shrouk-ehab-default-rtdb.firebaseio.com",
  projectId: "shrouk-ehab",
  storageBucket: "shrouk-ehab.firebasestorage.app",
  messagingSenderId: "1015714183835",
  appId: "1:1015714183835:web:3d5e2b0f60e781e3f7643e",
  measurementId: "G-5NVYG4VND5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
