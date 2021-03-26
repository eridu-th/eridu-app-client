// import { fetchHeader, changePassword, verifyOTP, requestOTP } from '../main.js';
import { generateHeaders, userToken } from "./checkToken.js";
import endpoints from './endpoints.js';

const defaultPendingTime = 60;
const state = {
    otp: '',
    ref: '',
    pending: defaultPendingTime,
    timeStamp: 0,
    countdownTimer: null,
    redirectCountdownTimer: null,
    step: 1
}

export function resetPasswordState() {
    state.otp = '';
    state.ref = '';
    state.pending = defaultPendingTime;
    state.timeStamp = 0;
    state.countdownTimer = null;
    state.redirectCountdownTimer = null;
    state.step = 1;
}

export function resetPassword() {
    const header = document.querySelector('header');
    header.style.display = `block`;
    header.innerHTML = `
    <div id="header">reset password</div>
    `;

    const setting = document.querySelector('#setting');
    setting.innerHTML = `
        <div>
            <div class="progress-container">
                <div class="progress" id="progress"></div>
                <div class="circle active">
                    1
                </div>
                <div class="circle">
                    2
                </div>
                <div class="circle">
                    3
                </div>
                <div class="circle">
                    4
                </div>
            </div>
            <h1>Request OTP</h1>
        </div>
        <div id="phone_otp_input_login">
            <button class="btn btn-warning">Request OTP <span></span></button>
        </div>
        <div>
            <a href="#setting" class="btn btn-primary">Back To Setting</a>
        </div>
        `;

    resetForm();
}

function resetForm() {
    udpateProgress(state.step);

    const otpInput = document.querySelector('#phone_otp_input_login');
    const requestBtn = otpInput.querySelector('button');

    if (otpInput && requestBtn) {
        requestBtn.onclick = sendOTP;
        async function sendOTP(event) {
            event.stopPropagation();
            otpInput.innerHTML = loaderTag();
            const headers = await generateHeaders();
            const token = userToken();
            const option = {
                method: 'post',
                mod: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Token': `${token}`,
                    'Client-Token': headers['Client-Token'],
                    'Time-Stamp': headers['Time-Stamp'],
                    'Time-Signature': headers['Time-Signature']
                }
            }
            const response = await fetch(endpoints.loginRequestOTPEndpoint, option)
                .then(res => res.json())
                .then(res => res)
                .catch(err => err);

            if (response.resCode === 200) {
                state.ref = response.otpRef;
                state.timeStamp = new Date().getTime();
                otpInput.innerHTML = otpForm();
                state.step += 1;
                udpateProgress(state.step);
                countdown();
                inputHandler();
            } else {
                console.log(response.message);
                alert(response.message);
                window.location.hash = 'setting';
            }
        }
    }
}

function udpateProgress(step = 1) {
    let header = '';
    switch (step) {
        case 1:
            header = 'request otp';
            break;
        case 2:
            header = 'verify otp';
            break;
        case 3:
            header = 'set new password';
            break;
        case 4:
            header = 'Success!';
            break;
        default:
            header = 'request otp';
    }
    const progress = document.querySelector('#progress');
    // const prev = document.querySelector('#otp_prev');
    // const next = document.querySelector('#otp_next');
    const circles = document.querySelectorAll('.circle');
    const title = document.querySelector('#setting h1');
    title.innerText = header;

    let currentActive = step;
    update();

    // next.addEventListener('click', () => {
    //     currentActive++

    //     if (currentActive > circles.length) {
    //         currentActive = circles.length;
    //     }

    //     update();
    // });

    // prev.addEventListener('click', () => {
    //     currentActive--

    //     // prevents currentActive from going below 1
    //     if (currentActive < 1) {
    //         currentActive = 1;
    //     }

    //     update();
    // });

    function update() {
        circles.forEach((circle, idx) => {
            if (idx < currentActive) {
                circle.classList.add('active')
            } else {
                circle.classList.remove('active')
            }
        });

        const actives = document.querySelectorAll('.active');

        progress.style.width = (actives.length - 1) / (circles.length - 1) * 100 + '%';

        // disables prev when you can't go back further, disables next when there are no more steps
        // if (currentActive === 1) {
        //     prev.disabled = true;
        // } else if (currentActive === circles.length) {
        //     next.disabled = true;
        // } else {
        //     prev.disabled = false;
        //     next.disabled = false;
        // }
    };
}

