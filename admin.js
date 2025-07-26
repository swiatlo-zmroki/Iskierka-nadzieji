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
        .then(() => {
            // Po udanym logowaniu auth.onAuthStateChanged się zajmie
        })
        .catch(error => {
            alert("Błędny email lub hasło. Spróbuj jeszcze raz.");
            loginError.textContent = "Błędny email lub hasło.";
            console.error("Błąd logowania:", error);
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
    
    // --- REFERENCJE DO ELEMENTÓW DOM ---
    const newSectionNameInput = document.getElementById('newSectionName');
    const sectionSelect = document.getElementById('sectionSelect');
    const editSectionSelect = document.getElementById('editSectionSelect');
    const entryTitleInput = document.getElementById('entryTitle');
    const entryTextInput = document.getElementById('entryText');
    const entriesListDiv = document.getElementById('entriesList');
    const menuEditorDiv = document.getElementById('menuEditor');
    const galleryImageUrlInput = document.getElementById('galleryImageUrl');
    const galleryDescInput = document.getElementById('galleryDesc');
    const sparkInput = document.getElementById('sparkInput');
    const songLinkInput = document.getElementById('songLink');
    const songTitleInput = document.getElementById('songTitle');
    const helpWojewodztwoSelect = document.getElementById('helpWojewodztwo');
    const helpNameInput = document.getElementById('helpName');
    const helpAddressInput = document.getElementById('helpAddress');
    const helpPhoneInput = document.getElementById('helpPhone');
    const helpWebsiteInput = document.getElementById('helpWebsite');
    const helpDescriptionInput = document.getElementById('helpDescription');
    const helpPlacesListDiv = document.getElementById('helpPlacesList');

    // Helper do tworzenia slugów
    const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    // --- FUNKCJE ŁADUJĄCE DANE ---
    async function loadSections() {
        const snapshot = await db.collection('_sections').orderBy('createdAt', 'desc').get();
        sectionSelect.innerHTML = '';
        editSectionSelect.innerHTML = '';
        menuEditorDiv.innerHTML = '';
        snapshot.forEach(doc => {
            const section = { id: doc.id, ...doc.data() };
            [sectionSelect, editSectionSelect].forEach(sel => sel.add(new Option(section.name, section.id)));
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between border p-2 rounded';
            div.innerHTML = `<span>${section.name}</span><button class="delete-section-btn bg-red-500 text-white px-2 py-1 rounded text-sm" data-id="${section.id}" data-name="${section.name}">Usuń</button>`;
            menuEditorDiv.appendChild(div);
        });
        loadEntries();
    }
    
    async function loadEntries() {
        if (!editSectionSelect.value) { entriesListDiv.innerHTML = ''; return; }
        entriesListDiv.innerHTML = 'Ładowanie...';
        const snapshot = await db.collection('entries').where('sectionId', '==', editSectionSelect.value).orderBy('createdAt', 'desc').get();
        entriesListDiv.innerHTML = snapshot.empty ? '<p class="text-gray-500">Brak wpisów w tej sekcji.</p>' : '';
        snapshot.forEach(doc => {
            const entry = { id: doc.id, ...doc.data() };
            const div = document.createElement('div');
            div.className = 'border p-3 rounded bg-gray-50';
            div.innerHTML = `<div class="font-semibold">${entry.title || '(bez tytułu)'}</div><p class="text-gray-700">${entry.text}</p><button class="delete-entry-btn text-red-600 hover:underline mt-2 text-sm" data-id="${entry.id}">Usuń</button>`;
            entriesListDiv.appendChild(div);
        });
    }

    async function loadHelpPlaces() {
        helpPlacesListDiv.innerHTML = 'Ładowanie...';
        const snapshot = await db.collection('miejsca_pomocy').orderBy('createdAt', 'desc').get();
        helpPlacesListDiv.innerHTML = snapshot.empty ? '<p class="text-gray-500">Brak dodanych miejsc.</p>' : '';
        snapshot.forEach(doc => {
            const place = { id: doc.id, ...doc.data() };
            const div = document.createElement('div');
            div.className = 'border p-3 rounded bg-gray-50 flex justify-between items-center';
            div.innerHTML = `<div><div class="font-bold">${place.nazwa} <span class="text-sm font-normal text-gray-500">(${place.wojewodztwo})</span></div><p class="text-sm text-gray-600">${place.adres || ''} | Tel: ${place.telefon || ''}</p></div><button class="delete-help-btn bg-red-500 text-white px-2 py-1 rounded text-sm flex-shrink-0" data-id="${place.id}">Usuń</button>`;
            helpPlacesListDiv.appendChild(div);
        });
    }

    // --- FUNKCJE AKCJI ---
    async function addNewSection() {
        const name = newSectionNameInput.value.trim();
        if (!name) return alert("Podaj nazwę sekcji!");
        await db.collection('_sections').add({ name, slug: slugify(name), createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        newSectionNameInput.value = ''; loadSections();
    }

    async function deleteSection(id, name) {
        if (!confirm(`Na pewno chcesz usunąć sekcję "${name}" i wszystkie jej wpisy?`)) return;
        const batch = db.batch();
        const entriesSnapshot = await db.collection('entries').where('sectionId', '==', id).get();
        entriesSnapshot.forEach(doc => batch.delete(doc.ref));
        batch.delete(db.collection('_sections').doc(id));
        await batch.commit();
        loadSections();
    }

    async function addEntry() {
        const text = entryTextInput.value.trim();
        if (!text) return alert("Wpisz treść!");
        await db.collection('entries').add({ sectionId: sectionSelect.value, title: entryTitleInput.value.trim() || null, text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        entryTitleInput.value = ''; entryTextInput.value = ''; alert('Wpis dodany!'); loadEntries();
    }

    async function deleteEntry(id) {
        if (confirm('Na pewno usunąć ten wpis?')) { await db.collection('entries').doc(id).delete(); loadEntries(); }
    }

    async function addHelpPlace() {
        const nazwa = helpNameInput.value.trim();
        if(!nazwa) return alert('Nazwa miejsca jest wymagana!');
        await db.collection('miejsca_pomocy').add({
            nazwa, wojewodztwo: helpWojewodztwoSelect.value, adres: helpAddressInput.value.trim() || null,
            telefon: helpPhoneInput.value.trim() || null, strona_www: helpWebsiteInput.value.trim() || null,
            opis: helpDescriptionInput.value.trim() || null, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        [helpNameInput, helpAddressInput, helpPhoneInput, helpWebsiteInput, helpDescriptionInput].forEach(i => i.value = '');
        alert('Miejsce pomocy dodane!'); loadHelpPlaces();
    }

    async function deleteHelpPlace(id) {
        if (confirm('Na pewno usunąć to miejsce?')) { await db.collection('miejsca_pomocy').doc(id).delete(); loadHelpPlaces(); }
    }

    async function addGalleryImage() {
        const url = galleryImageUrlInput.value.trim();
        if (!url) return alert('Wklej link do zdjęcia!');
        await db.collection('gallery').add({ url, description: galleryDescInput.value.trim() || null, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        galleryImageUrlInput.value = ''; galleryDescInput.value = ''; alert('Zdjęcie dodane do bazy galerii!');
    }

    async function addSpark() {
        const content = sparkInput.value.trim();
        if (!content) return alert('Podaj treść cytatu!');
        await db.collection('iskierki').add({ content, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        sparkInput.value = ''; alert('Cytat dodany!');
    }

    async function addSongToPlaylist() {
        const link = songLinkInput.value.trim();
        const title = songTitleInput.value.trim();
        if (!link || !title) return alert('Podaj link i tytuł!');
        await db.collection('playlist').add({ link, title, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        songLinkInput.value = ''; songTitleInput.value = ''; alert('Piosenka dodana!');
    }
    
    // --- NASŁUCHIWANIE NA KLIKNIĘCIA ---
    document.getElementById('addGalleryImageBtn').addEventListener('click', addGalleryImage);
    document.getElementById('addHelpPlaceBtn').addEventListener('click', addHelpPlace);
    document.getElementById('addNewSectionBtn').addEventListener('click', addNewSection);
    document.getElementById('addEntryBtn').addEventListener('click', addEntry);
    document.getElementById('addSparkBtn').addEventListener('click', addSpark);
    document.getElementById('addSongBtn').addEventListener('click', addSongToPlaylist);

    adminPanel.addEventListener('click',
