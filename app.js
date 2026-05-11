import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

// 🔥 إعداد Firebase بتاعك (حطيته من كلامك)
const firebaseConfig = {
  apiKey: "AIzaSyCp-m2DkIIwIoKUeuntHLvDbEclB041pz4",
  authDomain: "shrouk-ehab.firebaseapp.com",
  databaseURL: "https://shrouk-ehab-default-rtdb.firebaseio.com",
  projectId: "shrouk-ehab",
  storageBucket: "shrouk-ehab.firebasestorage.app",
  messagingSenderId: "1015714183835",
  appId: "1:1015714183835:web:ca1a44d98bb9224ff7643e"
};

// 🔌 تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 📡 جلب بيانات الذهب من Realtime Database
const goldRef = ref(db, "gold");

onValue(goldRef, (snapshot) => {
  const data = snapshot.val();

  if (!data) return;

  document.getElementById("g24").innerText = data[24] + " جنيه";
  document.getElementById("g21").innerText = data[21] + " جنيه";
  document.getElementById("g18").innerText = data[18] + " جنيه";
});