function countdown(duration = 60) {
    if (state.countdownTimer) {
        clearTimeout(state.countdownTimer);
    }
    const clock = document.querySelector('#countdown');
    if (clock) {
        const now = new Date().getTime();
        let second = state.pending;
        let diff = Math.floor((now - state.timeStamp) / 1000);
        if (diff >= 60) {
            second = 0;
        } else if (diff < 60 && second !== 60) {
            second = 60 - diff;
        }
        if (second > 0) {
            state.pending = second - 1;
            clock.innerText = state.pending;
            state.countdownTimer = setTimeout(function () {
                countdown(state.pending);
            }, 1000);
        } else {
            const requestOTP = document.querySelector('#insert_otp_login button');
            requestOTP.removeAttribute('disabled');
            clock.parentNode.innerHTML = ``;
            requestOTP.onclick = function (event) {
                event.preventDefault();
                state.pending = defaultPendingTime;
                requestOTP.setAttribute("disabled", true);
                document.querySelector('#insert_otp_login button span').innerHTML = `(<span id="countdown">${state.pending}</span> sec)`;
                countdown(state.pending);
            }
        }
    }
}

function inputHandler() {
    const otpInput = document.querySelector('#phone_otp_input_login');

    const inputs = document.querySelector('.digit-group').querySelectorAll('input');
    if (inputs.length) {
        inputs[0].focus();

        inputs.forEach((input) => {
            input.onchange = async function (e) {
                const parent = this.parentNode;
                const value = e.target.value;
                const errorMsg = document.querySelector('#invalid_otp_login');
                errorMsg.innerText = ``;
                if (value) {
                    const next = parent.querySelector(`input#${this.dataset.next}`);
                    if (next) {
                        next.focus();
                    }
                } else if (!value) {
                    const prev = parent.querySelector(`input#${this.dataset.previous}`);
                    if (prev) {
                        prev.focus();
                    }
                } else {
                    state.otp = '';
                    formTag.querySelectorAll('input').forEach(input => {
                        state.otp += input.value;
                    });
                    if (state.otp.length === 4) {
                        otpInput.innerHTML = loaderTag();
                        const headers = await generateHeaders();
                        const token = userToken();
                        const option = {
                            method: 'post',
                            mod: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Token': `${token}`,
                                'Client-Token': headers['Client-Token'],
                                'Time-Stamp': headers['Time-Stamp'],
                                'Time-Signature': headers['Time-Signature']
                            },
                            body: JSON.stringify({
                                otp: state.otp,
                                ref: state.ref
                            })
                        }
                        const response = await fetch(endpoints.loginVerifyOTPEndpoint, option)
                            .then(res => res.json())
                            .then(res => res)
                            .catch(err => err);

                        if (response.resCode === 200) {
                            state.step += 1;
                            udpateProgress(state.step);
                            resetPasswordForm();
                        } else {
                            otpInput.innerHTML = otpForm(state.pending);
                            const errorMsg = document.querySelector('#invalid_otp_login')
                            errorMsg.innerText = `Invalid OTP Code!`;
                            inputHandler();
                            countdown();
                        }
                    }
                }
            }

            input.onkeyup = async function (e) {
                const parent = this.parentNode;
                const formTag = parent.parentNode;
                const errorMsg = document.querySelector('#invalid_otp_login');
                errorMsg.innerText = ``;
                if (e.keyCode === 8 || e.keyCode === 37) {
                    const prev = parent.querySelector(`input#${this.dataset.previous}`);
                    if (prev) {
                        prev.focus();
                    }
                } else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 39) {
                    const next = parent.querySelector(`input#${this.dataset.next}`);
                    if (next) {
                        next.focus();
                    } else {
                        state.otp = '';
                        formTag.querySelectorAll('input').forEach(input => {
                            state.otp += input.value;
                        });
                        if (state.otp.length === 4) {
                            otpInput.innerHTML = loaderTag();
                            const headers = await generateHeaders();
                            const token = userToken();
                            const option = {
                                method: 'post',
                                mod: 'cors',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'User-Token': `${token}`,
                                    'Client-Token': headers['Client-Token'],
                                    'Time-Stamp': headers['Time-Stamp'],
                                    'Time-Signature': headers['Time-Signature']
                                },
                                body: JSON.stringify({
                                    otp: state.otp,
                                    ref: state.ref
                                })
                            }
                            const response = await fetch(endpoints.loginVerifyOTPEndpoint, option)
                                .then(res => res.json())
                                .then(res => res)
                                .catch(err => err);

                            if (response.resCode === 200) {
                                state.step += 1;
                                udpateProgress(state.step);
                                resetPasswordForm();
                            } else {
                                otpInput.innerHTML = otpForm(state.pending);
                                const errorMsg = document.querySelector('#invalid_otp_login')
                                errorMsg.innerText = `Invalid OTP Code!`;
                                inputHandler();
                                countdown();
                            }
                        }
                    }
                }
            }
        });
    }
}

