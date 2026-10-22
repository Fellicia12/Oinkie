/**
 * OINKIE - Front-end JavaScript Integration Engine
 */

let currentUser = null;
let itemsData = [];
let currentReportType = 'hilang';
let activeCategory = 'semua';

// URL dasar API PHP (menyesuaikan dengan alamat server lokal)
const API_BASE_URL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');

document.addEventListener('DOMContentLoaded', () => {
    fetchBarangList();
});

/* ===================================================
   1. NAVIGASI SPA & MODAL CONTROLLER
   =================================================== */
function navigateTo(pageId) {
    const pageMain = document.getElementById('mainPageSection');
    const pageLogin = document.getElementById('loginPageSection');

    if (!pageMain || !pageLogin) return;

    if (pageId === 'main') {
        pageLogin.classList.add('hidden');
        pageMain.classList.remove('hidden');
    } else if (pageId === 'login') {
        pageMain.classList.add('hidden');
        pageLogin.classList.remove('hidden');
    }
}

function openLaporModal() {
    document.getElementById('laporModal')?.classList.remove('hidden');
}

function closeLaporModal() {
    const modal = document.getElementById('laporModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('laporForm')?.reset();
    }
}

function openHelpModal() {
    document.getElementById('helpModal')?.classList.remove('hidden');
}

function closeHelpModal() {
    document.getElementById('helpModal')?.classList.add('hidden');
}

function triggerItemAction(nama, btnText) {
    document.getElementById('actionModalTitle').innerText = `${btnText} - ${nama}`;
    document.getElementById('actionModalDesc').innerText = `Laporan Anda untuk "${nama}" akan diteruskan ke guru piket/pelapor untuk pencocokan bukti.`;
    document.getElementById('actionModal')?.classList.remove('hidden');
}

function closeActionModal() {
    document.getElementById('actionModal')?.classList.add('hidden');
}

function confirmAction() {
    closeActionModal();
    alert('✅ Klaim terkirim! Silakan datangi Ruang Piket dengan membawa kartu pelajar untuk verifikasi.');
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
    } else {
        input.type = 'password';
        if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
    }
}

function setReportType(type) {
    currentReportType = type;
    const btnH = document.getElementById('btnTypeHilang');
    const btnD = document.getElementById('btnTypeDitemukan');

    if (type === 'hilang') {
        btnH.className = "py-2.5 rounded-xl font-bold transition-all bg-rose-500 text-white shadow-sm flex items-center justify-center gap-1.5";
        btnD.className = "py-2.5 rounded-xl font-bold transition-all text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5";
    } else {
        btnD.className = "py-2.5 rounded-xl font-bold transition-all bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5";
        btnH.className = "py-2.5 rounded-xl font-bold transition-all text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5";
    }
}

/* ===================================================
   2. FILTER & RENDER GRID BARANG
   =================================================== */
function applyFilters() {
    const searchVal = (document.getElementById('heroSearchInput')?.value || '').toLowerCase();
    const katVal = document.getElementById('filterKategori')?.value || 'semua';
    const statVal = document.getElementById('filterStatus')?.value || 'semua';
    const lokVal = document.getElementById('filterLokasi')?.value || 'semua';

    const filtered = itemsData.filter(item => {
        const matchesSearch = (item.nama_barang || '').toLowerCase().includes(searchVal) || 
                              (item.deskripsi || '').toLowerCase().includes(searchVal);
        const matchesKategori = (katVal === 'semua' || item.kategori === katVal);
        const matchesStatus = (statVal === 'semua' || item.status === statVal);
        const matchesLokasi = (lokVal === 'semua' || (item.lokasi || '').toLowerCase().includes(lokVal.replace('-', ' ')));

        return matchesSearch && matchesKategori && matchesStatus && matchesLokasi;
    });

    renderGrid(filtered);
}

function filterByCategory(categoryKey, btnElement) {
    activeCategory = categoryKey;
    document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.className = "cat-pill bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 px-5 py-2.5 rounded-full text-xs flex items-center gap-2 transition-all shadow-sm";
    });
    if (btnElement) {
        btnElement.className = "cat-pill bg-blue-800 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-md flex items-center gap-2 transition-all";
    }

    const selectKat = document.getElementById('filterKategori');
    if (selectKat) selectKat.value = categoryKey;
    
    applyFilters();
}

