import endpoints from './endpoints.js';
import { generateHeaders } from './checkToken.js';
import { verifyEmail, verifyPhone } from './helpers.js';

const defaultPendingTime = 60;
const state = {
    name: '',
    email: '',
    phone: '',
    pending: defaultPendingTime,
    countdownTimer: null
}

export async function signupForm() {
    const container = document.querySelector('.container');
    container.innerHTML = registrationForm(state.name, state.email, state.phone);
    togglePassword();
    const form = container.querySelector('form');
    form.onsubmit = signUpUser;
    clearPasswordInputsOnFly();
    checkEmailAndPhone();
    checkBothPasswords();
}

async function signUpUser(event) {
    event.preventDefault();
    const inputs = [...document.querySelectorAll('input')];
    const userProfile = inputs.reduce((profile, input) => {
        profile[input.dataset.type] = input.value;
        return profile;
    }, {});
    state.name = userProfile.name;
    state.email = userProfile.email;
    state.phone = userProfile.phone;
    if (userProfile.password === userProfile.confirm_password) {
        const formWrapper = document.querySelector('#form_wrapper');
        formWrapper.style.justifyContent = `center`;
        formWrapper.innerHTML = loaderTag();
        const buttons = document.querySelector('#signup_form > div:last-child');
        buttons.style.display = 'none';
        const headers = await generateHeaders();
        let response = await fetch(endpoints.signupEndpoint, {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
                'client-token': headers['client-token'],
                'time-stamp': headers['time-stamp'],
                'time-signature': headers['time-signature']
            },
            body: JSON.stringify({
                name: userProfile.name,
                email: userProfile.email,
                phone: userProfile.phone,
                password: userProfile.password
            })
        }).then(res => res.json()).then(data => data).catch(err => err);
        /*
            1. Request to register
            2. Check server response
            3. Show result
            3.1 Successful
            3.2 Invalid Input
            3.3 Server Error
        */
        if (response.resCode === 201) {
            console.log('signup success');
            buttons.style.display = 'flex';
            window.location.hash = '#dashboard';
            localStorage.setItem('token', response.token);
            // verificationForm();
        } else {
            console.log(response.message);
            alert(response.message);
            formWrapper.style.justifyContent = `flex-start`;
            signupForm();
        }
    } else {
        invalidPasswordInputs();
    }
}

function registrationForm(name = '', email = '', phone = '') {
    return `
    <div id="signup_form">
        <div>
            <a href="#"><img src="${endpoints.host}/images/eridu_logo.png" alt="eridu_logo"></a>
        </div>
        <h1>Register</h1>
        <div id="form_wrapper">
            <form action="" id="eridu_signup_form" class="form-group">
                <div class="input-group mt-3 mb-3">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                    <input data-type="name" value="${name}" type="text" class="form-control" aria-label="name"
                        placeholder="Your Name" required>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                    <input data-type="email" value="${email}" type="email" inputmode="email" class="form-control"
                        aria-label="email" placeholder="Email" required>
                    <div class="invalid-feedback">This Email is in use! Please choose another email</div>
                    <div class="valid-feedback">This email is available!</div>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="fas fa-phone-alt"></i></span>
                    <input data-type="phone" value="${phone}" type="number" inputmode="numeric" class="form-control"
                        aria-label="phone number" placeholder="Phone Number" required>
                    <div class="invalid-feedback">This phone number is in use! Please choose another one</div>
                    <div class="valid-feedback">This phone number is available!</div>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input data-type="password" type="password" class="form-control" aria-label="new password"
                        placeholder="New Password" required>
                    <span class="input-group-text"><i class="fas fa-eye"></i></span>
                    <div class="invalid-feedback">Your passwords do not match!</div>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input data-type="confirm_password" type="password" class="form-control"
                        aria-label="confirm password" placeholder="Confirm Password" required>
                    <span class="input-group-text"><i class="fas fa-eye"></i></span>
                    <div class="invalid-feedback">Your passwords do not match!</div>
                </div>            
            </form>
        </div>
        <div>
            <div><a class="btn btn-primary" href="#">Back</a></div>
            <input value="Sign Up" type="submit" class="btn btn-warning" id="signup_next_step" form="eridu_signup_form">
        </div>
    </div>
    `
}

function togglePassword() {
    const passwordInputs = document.querySelectorAll('input[type=password]');
    [...passwordInputs].forEach(passwordInput => {
        const eyeBtn = passwordInput.parentNode.querySelectorAll('span')[1];
        eyeBtn.onclick = function (event) {
            event.stopPropagation();
            const inputTag = this.parentNode.querySelector('input');
            const inputType = inputTag.type;
            if (inputType === 'password') {
                this.innerHTML = `<i class="fas fa-eye-slash"></i>`;
                inputTag.type = 'text';
            } else {
                this.innerHTML = `<i class="fas fa-eye"></i>`;
                inputTag.type = 'password';
            }
        }
    });
}

