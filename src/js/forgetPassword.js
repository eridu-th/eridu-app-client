import endpoints from './endpoints.js';
import { generateHeaders } from './checkToken.js';

const state = {
    token: null,
    userEmail: null,
    emailVerified: false,
    resetForm: null,
}

export async function forgetPassword() {
    resetState(state);
    const container = document.querySelector('.container');
    container.innerHTML = `
    <div id="reset_password_form">
        <div id="eridu_logo">
        <img src="${endpoints.host}/images/eridu_logo.png" alt="eridu_logo">
        </div>
        <h1>Reset Password</h1>
        <hr>
        <div id="reset_password_input">
        </div>
        <hr>
        <div id="backToLogin">
            <a class="btn btn-secondary" href="#">Back to Login</a>
        </div>
    </div>
    `;
    const urlParams = new URLSearchParams(window.location.search);
    const jwt = urlParams.get('jwt');
    if (jwt) {
        const headers = await generateHeaders();
        const response = await fetch(endpoints.verifyResetTokenEndpoint, {
            method: 'post',
            headers: {
                'Authorization': jwt,
                'Content-type': 'application/json',
                'client-token': headers['client-token'],
                'time-stamp': headers['time-stamp'],
                'time-signature': headers['time-signature']
            },
        }).then(res => res.json()).then(data => data).catch(err => err);
        if (response.resCode === 200) {
            state.token = jwt
            return forgetPasswordForm(state);
        }
    }
    renderEmailInput();
}

function renderEmailInput() {
    const emailInput = document.querySelector('#reset_password_input');
    if (emailInput) {
        const resetForm = `
        <form action="" id="submit_email" class="form-group">
            <div class="input-group mb-3">
                <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                <input data-type="email" value="" type="email" inputmode="email" class="form-control"
                    aria-label="email" placeholder="Email" required>
                    <div class="valid-feedback">This email is valid!</div>
                <div class="invalid-feedback">Something went wrong...Please check the email again!</div>
            </div>
            <button class="btn btn-primary">Reset Password</button>
        </form>
        `;
        emailInput.innerHTML = resetForm;
        state.resetForm = resetForm;
        const form = emailInput.querySelector('#submit_email');
        const input = form.querySelector('input');
        input.onchange = verifyEmail(state);

        if (form) {
            form.onsubmit = sendToken(state);
        }
    }
}

function loaderTag() {
    return `
        <div id="reset_loader">
            <div class="spinner-border text-primary" style="width:3rem; height:3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h4>Loading...</h4>
        </div>
    `;
}

function forgetPasswordForm(state) {
    const emailInput = document.querySelector('#reset_password_input');
    emailInput.innerHTML = `
        <form action="" autocomplete="off" id="reset_password_form">
            <div class="mb-3">
                <label for="password" class="form-label">New Password</label>
                <input type="password" class="form-control" id="password" required>
                <div class="invalid-feedback">Your password do not match</div>
            </div>
            <div class="mb-3">
                <label for="password_repeat" class="form-label">Confirm password</label>
                <input type="password" class="form-control" id="password_repeat" required>
                <div class="invalid-feedback">Your password do not match</div>
            </div>
            <div>
                <button type="submit" class="btn btn-primary">Reset Password</button>
            </div>
        </form>
    `;
    const resetForm = document.querySelector('#reset_password_form');
    const submitBtn = resetForm.querySelector('button');
    const inputs = [...resetForm.querySelectorAll('input')];
    inputs.forEach(input => {
        input.oninput = function () {
            inputs.forEach(input => {
                input.classList.remove('is-invalid');
            });
        }
    });

    submitBtn.onclick = async function (event) {
        event.preventDefault();
        const values = inputs.map(input => {
            if (!input.value) return null;
            return input.value;
        });
        if (values[0] === values[1] && !!values[0]) {
            const response = await changePassword(values[0], values[1], state.token);
            if (response.resCode === 200) {
                alert(response.message);
                window.location.hash = '';
            } else {
                console.log(response.message);
                alert(response.message);
            }
        } else {
            inputs.forEach(input => {
                input.classList.add('is-invalid');
            });
        }
    }
}

async function changePassword(password = '', confirmPassword = '', token = '') {
    if (password && token) {
        const headers = await generateHeaders();
        const response = await fetch(endpoints.resetPasswordEndpoint, {
            method: 'post',
            mod: 'cors',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'client-token': headers['client-token'],
                'time-stamp': headers['time-stamp'],
                'time-signature': headers['time-signature'],
            },
            body: JSON.stringify({
                password,
                confirmPassword
            })
        }).then(res => res.json()).then(data => data).catch(err => err);
        return response;
    }
    return null;
}

function verifyEmail(state) {
    return async function (event) {
        this.classList.remove('is-invalid');
        this.classList.remove('is-valid');
        const email = event.target.value;
        const response = await checkEmail(email);
        if (response.resCode === 401) {
            this.classList.add('is-valid');
            state.emailVerified = true;
            state.userEmail = email;
        } else {
            this.classList.add('is-invalid');
        }
    }
}

async function checkEmail(email) {
    if (email) {
        const headers = await generateHeaders();
        const response = await fetch(endpoints.verifyEmailEndpoint, {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
                'client-token': headers['client-token'],
                'time-stamp': headers['time-stamp'],
                'time-signature': headers['time-signature']
            },
            body: JSON.stringify({
                email
            })
        })
            .then(res => res.json())
            .then(data => data)
            .catch(err => err);
        return response;
    } else {
        console.warn(`'email' isn't given to checkEmail!`);
    }
}

function sendToken(state) {
    return async function (event = null) {
        if (event) {
            event.preventDefault();
        }
        if (/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g.test(state.userEmail)) {
            const emailInput = document.querySelector('#reset_password_input');
            emailInput.innerHTML = loaderTag();
            const response = {
                resCode: 200,
                message: 'success'
            }
            if (response.resCode === 200) {
                console.log(response);
                emailInput.innerHTML = emailIsSent(state);
                const headers = await generateHeaders();
                const res = await fetch(endpoints.sendResetPasswordEndpoint, {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json',
                        'client-token': headers['client-token'],
                        'time-stamp': headers['time-stamp'],
                        'time-signature': headers['time-signature']
                    },
                    body: JSON.stringify({
                        email: state.userEmail,
                    }),
                }).then(res => res.json()).then(data => data).catch(err => err);
                console.log(res);
            } else {
                emailInput.innerHTML = state.resetForm;
                const form = emailInput.querySelector('#submit_email');
                const input = form.querySelector('input');
                input.value = state.userEmail;
                input.classList.remove('is-invalid');
                input.classList.remove('is-valid');
                form.onsubmit = sendToken;
                console.log(response.message);
                alert(response.message);
            }
        } else {
            const input = event.target.querySelector('input');
            if (input.value) {
                const response = await checkEmail(input.value);
                if (response.resCode === 401) {
                    state.userEmail = input.value;
                    sendToken(state)();
                }
            } else {
                input.classList.add('is-invalid');
            }
        }
    }
}

function emailIsSent(state = null) {
    if (state) {
        return `
        <p>The reset link has been sent to ${state.userEmail}. Please reset your password in 10 mins!</p>
        `;
    } else {
        console.warn(`'state' isn't given to emailIsSent!`);
    }
}

function resetState(state) {
    state.token = null;
    state.userEmail = null;
    state.emailVerified = false;
    state.resetForm = null;
}