function renderGrid(data) {
    const grid = document.getElementById('itemsGrid');
    const countDisplay = document.getElementById('itemCountDisplay');
    if (!grid) return;

    grid.innerHTML = '';
    if (countDisplay) countDisplay.innerText = `${data.length} barang ditemukan`;

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400">
                <span class="text-4xl block mb-2">🔍</span>
                <p class="font-bold text-slate-600">Barang tidak ditemukan.</p>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        const isHilang = item.status === 'hilang';
        const badgeBg = isHilang ? 'bg-rose-500' : 'bg-blue-600';
        const badgeText = isHilang ? 'HILANG' : 'DITEMUKAN';
        const btnText = isHilang ? '🙋 Ini Punyaku!' : '🖐️ Klaim Barang Ini';
        const btnStyle = isHilang ? 'bg-blue-800 hover:bg-blue-900 text-white' : 'bg-amber-400 hover:bg-amber-500 text-slate-900';
        
        const imageUrl = item.foto 
            ? `${API_BASE_URL}/uploads/${item.foto}` 
            : (item.image || 'https://placehold.co/600x400/1e3a8a/ffffff?text=Oinkie+Lost+and+Found');

        const cardHTML = `
            <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                    <div class="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img src="${imageUrl}" alt="${item.nama_barang}" class="w-full h-full object-cover">
                        <div class="absolute top-3 left-3 ${badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                            <span>${badgeText}</span>
                        </div>
                    </div>
                    <div class="p-5 space-y-2">
                        <h3 class="font-extrabold text-slate-900 text-base">${item.nama_barang}</h3>
                        <p class="text-xs text-slate-500 line-clamp-2">${item.deskripsi}</p>
                        <div class="flex flex-wrap gap-2 pt-2 text-[11px] font-semibold text-slate-600">
                            <span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">📍 ${item.lokasi}</span>
                            <span class="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">📅 ${item.tanggal}</span>
                        </div>
                    </div>
                </div>
                <div class="p-5 pt-0">
                    <button onclick="triggerItemAction('${item.nama_barang}', '${btnText}')" class="w-full ${btnStyle} font-extrabold py-3 rounded-2xl text-xs transition-all shadow-md active:scale-95">
                        ${btnText}
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

function updateCounters() {
    const total = itemsData.length;
    const hilang = itemsData.filter(i => i.status === 'hilang').length;
    const ditemukan = itemsData.filter(i => i.status === 'ditemukan').length;

    if (document.getElementById('statTotal')) document.getElementById('statTotal').innerText = total;
    if (document.getElementById('statHilang')) document.getElementById('statHilang').innerText = hilang;
    if (document.getElementById('statDitemukan')) document.getElementById('statDitemukan').innerText = ditemukan;
}

/* ===================================================
   3. INTEGRASI BACKEND PHP (FETCH / POST)
   =================================================== */

// A. Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const result = await response.json();

        if (result.success) {
            currentUser = result.user;
            showToast(`Selamat datang kembali, ${currentUser.nama_lengkap}!`, 'success');
            document.getElementById('userNameText').innerText = currentUser.nama_lengkap;
            document.getElementById('userAvatar').innerText = currentUser.nama_lengkap.charAt(0).toUpperCase();
            
            // Pindah ke halaman utama tanpa reload
            setTimeout(() => navigateTo('main'), 1000);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        console.error("Error login:", err);
        showToast("Gagal terhubung ke server PHP backend!", 'error');
    }
}

// B. Handle Registrasi
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-fullname').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth.php?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama_lengkap: name, username: username, password: password })
        });

        const result = await response.json();

        if (result.success) {
            showToast(`Akun ${name} berhasil dibuat! Silakan masuk.`, 'success');
            switchTab('masuk');
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        console.error("Error register:", err);
        showToast("Terjadi kesalahan sistem registrasi!", 'error');
    }
}

// C. Handle Lapor Simpan Barang
async function handleLaporSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nama_barang', document.getElementById('inputNama').value);
    formData.append('kategori', document.getElementById('inputKategori').value);
    formData.append('lokasi', document.getElementById('inputLokasi').value);
    formData.append('tanggal', document.getElementById('inputTanggal').value);
    formData.append('deskripsi', document.getElementById('inputCiri').value);
    formData.append('status', currentReportType);
    
    const fileInput = document.getElementById('fileGambar');
    if (fileInput && fileInput.files[0]) {
        formData.append('foto', fileInput.files[0]);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/barang.php?action=create`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('🎉 Laporan berhasil disimpan ke database!');
            closeLaporModal();
            fetchBarangList(); // Refetch data terbaru
        } else {
            alert(`Gagal mengirim laporan: ${result.message}`);
        }
    } catch (err) {
        console.error("Error submit barang:", err);
        alert("Terjadi kesalahan pengiriman laporan!");
    }
}