function checkBothPasswords() {
    const passwordInput = document.querySelector('input[data-type=password]');
    const confirmPasswordInput = document.querySelector('input[data-type=confirm_password]');
    passwordInput.onchange = validBothPasswords;
    confirmPasswordInput.onchange = validBothPasswords;

    function validBothPasswords(event) {
        if (passwordInput.value.trim() && confirmPasswordInput.value.trim() && passwordInput.value !== confirmPasswordInput.value) {
            passwordInput.classList.add('is-invalid');
            confirmPasswordInput.classList.add('is-invalid');
        }
    }
}

function checkEmailAndPhone() {
    const emailInput = document.querySelector('input[data-type=email]');
    const phoneInput = document.querySelector('input[data-type=phone]');
    emailInput.oninput = removeValidator;
    phoneInput.oninput = removeValidator;
    emailInput.onblur = verifyEmail;
    phoneInput.onblur = verifyPhone;

    function removeValidator() {
        this.classList.remove('is-invalid');
        this.classList.remove('is-valid');
    }
}



function clearPasswordInputsOnFly() {
    const passwordInputs = [...document.querySelectorAll('input[type=password]')];
    passwordInputs.forEach(input => {
        input.oninput = resetPasswordInputs;
    });
}

function resetPasswordInputs() {
    const passwordInput = document.querySelector('input[data-type=password]');
    const confirmPasswordInput = document.querySelector('input[data-type=confirm_password]');
    passwordInput.classList.remove('is-invalid');
    confirmPasswordInput.classList.remove('is-invalid');
}

function invalidPasswordInputs() {
    const passwordInput = document.querySelector('input[data-type=password]');
    const confirmPasswordInput = document.querySelector('input[data-type=confirm_password]');
    passwordInput.classList.add('is-invalid');
    confirmPasswordInput.classList.add('is-invalid');
}

function loaderTag() {
    return `
        <div id="regiser_form_loader">
            <div class="spinner-border text-warning" style="width:3rem; height:3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h4>Loading...</h4>
        </div>
    `;
}

function verificationForm() {
    const formWrapper = document.querySelector('#form_wrapper');
    formWrapper.innerHTML = `
    <form action="" class="form-group" id="registration_verification">
        <div class="mt-3 mb-3">
            <label for="verification_code_input" class="form-label">Verification Code</label>
            <input id="verification_code_input" data-type="verification_code" value="" type="text" class="form-control" aria-label="verification code"
            placeholder="0000" required>
        </div>
    </form>
    <div>
        <button type="submit" class="btn btn-warning" disabled>Request Code <span>(<span id="countdown">${state.pending}</span> sec)</span></button>
    <div>
    `;
    const input = document.querySelector('#signup_next_step')
    input.setAttribute('form', 'registration_verification');
    input.value = 'Verify';
    formWrapper.querySelector('form').onsubmit = checkVerificationCode;
    countdown();
}


function countdown() {
    if (state.countdownTimer) {
        clearTimeout(state.countdownTimer);
    }
    const clock = document.querySelector('#countdown');
    if (clock) {
        let second = state.pending;
        if (second > 0) {
            state.pending = second - 1;
            clock.innerText = state.pending;
            state.countdownTimer = setTimeout(function () {
                countdown(state.pending);
            }, 1000);
        } else {
            const requestCode = document.querySelector('#signup_form button');
            requestCode.removeAttribute('disabled');
            clock.parentNode.innerHTML = ``;
            requestCode.onclick = function (event) {
                event.preventDefault();
                state.pending = defaultPendingTime;
                requestCode.setAttribute("disabled", true);
                document.querySelector('#signup_form button span').innerHTML = `(<span id="countdown">${state.pending}</span> sec)`;
                countdown(state.pending);
            }
        }
    }
}

async function checkVerificationCode(event) {
    event.preventDefault();
    const formWrapper = document.querySelector('#form_wrapper');
    const token = document.querySelector('form input').value;
    formWrapper.innerHTML = loaderTag();
    let response = {
        resCode: 200,
        message: 'invalid token'
    }
    if (token === '0000') {
        setTimeout(function () {
            if (response.resCode === 200) {
                const duration = 3;
                formWrapper.innerHTML = successAnimation(duration);
                redirectCountdown(duration);
                setTimeout(function () {
                    window.location.hash = '';
                    window.location.reload();
                }, duration * 1000);
            } else {
                console.log(response.message);
                alert(response.message);
                window.location.hash = '';
                window.location.reload();
            }
        }, 1500);
    } else {
        console.log(response.message);
        alert(response.message);
        window.location.reload();
    }
}

function redirectCountdown(duration = 10) {
    const redirect = document.querySelector('#redirect_countdown');
    if (duration > 0) {
        setTimeout(function () {
            redirect.innerText = duration - 1;
            redirectCountdown(duration - 1)
        }, 1000);
    } else {
        if (state.redirectCountdownTimer) {
            clearTimeout(state.redirectCountdownTimer);
        }
    }
}

function successAnimation(duration = '10') {
    return `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <img style="display:block; width: 50%; border-radius: 10px;" src="https://i.pinimg.com/originals/e8/06/52/e80652af2c77e3a73858e16b2ffe5f9a.gif">
            <div>
                <h2 style="text-align: center;">Success!</h2>
            </div>
            <div>
                <p style="text-align: center;">Page redirect in <span id="redirect_countdown">${duration}</span> seconds...</p>
            </div>
        </div>
    `;
}