import { userLogin } from './userLogin.js';
import { navigators } from './footer.js';
import { showheaders, hideHeaders } from './header.js';
import { forgetPassword } from './forgetPassword.js';
import { searchFeatures } from './searchParcel.js';
import { qrScanner, stopStream } from './qrScanner.js';
import { userSetting } from './userSetting.js';
import { resetPassword, resetPasswordState } from './resetPassword.js';
import { userProfileSetting } from './userProfile.js';
import { aboutDriverApp } from './aboutSetting.js';
import { signupForm } from './userSignUp.js';
import { verifyToken } from './checkToken.js';

window.onload = async function () {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const authenticated = await verifyToken(token);
    if (authenticated) {
        window.location.hash = 'setting';
        showheaders();
        navigators('setting');
        userSetting();
    } else {
        userLogin();
    }

    window.onhashchange = async function () {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const hash = window.location.hash.toLowerCase();
        console.log(`path changes! ${hash}`);
        stopStream();
        hideHeaders();
        const authenticated = await verifyToken(token);
        if (authenticated) {
            if (hash.includes(`#dashboard`)) {
                window.location.hash = 'setting';
            } else if (hash.includes(`#scanner`)) {
                navigators('scanner');
                qrScanner();
            } else if (hash.includes(`#search`)) {
                navigators('search');
                searchFeatures();
            } else if (hash.includes(`#tasks`)) {
                navigators('tasks');
            } else if (hash.includes(`#setting`)) {
                if (hash.includes(`userprofile`)) {
                    userProfileSetting();
                } else if (hash.includes(`resetpassword`)) {
                    resetPassword();
                } else if (hash.includes(`about`)) {
                    aboutDriverApp();
                } else {
                    navigators('setting');
                    userSetting();
                }
            } else {
                window.location.hash = '';
            }
        } else {
            switch (window.location.hash) {
                case '#forgetpassword':
                    forgetPassword();
                    break;
                case '#signup':
                    signupForm();
                    break;
                default:
                    userLogin();
            }
        }
    }
}