// D. Fetch Daftar Barang dari Database MySQL
async function fetchBarangList() {
    try {
        const response = await fetch(`${API_BASE_URL}/barang.php?action=read`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            itemsData = result.data;
        } else {
            // Fallback data jika tabel database masih kosong
            itemsData = getFallbackData();
        }
    } catch (err) {
        console.warn("Koneksi backend gagal, menggunakan data dummy lokal.");
        itemsData = getFallbackData();
    }
    updateCounters();
    applyFilters();
}

function getFallbackData() {
    return [
        { id: 1, nama_barang: "Buku Matematika Kelas 9", kategori: "buku", status: "hilang", deskripsi: "Buku berwarna merah, ada nama Budi.", lokasi: "Perpustakaan", tanggal: "2026-08-10" },
        { id: 2, nama_barang: "Kotak Makan Hello Kitty", kategori: "tempat-makan", status: "ditemukan", deskripsi: "Kotak makan pink gambar Hello Kitty.", lokasi: "Kantin", tanggal: "2026-08-11" },
        { id: 3, nama_barang: "Earphone Putih Samsung", kategori: "elektronik", status: "hilang", deskripsi: "Earphone kabel putih dengan case hitam.", lokasi: "Lapangan", tanggal: "2026-08-09" }
    ];
}

/* ===================================================
   4. UI FEEDBACK (TOAST & TAB SWITCH)
   =================================================== */
function switchTab(tab) {
    const formMasuk = document.getElementById('form-masuk');
    const formDaftar = document.getElementById('form-daftar');
    const tabMasuk = document.getElementById('tab-masuk');
    const tabDaftar = document.getElementById('tab-daftar');

    if (!formMasuk || !formDaftar) return;

    if (tab === 'masuk') {
        formMasuk.classList.remove('hidden');
        formDaftar.classList.add('hidden');
        tabMasuk.className = "flex-1 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-blue-800 text-white shadow-md";
        tabDaftar.className = "flex-1 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800";
    } else {
        formMasuk.classList.add('hidden');
        formDaftar.classList.remove('hidden');
        tabDaftar.className = "flex-1 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-blue-800 text-white shadow-md";
        tabMasuk.className = "flex-1 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800";
    }
}

let toastTimeout;
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toast-content');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast) return;

    clearTimeout(toastTimeout);
    toastMessage.textContent = message;

    if (type === 'success') {
        toastIcon.className = "fa-solid fa-circle-check text-emerald-400 text-lg";
    } else if (type === 'info') {
        toastIcon.className = "fa-solid fa-circle-info text-sky-400 text-lg";
    } else {
        toastIcon.className = "fa-solid fa-circle-exclamation text-rose-400 text-lg";
    }

    toast.classList.remove('hidden');
    toastContent.classList.add('toast-animate');

    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function handleSocialLogin(provider) {
    showToast(`Menghubungkan dengan ${provider}...`, 'info');
}

function triggerImageSelect() {
    document.getElementById('fileGambar')?.click();
}

function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        document.getElementById('uploadLabel').innerText = `📷 ${input.files[0].name}`;
    }
}