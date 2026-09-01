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

// جلب وعرض الخدمات المقبولة
async function loadApprovedServices(categoryFilter = null, regionFilter = null, keywordFilter = "") {
    if (!servicesContainer) return;
    
    servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">جاري تحميل الخدمات...</p>';

    try {
        let q = query(collection(db, "services"), where("status", "==", "approved"));

        if (regionFilter) {
            q = query(q, where("region", "==", regionFilter));
        }

        const querySnapshot = await getDocs(q);
        servicesContainer.innerHTML = '';

        let hasData = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const keyword = keywordFilter.toLowerCase();
            
            // الفلترة بالتصنيف والكلمة المفتاحية
            const matchCategory = !categoryFilter || data.category.trim() === categoryFilter.trim();
            const matchKeyword = !keyword || data.name.toLowerCase().includes(keyword) || (data.description && data.description.toLowerCase().includes(keyword));

            if (matchCategory && matchKeyword) {
                hasData = true;
                const card = document.createElement('div');
                card.style.cssText = "background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #eee;";
                card.innerHTML = `
                    <h3 style="margin-top:0; color:#0056b3;">${data.name}</h3>
                    <p style="margin:5px 0; background:#e9ecef; display:inline-block; padding:3px 8px; border-radius:4px; font-size:14px;"><strong>التصنيف:</strong> ${data.category}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>المنطقة:</strong> ${data.region}</p>
                    <p style="margin:10px 0; color:#555;">${data.description || 'لا يوجد وصف متاح.'}</p>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <a href="tel:${data.phone}" style="background:#28a745; color:#fff; padding:8px 12px; border-radius:5px; text-decoration:none; font-size:14px;">اتصال: ${data.phone}</a>
                        ${data.whatsapp ? `<a href="https://wa.me/${data.whatsapp}" target="_blank" style="background:#25D366; color:#fff; padding:8px 12px; border-radius:5px; text-decoration:none; font-size:14px;">واتساب</a>` : ''}
                    </div>
                `;
                servicesContainer.appendChild(card);
            }
        });

        if (!hasData) {
            servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:#777;">لا توجد خدمات معتمدة حالياً في هذا التصنيف.</p>';
        }

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        servicesContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1; color:red;">حدث خطأ أثناء تحميل الخدمات.</p>';
    }
}

// حفظ الخدمة بحالة pending
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

            alert('تم إرسال خدمتك بنجاح! ستظهر على المنصة فور مراجعتها وإقرارها من الإدارة.');
            serviceForm.reset();

        } catch (error) {
            console.error("خطأ في الإرسال: ", error);
            alert('حدث خطأ، يرجى المحاولة لاحقاً.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'إرسال الخدمة للمراجعة والنشر';
        }
    });
}

// البحث
if (btnSearch) {
    btnSearch.addEventListener('click', () => {
        const selectedRegion = regionSelect ? regionSelect.value : null;
        const keyword = keywordInput ? keywordInput.value.trim() : "";
        loadApprovedServices(null, selectedRegion, keyword);
    });
}

// ربط الضغط على كروت المهن
document.addEventListener('DOMContentLoaded', () => {
    loadApprovedServices();

    const categoryCards = document.querySelectorAll('.category-card, [class*="category"]');
    categoryCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const h3 = card.querySelector('h3, span, div');
            if (h3) {
                const categoryText = h3.innerText.trim();
                loadApprovedServices(categoryText);
                if (servicesContainer) {
                    servicesContainer.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
