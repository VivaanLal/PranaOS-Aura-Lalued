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
    sendPasswordResetEmail,
    sendEmailVerification
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

    // Global Auth State Observer — wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
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

            const isVerifyPage = window.location.pathname.includes('verify.html');

            if (isAuthPage && !window.isSigningIn) {
                if (user.emailVerified) {
                    window.location.href = "dash.html";
                } else {
                    window.location.href = "verify.html";
                }
            }

            // Route protection for unverified users trying to access dashboard/account
            const restrictedRoutes = ['dash.html', 'myacc.html'];
            const isRestricted = restrictedRoutes.some(route => window.location.pathname.includes(route));
            
            if (isRestricted && !user.emailVerified) {
                window.location.href = "verify.html";
            }

            // Auto-redirect from verify page if they are already verified
            if (isVerifyPage && user.emailVerified) {
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

            const isVerifyPage = window.location.pathname.includes('verify.html');

            // Protect authenticated routes
            const protectedRoutes = ['dash.html', 'myacc.html', 'verify.html'];
            const isProtected = protectedRoutes.some(route => window.location.pathname.includes(route));

            if (isProtected) {
                window.location.href = "login.html";
            }
        }
    });
    }); // end DOMContentLoaded
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
                document.getElementById('auth-name').required = true;
                submitBtn.textContent = "Sign Up";
                toggleLink.textContent = "Already have an account? Sign In";
            } else {
                title.textContent = "Welcome Back";
                subtitle.textContent = "Sign in to monitor your ecosystems";
                nameField.style.display = "none";
                document.getElementById('auth-name').required = false;
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
            window.isSigningIn = true;

            if (isSignUpMode) {
                if (!name || name.trim() === "") {
                    errorDiv.textContent = "Please enter your full name.";
                    errorDiv.style.display = "block";
                    submitBtn.textContent = "Sign Up";
                    submitBtn.disabled = false;
                    window.isSigningIn = false;
                    return;
                }

                createUserWithEmailAndPassword(auth, email, password)
                    .then(async (userCredential) => {
                        // Update the profile with the name
                        await updateProfile(userCredential.user, {
                            displayName: name
                        });
                        // Send verification email
                        await sendEmailVerification(userCredential.user);
                        // Reload the user to ensure the new displayName is picked up globally
                        await userCredential.user.reload();
                        // Force update of the profile in local persistence to fix the name bug
                        await auth.updateCurrentUser(auth.currentUser);
                    })
                    .then(() => {
                        window.location.href = "verify.html";
                    })
                    .catch((error) => {
                        window.isSigningIn = false;
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
                        window.isSigningIn = false;
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
                window.isSigningIn = true;
                const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider)
                    .then((result) => {
                        window.location.href = "dash.html";
                    })
                    .catch((error) => {
                        window.isSigningIn = false;
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

// ─── EDIT PROFILE LOGIC (MYACC.HTML) ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const isMyaccPage = window.location.pathname.includes('myacc.html');
    if (!isMyaccPage) return;

    const editBtn = document.getElementById('myacc-edit-btn');
    const modal = document.getElementById('myacc-edit-modal');
    const cancelBtn = document.getElementById('edit-cancel-btn');
    const saveBtn = document.getElementById('edit-save-btn');
    const editNameInput = document.getElementById('edit-name');
    const editError = document.getElementById('edit-error');

    if (editBtn && modal) {
        editBtn.addEventListener('click', () => {
            if (auth && auth.currentUser) {
                editNameInput.value = auth.currentUser.displayName || '';
                editError.style.display = 'none';
                modal.style.display = 'flex';
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        saveBtn.addEventListener('click', async () => {
            if (!auth || !auth.currentUser) return;
            const newName = editNameInput.value.trim();
            
            if (!newName) {
                editError.textContent = "Name cannot be empty.";
                editError.style.display = 'block';
                return;
            }

            saveBtn.textContent = "Saving...";
            saveBtn.disabled = true;
            editError.style.display = 'none';

            try {
                await updateProfile(auth.currentUser, { displayName: newName });
                await auth.currentUser.reload();
                await auth.updateCurrentUser(auth.currentUser);
                
                // Update UI without full reload
                const myaccName = document.getElementById('myacc-name');
                const myaccAvatar = document.getElementById('myacc-avatar');
                
                if (myaccName) myaccName.textContent = newName;
                if (myaccAvatar) {
                    const names = newName.split(' ');
                    let initials = names[0].charAt(0).toUpperCase();
                    if (names.length > 1) {
                        initials += names[names.length - 1].charAt(0).toUpperCase();
                    }
                    myaccAvatar.textContent = initials;
                }
                
                modal.style.display = 'none';
            } catch (error) {
                editError.textContent = error.message;
                editError.style.display = 'block';
            } finally {
                saveBtn.textContent = "Save";
                saveBtn.disabled = false;
            }
        });
        });
    }
});

// ─── VERIFY EMAIL LOGIC (VERIFY.HTML) ───────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const isVerifyPage = window.location.pathname.includes('verify.html');
    if (!isVerifyPage) return;

    const checkBtn = document.getElementById('verify-check-btn');
    const verifyError = document.getElementById('verify-error');

    if (checkBtn) {
        checkBtn.addEventListener('click', async () => {
            if (!auth || !auth.currentUser) {
                window.location.href = "login.html";
                return;
            }

            checkBtn.textContent = "Checking...";
            checkBtn.disabled = true;
            if (verifyError) verifyError.style.display = 'none';

            try {
                await auth.currentUser.reload();
                
                if (auth.currentUser.emailVerified) {
                    window.location.href = "dash.html";
                } else {
                    if (verifyError) {
                        verifyError.textContent = "Email is not verified yet. Please check your inbox and click the link.";
                        verifyError.style.display = 'block';
                    }
                }
            } catch (error) {
                if (verifyError) {
                    verifyError.textContent = "Error checking verification status.";
                    verifyError.style.display = 'block';
                }
            } finally {
                checkBtn.textContent = "I have verified my email";
                checkBtn.disabled = false;
            }
        });
    }
});
