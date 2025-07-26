// === KONFIGURACJA FIREBASE (Twoje klucze) ===
const firebaseConfig = {
    apiKey: "AIzaSyANxGt1rQtBamptyYVI5ZNMtyGbpOhWBqE",
    authDomain: "od-dna-do-swiatla.firebaseapp.com",
    projectId: "od-dna-do-swiatla",
    storageBucket: "od-dna-do-swiatla.firebasestorage.app",
    messagingSenderId: "96366183668",
    appId: "1:96366183668:web:37f36a4004dd6fd85acaa1"
};

// === INICJALIZACJA ===
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// === LOGIKA AUTORYZACJI (LOGOWANIA) ===
const loginContainer = document.getElementById('loginContainer');
const adminPanel = document.getElementById('adminPanel');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

loginBtn.addEventListener('click', () => {
    loginError.textContent = '';
    auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
        .catch(error => {
            loginError.textContent = "Błędny email lub hasło.";
        });
});

logoutBtn.addEventListener('click', () => auth.signOut());

auth.onAuthStateChanged(user => {
    if (user) {
        loginContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        initializeAppLogic();
    } else {
        loginContainer.style.display = 'block';
        adminPanel.style.display = 'none';
    }
});

// === GŁÓWNA LOGIKA APLIKACJI (uruchamiana po zalogowaniu) ===
function initializeAppLogic() {
    // Helper do tworzenia slugów
    const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    // === Funkcje Ładujące Dane z Bazy ===
    async function loadData(collectionName, targetElement, renderer) {
        targetElement.innerHTML = 'Ładowanie...';
        const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();
        targetElement.innerHTML = snapshot.empty ? `<p class="text-gray-500">Brak danych.</p>` : '';
        snapshot.forEach(doc => renderer(doc, targetElement));
    }
    
    // --- Sekcje i Wpisy ---
    const sectionSelects = [document.getElementById('sectionSelect'), document.getElementById('editSectionSelect')];
    const menuEditorDiv = document.getElementById('menuEditor');
    const entriesListDiv = document.getElementById('entriesList');
    
    async function loadSections() {
        const snapshot = await db.collection('_sections').orderBy('createdAt', 'desc').get();
        sectionSelects.forEach(sel => sel.innerHTML = '');
        menuEditorDiv.innerHTML = '';
        snapshot.forEach(doc => {
            const section = { id: doc.id, ...doc.data() };
            sectionSelects.forEach(sel => sel.add(new Option(section.name, section.id)));
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between border p-2 rounded';
            div.innerHTML = `<span>${section.name}</span><button onclick="window.deleteSection('${section.id}', '${section.name}')" class="bg-red-500 text-white px-2 py-1 rounded text-sm">Usuń</button>`;
            menuEditorDiv.appendChild(div);
        });
        loadEntries();
    }
    
    async function loadEntries() {
        const sectionId = document.getElementById('editSectionSelect').value;
        if (!sectionId) { entriesListDiv.innerHTML = ''; return; }
        entriesListDiv.innerHTML = 'Ładowanie...';
        const snapshot = await db.collection('entries').where('sectionId', '==', sectionId).orderBy('createdAt', 'desc').get();
        entriesListDiv.innerHTML = snapshot.empty ? '<p class="text-gray-500">Brak wpisów w tej sekcji.</p>' : '';
        snapshot.forEach(doc => {
            const entry = { id: doc.id, ...doc.data() };
            const div = document.createElement('div');
            div.className = 'border p-3 rounded bg-gray-50';
            div.innerHTML = `<div class="font-semibold">${entry.title || '(bez tytułu)'}</div><p class="text-gray-700">${entry.text}</p><button onclick="window.deleteEntry('${entry.id}')" class="text-red-600 hover:underline mt-2 text-sm">Usuń</button>`;
            entriesListDiv.appendChild(div);
        });
    }

    // --- Sekcja Pomoc ---
    const helpPlacesListDiv = document.getElementById('helpPlacesList');
    function loadHelpPlaces() {
        loadData('miejsca_pomocy', helpPlacesListDiv, (doc, element) => {
            const place = { id: doc.id, ...doc.data() };
            const div = document.createElement('div');
            div.className = 'border p-3 rounded bg-gray-50 flex justify-between items-center';
            div.innerHTML = `<div><div class="font-bold">${place.nazwa} <span class="text-sm font-normal text-gray-500">(${place.wojewodztwo})</span></div><p class="text-sm text-gray-600">${place.adres || ''} | Tel: ${place.telefon || ''}</p></div>
                             <button onclick="window.deleteHelpPlace('${place.id}')" class="bg-red-500 text-white px-2 py-1 rounded text-sm flex-shrink-0">Usuń</button>`;
            element.appendChild(div);
        });
    }

    // === Funkcje Zapisu i Usuwania (Globalne) ===
    window.addNewSection = async () => {
        const name = document.getElementById('newSectionName').value.trim();
        if (!name) return alert("Podaj nazwę sekcji!");
        await db.collection('_sections').add({ name, slug: slugify(name), createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('newSectionName').value = ''; loadSections();
    };
    window.deleteSection = async (id, name) => {
        if (!confirm(`Na pewno chcesz usunąć sekcję "${name}" i wszystkie jej wpisy?`)) return;
        const batch = db.batch();
        const entriesSnapshot = await db.collection('entries').where('sectionId', '==', id).get();
        entriesSnapshot.forEach(doc => batch.delete(doc.ref));
        batch.delete(db.collection('_sections').doc(id));
        await batch.commit(); loadSections();
    };
    window.addEntry = async () => {
        const text = document.getElementById('entryText').value.trim();
        if (!text) return alert("Wpisz treść!");
        const sectionId = document.getElementById('sectionSelect').value;
        const title = document.getElementById('entryTitle').value.trim();
        await db.collection('entries').add({ sectionId, title: title || null, text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('entryTitle').value = ''; document.getElementById('entryText').value = ''; alert('Wpis dodany!'); loadEntries();
    };
    window.deleteEntry = async (id) => {
        if (confirm('Na pewno usunąć ten wpis?')) { await db.collection('entries').doc(id).delete(); loadEntries(); }
    };
    window.addHelpPlace = async () => {
        const nazwa = document.getElementById('helpName').value.trim();
        if(!nazwa) return alert('Nazwa miejsca jest wymagana!');
        await db.collection('miejsca_pomocy').add({
            nazwa, wojewodztwo: document.getElementById('helpWojewodztwo').value, adres: document.getElementById('helpAddress').value.trim() || null,
            telefon: document.getElementById('helpPhone').value.trim() || null, strona_www: document.getElementById('helpWebsite').value.trim() || null,
            opis: document.getElementById('helpDescription').value.trim() || null, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        ['helpName', 'helpAddress', 'helpPhone', 'helpWebsite', 'helpDescription'].forEach(id => document.getElementById(id).value = '');
        alert('Miejsce pomocy dodane!'); loadHelpPlaces();
    };
    window.deleteHelpPlace = async (id) => {
        if (confirm('Na pewno usunąć to miejsce?')) { await db.collection('miejsca_pomocy').doc(id).delete(); loadHelpPlaces(); }
    };
    window.addGalleryImage = async () => {
        const url = document.getElementById('galleryImageUrl').value.trim();
        if (!url) return alert('Wklej link do zdjęcia!');
        await db.collection('gallery').add({ url, description: document.getElementById('galleryDesc').value.trim() || null, uploadedAt: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('galleryImageUrl').value = ''; document.getElementById('galleryDesc').value = ''; alert('Zdjęcie dodane do bazy galerii!');
    };
    window.addSpark = async () => {
        const content = document.getElementById('sparkInput').value.trim();
        if (!content) return alert('Podaj treść cytatu!');
        await db.collection('iskierki').add({ content, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('sparkInput').value = ''; alert('Cytat dodany!');
    };
    window.addSongToPlaylist = async () => {
        const link = document.getElementById('songLink').value.trim();
        const title = document.getElementById('songTitle').value.trim();
        if (!link || !title) return alert('Podaj link i tytuł!');
        await db.collection('playlist').add({ link, title, addedAt: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('songLink').value = ''; document.getElementById('songTitle').value = ''; alert('Piosenka dodana!');
    };

    // --- INICJALIZACJA I NASŁUCHIWANIE ---
    document.getElementById('editSectionSelect').addEventListener('change', loadEntries);
    loadSections();
    loadHelpPlaces();
}