function resetPasswordForm() {
    const otpInput = document.querySelector('#phone_otp_input_login');
    otpInput.innerHTML = `
        <form action="" autocomplete="off" id="reset_password_form_login">
            <div class="mb-3">
                <label for="password" class="form-label">New Password</label>
                <input type="password" class="form-control" id="password_login" required>
                <div class="invalid-feedback">Your password do not match</div>
            </div>
            <div class="mb-3">
                <label for="password_repeat" class="form-label">Confirm password</label>
                <input type="password" class="form-control" id="password_repeat_login" required>
                <div class="invalid-feedback">Your password do not match</div>
            </div>
            <div style="display:flex; justify-content: center; align-items: center;">
                <button type="submit" class="btn btn-warning">Reset Password</button>
            </div>
        </form>
    `;
    const resetForm = document.querySelector('#reset_password_form_login');
    const submitBtn = resetForm.querySelector('button');
    const inputs = [...resetForm.querySelectorAll('input')];
    inputs[0].focus();
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
            const headers = await generateHeaders();
            const token = userToken();
            const option = {
                method: 'post',
                mod: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Token': `${token}`,
                    'Client-Token': headers['Client-Token'],
                    'Time-Stamp': headers['Time-Stamp'],
                    'Time-Signature': headers['Time-Signature']
                },
                body: JSON.stringify({
                    otp: state.otp,
                    ref: state.ref,
                    password: values[0],
                    confirmPassword: values[1]
                })
            }

            const response = await fetch(endpoints.loginVerifyOTPEndpoint, option)
                .then(res => res.json())
                .then(res => res)
                .catch(err => err);

            if (response.resCode === 200) {
                state.step += 1;
                udpateProgress(state.step);
                console.log(response.message);
                let duration = 3;
                otpInput.innerHTML = successAnimation(duration);
                redirectCountdown(duration);
                setTimeout(function () {
                    state.step = 1;
                    window.location.hash = 'setting';
                }, (duration * 1000));
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

function loaderTag() {
    return `
        <div id="otp_loader_login">
            <div class="spinner-border text-warning" style="width:3rem; height:3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h4>Loading...</h4>
        </div>
    `;
}

function phoneForm() {
    return `
    <form action="" method="post" id="submit_phone_login">
        <label for="driver_phone_login" class="form-label">Please enter your phone</label>
        <div>
            <input class="form-control" id="driver_phone_login" type="tel" name="receiver_phone" value=""
                inputmode="numeric" placeholder="#0632166699" autocomplete="off" pattern="[0-9]{10}">
            <button type="submit"><i class="fa fa-search"></i></button>
            <div id="error_hint_login" class="invalid-feedback">Phone number starts with 0 and has 10 digits!</div>
        </div>
    </form>
    `;
}

function otpForm(pendingTime = 60) {
    return `
    <form class="digit-group" data-group-name="digits" autocomplete="off" id="insert_otp_login">
        <div>
            <h3>Enter OTP Code</h3>
        </div>
        <div>
            <input autocomplete=off type="text" inputmode="numeric" id="digit-1" name="digit-1" data-next="digit-2" maxlength="1" />
            <input autocomplete=off type="text" inputmode="numeric" id="digit-2" name="digit-2" data-next="digit-3" data-previous="digit-1"
                maxlength="1" />
            <input autocomplete=off type="text" inputmode="numeric" id="digit-3" name="digit-3" data-next="digit-4" data-previous="digit-2"
                maxlength="1" />
            <input autocomplete=off type="text" inputmode="numeric" id="digit-4" name="digit-4" data-previous="digit-3" maxlength="1" />
        </div>
        <div id="invalid_otp_login"></div>
        <div>
            <button class="btn btn-warning" type="submit" disabled>Request OTP <span>(<span id="countdown">${pendingTime}</span> sec)</span></button>
        </div>
    </form>
    `;
}