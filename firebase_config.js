import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    onAuthStateChanged, signOut, updateProfile,
    GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAtCvA-8TnSjhjhBrlwEJ81prYRYFi6S5k",
    authDomain: "prana-os-lalu.firebaseapp.com",
    projectId: "prana-os-lalu",
    storageBucket: "prana-os-lalu.firebasestorage.app",
    messagingSenderId: "173348174799",
    appId: "1:173348174799:web:71acb1267e8dde2caab0ba",
    measurementId: "G-1MY29P96BH"
};

let app, auth;

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        let isAuthPage = window.location.pathname.includes('login.html');
        if (user) {
            let myaccName = document.getElementById('myacc-name');
            let myaccEmail = document.getElementById('myacc-email');
            let myaccAvatar = document.getElementById('myacc-avatar');
            let dn = user.displayName || 'PranaOS User';
            if (myaccName) myaccName.textContent = dn;
            if (myaccEmail) myaccEmail.textContent = user.email;
            if (myaccAvatar) {
                let parts = dn.split(' ');
                let ini = parts[0].charAt(0).toUpperCase();
                if (parts.length > 1) ini += parts[parts.length-1].charAt(0).toUpperCase();
                myaccAvatar.textContent = ini;
            }
            document.querySelectorAll('.auth-link').forEach(link => {
                link.textContent = "Sign Out";
                link.href = "#";
                link.classList.remove('active');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    signOut(auth).then(() => { window.location.href = "index.html"; });
                });
            });
            let signoutBtn = document.getElementById('myacc-signout-btn');
            if (signoutBtn) {
                signoutBtn.addEventListener('click', () => {
                    signOut(auth).then(() => { window.location.href = "index.html"; });
                });
            }
            if (isAuthPage) window.location.href = "dash.html";
        } else {
            document.querySelectorAll('.auth-link').forEach(link => {
                link.textContent = "Login";
                link.href = "login.html";
            });
            let protectedRoutes = ['dash.html', 'myacc.html'];
            let isProtected = protectedRoutes.some(r => window.location.pathname.includes(r));
            if (isProtected) window.location.href = "login.html";
        }
    });
    });
} else {
    console.warn("Firebase not initialized");
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('login.html')) return;

    let isSignUp = false;
    let form = document.getElementById('auth-form');
    let title = document.getElementById('auth-title');
    let subtitle = document.getElementById('auth-subtitle');
    let nameField = document.getElementById('name-field');
    let nameInput = document.getElementById('auth-name');
    let submitBtn = document.getElementById('auth-submit-btn');
    let toggleLink = document.getElementById('auth-toggle-link');
    let errorDiv = document.getElementById('auth-error');

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;
        errorDiv.style.display = 'none';
        if (isSignUp) {
            title.textContent = "Create Account";
            subtitle.textContent = "Join PranaOS to monitor your ecosystems";
            nameField.style.display = "block";
            nameInput.required = true;
            submitBtn.textContent = "Sign Up";
            toggleLink.textContent = "Already have an account? Sign In";
        } else {
            title.textContent = "Welcome Back";
            subtitle.textContent = "Sign in to monitor your ecosystems";
            nameField.style.display = "none";
            nameInput.required = false;
            submitBtn.textContent = "Sign In";
            toggleLink.textContent = "Don't have an account? Sign Up";
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!auth) {
            errorDiv.textContent = "Firebase is not configured.";
            errorDiv.style.display = "block";
            return;
        }
        let email = document.getElementById('auth-email').value;
        let password = document.getElementById('auth-password').value;
        let name = document.getElementById('auth-name').value;

        if (isSignUp && !name.trim()) {
            errorDiv.textContent = "Please enter your name.";
            errorDiv.style.display = "block";
            return;
        }

        submitBtn.textContent = "Please wait...";
        submitBtn.disabled = true;
        errorDiv.style.display = "none";

        if (isSignUp) {
            let u;
            createUserWithEmailAndPassword(auth, email, password)
                .then((cred) => {
                    u = cred.user;
                    return updateProfile(u, { displayName: name });
                })
                .then(() => {
                    auth.updateCurrentUser(u).then(() => { window.location.href = "dash.html"; });
                })
                .catch((err) => {
                    errorDiv.textContent = err.message;
                    errorDiv.style.display = "block";
                    submitBtn.textContent = "Sign Up";
                    submitBtn.disabled = false;
                });
        } else {
            signInWithEmailAndPassword(auth, email, password)
                .then(() => { window.location.href = "dash.html"; })
                .catch(() => {
                    errorDiv.textContent = "Invalid email or password.";
                    errorDiv.style.display = "block";
                    submitBtn.textContent = "Sign In";
                    submitBtn.disabled = false;
                });
        }
    });

    let googleBtn = document.getElementById('auth-google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            if (!auth) return;
            signInWithPopup(auth, new GoogleAuthProvider())
                .then(() => { window.location.href = "dash.html"; })
                .catch((err) => {
                    errorDiv.textContent = err.message;
                    errorDiv.style.display = "block";
                });
        });
    }

    let forgotPw = document.getElementById('auth-forgot-pw');
    if (forgotPw) {
        forgotPw.addEventListener('click', (e) => {
            e.preventDefault();
            if (!auth) return;
            let em = document.getElementById('auth-email').value;
            if (!em) {
                errorDiv.textContent = "Enter your email first to reset password.";
                errorDiv.style.display = "block";
                return;
            }
            sendPasswordResetEmail(auth, em)
                .then(() => {
                    errorDiv.style.color = "var(--accent-emerald)";
                    errorDiv.textContent = "Password reset email sent!";
                    errorDiv.style.display = "block";
                })
                .catch((err) => {
                    errorDiv.style.color = "var(--danger)";
                    errorDiv.textContent = err.message;
                    errorDiv.style.display = "block";
                });
        });
    }
});
