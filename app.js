import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlWM7-RXhnz1Wjs5riDkwNesut_dPfBTc",
  authDomain: "emosha-kings.firebaseapp.com",
  projectId: "emosha-kings",
  storageBucket: "emosha-kings.firebasestorage.app",
  messagingSenderId: "895634926894",
  appId: "1:895634926894:web:f62217521ff33a876fdebf",
  measurementId: "G-GLK6MM45NX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const servicesContainer = document.getElementById('servicesContainer');
const serviceForm = document.getElementById('serviceForm');
const btnSearch = document.querySelector('.btn-search');
const regionSelect = document.getElementById('search-region');
const keywordInput = document.getElementById('search-keyword');
const resultsTitle = document.getElementById('results-title');

// جلب وعرض الخدمات المتاحة
async function loadServices(categoryFilter = null, regionFilter = null, keywordFilter = "") {
    if (!servicesContainer) return;
    
    servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">جاري تحميل الخدمات...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "services"));
        servicesContainer.innerHTML = '';

        let hasData = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const keyword = keywordFilter.toLowerCase();
            
            // فلترة دقيقة للمهن والجهات
            const matchCategory = !categoryFilter || (data.category && data.category.trim() === categoryFilter.trim());
            const matchRegion = !regionFilter || (data.region && data.region.trim() === regionFilter.trim());
            const matchKeyword = !keyword || (data.name && data.name.toLowerCase().includes(keyword)) || (data.description && data.description.toLowerCase().includes(keyword));

            if (matchCategory && matchRegion && matchKeyword) {
                hasData = true;
                const card = document.createElement('div');
                card.style.cssText = "background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;";
                card.innerHTML = `
                    <h3 style="margin-top:0; color:#0056b3; font-size: 20px;">${data.name}</h3>
                    <p style="margin:6px 0; background:#e0f2fe; color:#0369a1; display:inline-block; padding:4px 10px; border-radius:20px; font-size:13px; font-weight:bold;">${data.category}</p>
                    <p style="margin:8px 0; font-size:14px; color:#475569;"><i class="fa-solid fa-location-dot"></i> <strong>المنطقة:</strong> ${data.region}</p>
                    <p style="margin:10px 0; color:#334155; line-height: 1.5;">${data.description || 'لا يوجد وصف متاح.'}</p>
                    <div style="margin-top:15px; display:flex; gap:10px; flex-wrap: wrap;">
                        <a href="tel:${data.phone}" style="background:#16a34a; color:#fff; padding:8px 14px; border-radius:6px; text-decoration:none; font-size:14px; font-weight:bold;"><i class="fa-solid fa-phone"></i> اتصال</a>
                        ${data.whatsapp ? `<a href="https://wa.me/${data.whatsapp}" target="_blank" style="background:#25D366; color:#fff; padding:8px 14px; border-radius:6px; text-decoration:none; font-size:14px; font-weight:bold;"><i class="fa-brands fa-whatsapp"></i> واتساب</a>` : ''}
                    </div>
                `;
                servicesContainer.appendChild(card);
            }
        });

        if (!hasData) {
            servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:#64748b; font-size: 16px;">لا توجد خدمات مضافة حالياً في هذا التصنيف.</p>';
        }

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:red;">حدث خطأ أثناء تحميل الخدمات.</p>';
    }
}

// إرسال الخدمة وحفظها مباشرة
if (serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const category = document.getElementById('form-category').value;
        const region = document.getElementById('form-region').value;
        const phone = document.getElementById('form-phone').value.trim();
        const whatsapp = document.getElementById('form-whatsapp').value.trim();
        const description = document.getElementById('form-description').value.trim();

        const submitBtn = serviceForm.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري الإرسال...';

        try {
            await addDoc(collection(db, "services"), {
                name: name,
                category: category,
                region: region,
                phone: phone,
                whatsapp: whatsapp || phone,
                description: description,
                status: "approved",
                createdAt: serverTimestamp()
            });

            alert('تم نشر خدمتك بنجاح ومتاحة للجميع الآن!');
            serviceForm.reset();
            loadServices(); // تحديث العرض فوراً

        } catch (error) {
            console.error("خطأ في الإرسال: ", error);
            alert('حدث خطأ، يرجى المحاولة لاحقاً.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'إرسال الخدمة للنشر';
        }
    });
}

// البحث عند إدخال النص والمنطقة
if (btnSearch) {
    btnSearch.addEventListener('click', () => {
        const selectedRegion = regionSelect ? regionSelect.value : null;
        const keyword = keywordInput ? keywordInput.value.trim() : "";
        if (resultsTitle) resultsTitle.innerText = "نتائج البحث";
        loadServices(null, selectedRegion, keyword);
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    });
}

// التفاعل عند الضغط على الكروت (النقاشة، النجارة، السباكة...)
document.addEventListener('DOMContentLoaded', () => {
    loadServices();

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const catName = card.getAttribute('data-category');
            if (catName) {
                if (resultsTitle) resultsTitle.innerText = `خدمات قسم: ${catName}`;
                loadServices(catName);
                document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
