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

// عناصر الشاشة
const servicesContainer = document.getElementById('servicesContainer') || document.querySelector('.services-grid');
const serviceForm = document.getElementById('serviceForm');
const btnSearch = document.querySelector('.btn-search');
const regionSelect = document.getElementById('search-region');
const keywordInput = document.getElementById('search-keyword');

// 1. جلب وعرض الخدمات المقبولة فقط (Approved)
async function loadApprovedServices(categoryFilter = null, regionFilter = null, keywordFilter = "") {
    if (!servicesContainer) return;
    
    servicesContainer.innerHTML = '<p style="text-align:center; width:100%;">جاري تحميل الخدمات...</p>';

    try {
        let q = query(collection(db, "services"), where("status", "==", "approved"));

        if (regionFilter) {
            q = query(q, where("region", "==", regionFilter));
        }
        if (categoryFilter) {
            q = query(q, where("category", "==", categoryFilter));
        }

        const querySnapshot = await getDocs(q);
        servicesContainer.innerHTML = '';

        if (querySnapshot.empty) {
            servicesContainer.innerHTML = '<p style="text-align:center; width:100%;">لا توجد خدمات معتمدة حالياً في هذا التصنيف.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const keyword = keywordFilter.toLowerCase();
            
            if (!keyword || data.name.toLowerCase().includes(keyword) || (data.description && data.description.toLowerCase().includes(keyword))) {
                const card = document.createElement('div');
                card.className = 'service-card';
                card.innerHTML = `
                    <h3>${data.name}</h3>
                    <p class="category-badge"><strong>التصنيف:</strong> ${data.category}</p>
                    <p><strong>المنطقة:</strong> ${data.region}</p>
                    <p>${data.description || 'لا يوجد وصف متاح.'}</p>
                    <div class="contact-buttons" style="margin-top:10px;">
                        <a href="tel:${data.phone}" class="btn" style="background:#28a745; color:#fff; padding:5px 10px; border-radius:4px; text-decoration:none;">اتصال: ${data.phone}</a>
                        ${data.whatsapp ? `<a href="https://wa.me/${data.whatsapp}" target="_blank" class="btn" style="background:#25D366; color:#fff; padding:5px 10px; border-radius:4px; text-decoration:none; margin-right:5px;">واتساب</a>` : ''}
                    </div>
                `;
                servicesContainer.appendChild(card);
            }
        });

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        servicesContainer.innerHTML = '<p style="text-align:center; width:100%;">حدث خطأ أثناء تحميل الخدمات.</p>';
    }
}

// 2. إرسال الخدمة الجديدة بحالة "pending" (تحت المراجعة)
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
                status: "pending", // تحفظ كمعلقة لحين موافقتك عليها من الفايربيس
                createdAt: serverTimestamp()
            });

            alert('تم إرسال خدمتك بنجاح! ستظهر على المنصة فور مراجعتها وإقرارها من الإدارة.');
            serviceForm.reset();

        } catch (error) {
            console.error("خطأ أثناء إرسال البيانات: ", error);
            alert('حدث خطأ، يرجى المحاولة لاحقاً.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'إرسال الخدمة للمراجعة والنشر';
        }
    });
}

// 3. تفعيل البحث
if (btnSearch) {
    btnSearch.addEventListener('click', () => {
        const selectedRegion = regionSelect ? regionSelect.value : null;
        const keyword = keywordInput ? keywordInput.value.trim() : "";
        loadApprovedServices(null, selectedRegion, keyword);
    });
}

// 4. تفعيل الضغط على كروت المهن/التصنيفات
document.querySelectorAll('.category-card, .category-item').forEach(card => {
    card.addEventListener('click', () => {
        const categoryName = card.querySelector('h3, span, p')?.innerText.trim();
        if (categoryName) {
            loadApprovedServices(categoryName);
            window.scrollTo({ top: servicesContainer?.offsetTop - 100 || 0, behavior: 'smooth' });
        }
    });
});

// تحميل الخدمات المقبولة تلقائياً عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadApprovedServices();
});
