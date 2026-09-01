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

// عرض أحدث 6 في الرئيسية، وعرض الكل داخل الحرفة أو عند البحث
async function loadApprovedServices(categoryFilter = null, regionFilter = null, keywordFilter = "") {
    if (!servicesContainer) return;
    
    servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">جاري تحميل البيانات...</p>';

    try {
        const q = query(collection(db, "services"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        
        let allApprovedList = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const keyword = keywordFilter.toLowerCase();
            
            const matchCategory = !categoryFilter || (data.category && data.category.trim() === categoryFilter.trim());
            const matchRegion = !regionFilter || (data.region && data.region.trim() === regionFilter.trim());
            const matchKeyword = !keyword || (data.name && data.name.toLowerCase().includes(keyword)) || (data.description && data.description.toLowerCase().includes(keyword));

            if (matchCategory && matchRegion && matchKeyword) {
                allApprovedList.push(data);
            }
        });

        // ترتيب الأحدث أولاً
        allApprovedList.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.seconds : 0;
            const timeB = b.createdAt ? b.createdAt.seconds : 0;
            return timeB - timeA;
        });

        // إذا كنا في الصفحة الرئيسية (بدون اختيار حرفة أو بحث)، نأخذ أحدث 6 خدمات فقط
        let displayList = allApprovedList;
        if (!categoryFilter && !regionFilter && !keywordFilter) {
            displayList = allApprovedList.slice(0, 6);
        }

        servicesContainer.innerHTML = '';

        if (displayList.length === 0) {
            servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:#64748b; font-size: 16px; padding: 30px 0;">لا توجد خدمات مضافة حالياً في هذا التصنيف.</p>';
            return;
        }

        displayList.forEach((data) => {
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
        });

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:red;">حدث خطأ أثناء تحميل البيانات.</p>';
    }
}

// إرسال الخدمة
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
                status: "pending",
                createdAt: serverTimestamp()
            });

            alert('تم إرسال بياناتك بنجاح! ستظهر الخدمة فور اعتمادها من لوحة الإدارة.');
            serviceForm.reset();

        } catch (error) {
            console.error("خطأ في الإرسال: ", error);
            alert('حدث خطأ، يرجى المحاولة لاحقاً.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'إرسال الخدمة للنشر';
        }
    });
}

// البحث
if (btnSearch) {
    btnSearch.addEventListener('click', () => {
        const selectedRegion = regionSelect ? regionSelect.value : null;
        const keyword = keywordInput ? keywordInput.value.trim() : "";
        if (resultsTitle) resultsTitle.innerText = "نتائج البحث";
        loadApprovedServices(null, selectedRegion, keyword);
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    });
}

// التفاعل مع الحرف
document.addEventListener('DOMContentLoaded', () => {
    loadApprovedServices();

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const catName = card.getAttribute('data-category');
            if (catName) {
                if (resultsTitle) resultsTitle.innerText = `خدمات قسم: ${catName}`;
                loadApprovedServices(catName);
                document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
