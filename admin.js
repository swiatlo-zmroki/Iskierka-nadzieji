// KONFIGURACJA FIREBASE (Twoje klucze)
const firebaseConfig = {
    apiKey: "AIzaSyANxGt1rQtBamptyYVI5ZNMtyGbpOhWBqE",
    authDomain: "od-dna-do-swiatla.firebaseapp.com",
    projectId: "od-dna-do-swiatla",
    storageBucket: "od-dna-do-swiatla.firebasestorage.app",
    messagingSenderId: "96366183668",
    appId: "1:96366183668:web:37f36a4004dd6fd85acaa1"
};

// INICJALIZACJA FIREBASE
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ELEMENTY DOM
const loginContainer = document.getElementById('loginContainer');
const adminPanel = document.getElementById('adminPanel');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

// OBSŁUGA KLIKNIECIA LOGOWANIA
loginBtn.addEventListener('click', () => {
    alert('Kliknąłeś "Zaloguj się" - próbuję logować...');
    console.log('Próba logowania, email:', emailInput.value);

    loginError.textContent = '';
    auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
        .then(() => {
            alert('Logowanie powiodło się!');
            console.log('Zalogowano pomyślnie');
        })
        .catch(error => {
            console.error('Błąd logowania:', error);
            loginError.textContent = "Błędny email lub hasło.";
            alert('Błędny email lub hasło.');
        });
});

// OBSŁUGA WYLOGOWANIA
logoutBtn.addEventListener('click', () => {
    auth.signOut();
    alert('Wylogowano!');
});

// ZMIANA STANU LOGOWANIA
auth.onAuthStateChanged(user => {
    if (user) {
        loginContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        alert('Jesteś zalogowany');
        console.log('Użytkownik zalogowany:', user.email);
    } else {
        loginContainer.style.display = 'block';
        adminPanel.style.display = 'none';
        alert('Nie jesteś zalogowany');
        console.log('Użytkownik wylogowany');
    }
});
