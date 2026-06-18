// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// TODO: Replace these with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtCvA-8TnSjhjhBrlwEJ81prYRYFi6S5k",
    authDomain: "prana-os-lalu.firebaseapp.com",
    projectId: "prana-os-lalu",
    storageBucket: "prana-os-lalu.firebasestorage.app",
    messagingSenderId: "173348174799",
    appId: "1:173348174799:web:71acb1267e8dde2caab0ba",
    measurementId: "G-1MY29P96BH"
};

// Initialize Firebase only if the API key has been provided
let app, auth;

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Global Auth State Observer
    onAuthStateChanged(auth, (user) => {
        const isAuthPage = window.location.pathname.includes('login.html');

        if (user) {
            // User is signed in
            console.log("User is signed in:", user.email);
            
            // Update My Account Page Details if present
            const myaccName = document.getElementById('myacc-name');
            const myaccEmail = document.getElementById('myacc-email');
            const myaccAvatar = document.getElementById('myacc-avatar');
            
            const displayName = user.displayName || 'PranaOS User';
            
            if (myaccName) myaccName.textContent = displayName;
            if (myaccEmail) myaccEmail.textContent = user.email;
            
            if (myaccAvatar) {
                // Get initials
                const names = displayName.split(' ');
                let initials = names[0].charAt(0).toUpperCase();
                if (names.length > 1) {
                    initials += names[names.length - 1].charAt(0).toUpperCase();
                }
                myaccAvatar.textContent = initials;
            }
            
            // Update UI across pages: change login links to sign out
            const authLinks = document.querySelectorAll('.auth-link');
            authLinks.forEach(link => {
                link.textContent = "Sign Out";
                link.href = "#";
                link.classList.remove('active');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    signOut(auth).then(() => {
                        window.location.href = "index.html";
                    });
                });
            });

            // Wire up the explicit Sign Out button in My Account
            const myaccSignoutBtn = document.getElementById('myacc-signout-btn');
            if (myaccSignoutBtn) {
                myaccSignoutBtn.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.href = "index.html";
                    });
                });
            }

            // Redirect from login page to dashboard
            if (isAuthPage) {
                window.location.href = "dash.html";
            }
        } else {
            // User is signed out
            console.log("User is signed out.");
            // Ensure auth links say Login
            const authLinks = document.querySelectorAll('.auth-link');
            authLinks.forEach(link => {
                link.textContent = "Login";
                link.href = "login.html";
            });

            // Protect authenticated routes
            const protectedRoutes = ['dash.html', 'myacc.html'];
            const isProtected = protectedRoutes.some(route => window.location.pathname.includes(route));

            if (isProtected) {
                window.location.href = "login.html";
            }
        }
    });
} else {
    console.warn("Firebase is not initialized. Please add your config keys to firebase_config.js");
}

// ─── LOGIN PAGE LOGIC ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const isAuthPage = window.location.pathname.includes('login.html');

    if (isAuthPage) {
        let isSignUpMode = false;
        const form = document.getElementById('auth-form');
        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        const nameField = document.getElementById('name-field');
        const submitBtn = document.getElementById('auth-submit-btn');
        const toggleLink = document.getElementById('auth-toggle-link');
        const errorDiv = document.getElementById('auth-error');

        // Handle Toggle Between Sign In and Sign Up
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            errorDiv.style.display = 'none';

            if (isSignUpMode) {
                title.textContent = "Create Account";
                subtitle.textContent = "Join PranaOS to monitor your ecosystems";
                nameField.style.display = "block";
                submitBtn.textContent = "Sign Up";
                toggleLink.textContent = "Already have an account? Sign In";
            } else {
                title.textContent = "Welcome Back";
                subtitle.textContent = "Sign in to monitor your ecosystems";
                nameField.style.display = "none";
                submitBtn.textContent = "Sign In";
                toggleLink.textContent = "Don't have an account? Sign Up";
            }
        });

        // Handle Form Submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!auth) {
                errorDiv.textContent = "Firebase is not configured. Please add your keys in firebase_config.js.";
                errorDiv.style.display = "block";
                return;
            }

            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const name = document.getElementById('auth-name').value;

            submitBtn.textContent = "Please wait...";
            submitBtn.disabled = true;
            errorDiv.style.display = "none";

            if (isSignUpMode) {
                let createdUser;
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        createdUser = userCredential.user;
                        return updateProfile(createdUser, {
                            displayName: name
                        });
                    })
                    .then(() => {
                        // Force update of the profile in local state
                        auth.updateCurrentUser(createdUser).then(() => {
                            window.location.href = "dash.html";
                        });
                    })
                    .catch((error) => {
                        errorDiv.textContent = error.message;
                        errorDiv.style.display = "block";
                        submitBtn.textContent = "Sign Up";
                        submitBtn.disabled = false;
                    });
            } else {
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        window.location.href = "dash.html";
                    })
                    .catch((error) => {
                        errorDiv.textContent = "Invalid email or password.";
                        errorDiv.style.display = "block";
                        submitBtn.textContent = "Sign In";
                        submitBtn.disabled = false;
                    });
            }
        });
        // Handle Google Sign In
        const googleBtn = document.getElementById('auth-google-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                if (!auth) return;
                const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider)
                    .then((result) => {
                        window.location.href = "dash.html";
                    })
                    .catch((error) => {
                        errorDiv.textContent = error.message;
                        errorDiv.style.display = "block";
                    });
            });
        }

        // Handle Password Reset
        const forgotPwLink = document.getElementById('auth-forgot-pw');
        if (forgotPwLink) {
            forgotPwLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (!auth) return;
                const email = document.getElementById('auth-email').value;
                if (!email) {
                    errorDiv.textContent = "Please enter your email address first to reset your password.";
                    errorDiv.style.display = "block";
                    return;
                }
                sendPasswordResetEmail(auth, email)
                    .then(() => {
                        errorDiv.style.color = "var(--accent-emerald)";
                        errorDiv.textContent = "Password reset email sent!";
                        errorDiv.style.display = "block";
                    })
                    .catch((error) => {
                        errorDiv.style.color = "var(--danger)";
                        errorDiv.textContent = error.message;
                        errorDiv.style.display = "block";
                    });
            });
        }
    }
});
