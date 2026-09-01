// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlWM7-RXhnz1Wjs5riDkwNesut_dPfBTc",
  authDomain: "emosha-kings.firebaseapp.com",
  projectId: "emosha-kings",
  storageBucket: "emosha-kings.firebasestorage.app",
  messagingSenderId: "895634926894",
  appId: "1:895634926894:web:f62217521ff33a876fdebf",
  measurementId: "G-GLK6MM45NX"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// معالجة نموذج إرسال الخدمة (إضافة بيانات الحرفيين/الخدمات)
// ==========================================
const serviceForm = document.getElementById('serviceForm');

if (serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = serviceForm.querySelector('input[placeholder*="أحمد"]').value.trim();
        const category = serviceForm.querySelectorAll('select')[0].value;
        const region = serviceForm.querySelectorAll('select')[1].value;
        const phone = serviceForm.querySelectorAll('input[type="tel"]')[0].value.trim();
        const whatsapp = serviceForm.querySelectorAll('input[type="tel"]')[1].value.trim();
        const description = serviceForm.querySelector('textarea').value.trim();

        const submitBtn = serviceForm.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري الإرسال...';

        try {
            // حفظ البيانات في مجموعة "services" داخل Firestore
            await addDoc(collection(db, "services"), {
                name: name,
                category: category,
                region: region,
                phone: phone,
                whatsapp: whatsapp || phone,
                description: description,
                status: "approved", // تم جعلها مقبولة مباشرة للتجربة لتظهر فوراً
                createdAt: serverTimestamp()
            });

            alert('تم تسجيل خدمتك بنجاح في دليل إيموشا خدمتي!');
            serviceForm.reset();

        } catch (error) {
            console.error("خطأ أثناء حفظ البيانات: ", error);
            alert('حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'إرسال الخدمة للمراجعة والنشر';
        }
    });
}

// ==========================================
// البحث السريع والتصفية
// ==========================================
const btnSearch = document.querySelector('.btn-search');
const regionSelect = document.getElementById('search-region');
const keywordInput = document.getElementById('search-keyword');

if (btnSearch) {
    btnSearch.addEventListener('click', async () => {
        const selectedRegion = regionSelect.value;
        const keyword = keywordInput.value.trim().toLowerCase();

        btnSearch.innerText = 'جاري البحث...';

        try {
            let q = query(collection(db, "services"), where("status", "==", "approved"));
            
            if (selectedRegion) {
                q = query(q, where("region", "==", selectedRegion));
            }

            const querySnapshot = await getDocs(q);
            const results = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!keyword || data.name.toLowerCase().includes(keyword) || data.description.toLowerCase().includes(keyword)) {
                    results.push({ id: doc.id, ...data });
                }
            });

            console.log("نتائج البحث:", results);

        } catch (error) {
            console.error("خطأ في عملية البحث:", error);
        } finally {
            btnSearch.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> بحث';
        }
    });
}
