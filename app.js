import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCp-m2DkIIwIoKUeuntHLvDbEclB041pz4",
  authDomain: "shrouk-ehab.firebaseapp.com",
  databaseURL: "https://shrouk-ehab-default-rtdb.firebaseio.com",
  projectId: "shrouk-ehab",
  storageBucket: "shrouk-ehab.firebasestorage.app",
  messagingSenderId: "1015714183835",
  appId: "1:1015714183835:web:ca1a44d98bb9224ff7643e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔥 جلب الأسعار
const goldRef = ref(db, "gold");

onValue(goldRef, (snapshot) => {
  const data = snapshot.val();

  if (!data) return;

  document.getElementById("g24").innerText = data[24];
  document.getElementById("g21").innerText = data[21];
  document.getElementById("g18").innerText = data[18];

  updateChart(data[21]);
});


// 📊 رسم بياني
let chart = new Chart(document.getElementById("chart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "عيار 21",
      data: [],
      borderColor: "gold"
    }]
  }
});

function updateChart(value) {
  let time = new Date().toLocaleTimeString();

  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);

  chart.update();
}
