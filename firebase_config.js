
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
    sendEmailVerification,
    fetchSignInMethodsForEmail,
    updateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    verifyBeforeUpdateEmail,
    updatePassword
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyAtCvA-8TnSjhjhBrlwEJ81prYRYFi6S5k",
    authDomain: "prana-os-lalu.firebaseapp.com",
    projectId: "prana-os-lalu",
    storageBucket: "prana-os-lalu.firebasestorage.app",
    messagingSenderId: "173348174799",
    appId: "1:173348174799:web:71acb1267e8dde2caab0ba",
    measurementId: "G-1MY29P96BH"
};
let app, auth, db;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    window.db = db;
    window.auth = auth;
    window.firebaseCollection = collection;
    window.firebaseAddDoc = addDoc;
    window.firebaseServerTimestamp = serverTimestamp;
    document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        const isAuthPage = window.location.pathname.includes('login.html');
        if (user) {
            console.log("User is signed in:", user.email);
            const myaccName = document.getElementById('myacc-name');
            const myaccEmail = document.getElementById('myacc-email');
            const myaccAvatar = document.getElementById('myacc-avatar');
            const displayName = user.displayName || 'PranaOS User';
            if (myaccName) myaccName.textContent = displayName;
            if (myaccEmail) myaccEmail.textContent = user.email;
            if (myaccAvatar) {
                const names = displayName.split(' ');
                let initials = names[0].charAt(0).toUpperCase();
                if (names.length > 1) {
                    initials += names[names.length - 1].charAt(0).toUpperCase();
                }
                myaccAvatar.textContent = initials;
            }
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
            const restrictedRoutes = ['dash.html', 'myacc.html'];
            const isRestricted = restrictedRoutes.some(route => window.location.pathname.includes(route));
            if (isRestricted && !user.emailVerified) {
                window.location.href = "verify.html";
            }
            if (isVerifyPage && user.emailVerified) {
                window.location.href = "dash.html";
            }
        } else {
            console.log("User is signed out.");
            const authLinks = document.querySelectorAll('.auth-link');
            authLinks.forEach(link => {
                link.textContent = "Login";
                link.href = "login.html";
            });
            const isVerifyPage = window.location.pathname.includes('verify.html');
            const protectedRoutes = ['dash.html', 'myacc.html', 'verify.html'];
            const isProtected = protectedRoutes.some(route => window.location.pathname.includes(route));
            if (isProtected) {
                window.location.href = "login.html";
            }
        }
    });
    }); 
} else {
    console.warn("Firebase is not initialized. Please add your config keys to firebase_config.js");
}
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
        const urlParams = new URLSearchParams(window.location.search);
        const presetEmail = urlParams.get('email');
        const forcedMode = urlParams.get('mode');
        if (presetEmail) {
            const emailInput = document.getElementById('auth-email');
            if (emailInput) {
                emailInput.value = presetEmail;
                emailInput.readOnly = true;
                emailInput.style.opacity = '0.7';
            }
        }
        const setFormMode = (toSignUp) => {
            isSignUpMode = toSignUp;
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
        };
        if (forcedMode === 'signup') {
            setFormMode(true);
            toggleLink.style.display = 'none'; 
            subtitle.textContent = "Looks like you're new here! Let's set up your account.";
        } else if (forcedMode === 'signin') {
            setFormMode(false);
            toggleLink.style.display = 'none'; 
        }
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            setFormMode(!isSignUpMode);
        });
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
                        await updateProfile(userCredential.user, {
                            displayName: name
                        });
                        await sendEmailVerification(userCredential.user);
                        await userCredential.user.reload();
                        await auth.updateCurrentUser(auth.currentUser);
                    })
                    .then(() => {
                        window.location.href = "verify.html";
                    })
                    .catch((error) => {
                        window.isSigningIn = false;
                        if (error.code === 'auth/email-already-in-use') {
                            errorDiv.textContent = "An account already exists with this email.";
                        } else {
                            errorDiv.textContent = error.message;
                        }
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
        const googleBtn = document.getElementById('auth-google-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                if (!auth) return;
                window.isSigningIn = true;
                const provider = new GoogleAuthProvider();
                signInWithRedirect(auth, provider);
            });
        }
        
        getRedirectResult(auth).then((result) => {
            if (result) {
                window.location.href = "dash.html";
            }
        }).catch((error) => {
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = "block";
            }
            window.isSigningIn = false;
        });
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
document.addEventListener('DOMContentLoaded', () => {
    const isMyaccPage = window.location.pathname.includes('myacc.html');
    if (!isMyaccPage) return;
    const editBtn = document.getElementById('myacc-edit-btn');
    const modal = document.getElementById('myacc-edit-modal');
    const closeBtn = document.getElementById('edit-close-modal-btn');
    const editError = document.getElementById('edit-error');
    const editSuccess = document.getElementById('edit-success');
    const editNameInput = document.getElementById('edit-name');
    const saveNameBtn = document.getElementById('edit-save-name-btn');
    const editEmailInput = document.getElementById('edit-email');
    const editEmailPwInput = document.getElementById('edit-email-pw');
    const saveEmailBtn = document.getElementById('edit-save-email-btn');
    const editPwCurrent = document.getElementById('edit-pw-current');
    const editPwNew = document.getElementById('edit-pw-new');
    const savePwBtn = document.getElementById('edit-save-pw-btn');
    const showMsg = (element, msg, isError) => {
        editError.style.display = 'none';
        editSuccess.style.display = 'none';
        if (msg) {
            element.textContent = msg;
            element.style.display = 'block';
        }
    };
    if (editBtn && modal) {
        editBtn.addEventListener('click', () => {
            if (auth && auth.currentUser) {
                editNameInput.value = auth.currentUser.displayName || '';
                editEmailInput.value = '';
                editEmailPwInput.value = '';
                editPwCurrent.value = '';
                editPwNew.value = '';
                showMsg(null, null); 
                modal.style.display = 'flex';
            }
        });
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        saveNameBtn.addEventListener('click', async () => {
            if (!auth || !auth.currentUser) return;
            const newName = editNameInput.value.trim();
            if (!newName) return showMsg(editError, "Name cannot be empty.", true);
            saveNameBtn.textContent = "Updating...";
            saveNameBtn.disabled = true;
            try {
                await updateProfile(auth.currentUser, { displayName: newName });
                await auth.currentUser.reload();
                const myaccName = document.getElementById('myacc-name');
                const myaccAvatar = document.getElementById('myacc-avatar');
                if (myaccName) myaccName.textContent = newName;
                if (myaccAvatar) {
                    const names = newName.split(' ');
                    let initials = names[0].charAt(0).toUpperCase();
                    if (names.length > 1) initials += names[names.length - 1].charAt(0).toUpperCase();
                    myaccAvatar.textContent = initials;
                }
                showMsg(editSuccess, "Name updated successfully!", false);
            } catch (error) {
                showMsg(editError, error.message, true);
            } finally {
                saveNameBtn.textContent = "Update";
                saveNameBtn.disabled = false;
            }
        });
        saveEmailBtn.addEventListener('click', async () => {
            if (!auth || !auth.currentUser) return;
            const newEmail = editEmailInput.value.trim();
            const password = editEmailPwInput.value;
            if (!newEmail || !password) return showMsg(editError, "Both email and current password are required.", true);
            saveEmailBtn.textContent = "Updating...";
            saveEmailBtn.disabled = true;
            try {
                const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
                await reauthenticateWithCredential(auth.currentUser, credential);
                await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
                showMsg(editSuccess, "A verification link has been sent to your NEW email. Please click it to complete the change.", false);
                editEmailInput.value = '';
                editEmailPwInput.value = '';
            } catch (error) {
                if (error.code === 'auth/wrong-password') {
                    showMsg(editError, "Incorrect current password.", true);
                } else {
                    showMsg(editError, error.message, true);
                }
            } finally {
                saveEmailBtn.textContent = "Update Email";
                saveEmailBtn.disabled = false;
            }
        });
        savePwBtn.addEventListener('click', async () => {
            if (!auth || !auth.currentUser) return;
            const currentPw = editPwCurrent.value;
            const newPw = editPwNew.value;
            if (!currentPw || !newPw) return showMsg(editError, "Both current and new passwords are required.", true);
            if (newPw.length < 6) return showMsg(editError, "New password must be at least 6 characters.", true);
            savePwBtn.textContent = "Updating...";
            savePwBtn.disabled = true;
            try {
                const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPw);
                await reauthenticateWithCredential(auth.currentUser, credential);
                await updatePassword(auth.currentUser, newPw);
                showMsg(editSuccess, "Password updated successfully!", false);
                editPwCurrent.value = '';
                editPwNew.value = '';
            } catch (error) {
                if (error.code === 'auth/wrong-password') {
                    showMsg(editError, "Incorrect current password.", true);
                } else {
                    showMsg(editError, error.message, true);
                }
            } finally {
                savePwBtn.textContent = "Update Password";
                savePwBtn.disabled = false;
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const isVerifyPage = window.location.pathname.includes('verify.html');
    if (!isVerifyPage) return;
    const checkBtn = document.getElementById('verify-check-btn');
    const signOutBtn = document.getElementById('verify-signout-btn');
    const resendBtn = document.getElementById('verify-resend-btn');
    const verifyError = document.getElementById('verify-error');
    if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
            if (!auth || !auth.currentUser) return;
            resendBtn.textContent = "Sending...";
            resendBtn.disabled = true;
            if (verifyError) verifyError.style.display = 'none';
            try {
                await sendEmailVerification(auth.currentUser);
                if (verifyError) {
                    verifyError.style.color = "var(--accent-emerald)";
                    verifyError.textContent = "Verification email resent! Please check your inbox and spam folder.";
                    verifyError.style.display = 'block';
                }
            } catch (error) {
                if (verifyError) {
                    verifyError.style.color = "var(--danger)";
                    verifyError.textContent = "Error: " + error.message;
                    verifyError.style.display = 'block';
                }
            } finally {
                resendBtn.textContent = "Resend Verification Email";
                resendBtn.disabled = false;
            }
        });
    }
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = "login.html";
            });
        });
    }
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
    const emailDisplay = document.getElementById('verify-email-display');
    const changeEmailBtn = document.getElementById('verify-change-email-btn');
    const changeEmailForm = document.getElementById('verify-change-email-form');
    const cancelChangeBtn = document.getElementById('verify-cancel-change-btn');
    const saveEmailBtn = document.getElementById('verify-save-email-btn');
    const newEmailInput = document.getElementById('verify-new-email');
    auth.onAuthStateChanged((user) => {
        if (user && emailDisplay) {
            emailDisplay.textContent = user.email;
        }
    });
    if (changeEmailBtn && changeEmailForm) {
        changeEmailBtn.addEventListener('click', () => {
            changeEmailForm.style.display = 'block';
            if (verifyError) verifyError.style.display = 'none';
        });
        cancelChangeBtn.addEventListener('click', () => {
            changeEmailForm.style.display = 'none';
        });
        saveEmailBtn.addEventListener('click', async () => {
            const newEmail = newEmailInput.value.trim();
            if (!newEmail) return;
            saveEmailBtn.textContent = "Updating...";
            saveEmailBtn.disabled = true;
            if (verifyError) verifyError.style.display = 'none';
            try {
                await updateEmail(auth.currentUser, newEmail);
                await sendEmailVerification(auth.currentUser);
                emailDisplay.textContent = newEmail;
                changeEmailForm.style.display = 'none';
                if (verifyError) {
                    verifyError.style.color = "var(--accent-emerald)";
                    verifyError.textContent = "Email updated and new verification link sent!";
                    verifyError.style.display = 'block';
                }
            } catch (error) {
                if (verifyError) {
                    verifyError.style.color = "var(--danger)";
                    verifyError.textContent = "Error: " + error.message;
                    verifyError.style.display = 'block';
                }
            } finally {
                saveEmailBtn.textContent = "Update Email";
                saveEmailBtn.disabled = false;
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
    if (!isIndexPage) return;
    const landingForm = document.getElementById('landing-auth-form');
    const landingEmail = document.getElementById('landing-email');
    const landingSubmitBtn = document.getElementById('landing-submit-btn');
    const landingError = document.getElementById('landing-error');
    const landingGoogleBtn = document.getElementById('landing-google-btn');
    if (landingForm) {
        landingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = landingEmail.value.trim();
            if (!email) return;
            landingSubmitBtn.textContent = "Checking...";
            landingSubmitBtn.disabled = true;
            if (landingError) landingError.style.display = 'none';
            try {
                const methods = await fetchSignInMethodsForEmail(auth, email);
                if (methods && methods.length > 0) {
                    window.location.href = `login.html?email=${encodeURIComponent(email)}&mode=signin`;
                } else {
                    window.location.href = `login.html?email=${encodeURIComponent(email)}&mode=signup`;
                }
            } catch (error) {
                if (landingError) {
                    landingError.textContent = "Error checking email. Make sure Email Enumeration Protection is disabled in Firebase.";
                    landingError.style.display = 'block';
                }
            } finally {
                landingSubmitBtn.textContent = "Continue";
                landingSubmitBtn.disabled = false;
            }
        });
    }
    if (landingGoogleBtn) {
        landingGoogleBtn.addEventListener('click', () => {
            if (!auth) return;
            const provider = new GoogleAuthProvider();
            signInWithRedirect(auth, provider);
        });

        getRedirectResult(auth).then((result) => {
            if (result) {
                window.location.href = "dash.html";
            }
        }).catch((error) => {
            if (landingError) {
                landingError.textContent = error.message;
                landingError.style.display = 'block';
            }
        });
    }
});
