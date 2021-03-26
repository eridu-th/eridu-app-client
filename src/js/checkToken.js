import endpoints from './endpoints.js';

export async function generateHeaders() {
    try {
        const response = await fetch(endpoints.headerEndpoint, {
            method: 'post',
            mod: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => data);
        return response;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export function userToken() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || null;
    return token;
}

export async function verifyToken(token = '') {
    let verification = false;
    if (token) {
        const headers = await generateHeaders();
        const response = await fetch(endpoints.checkTokenEndpoint, {
            method: 'post',
            headers: {
                'Authorization': token,
                'Content-type': 'application/json',
                'client-token': headers['client-token'],
                'time-stamp': headers['time-stamp'],
                'time-signature': headers['time-signature']
            },
        }).then(res => res.json()).then(data => data).catch(err => err);
        if (response.resCode === 200) {
            verification = true;
        }
    }
    return verification;
}

export async function loginProcess(email = '', password = '', rememberMe = false) {
    const headers = await generateHeaders();
    const response = await fetch(endpoints.loginEndpoint, {
        method: 'post',
        headers: {
            'Content-type': 'application/json',
            'client-token': headers['client-token'],
            'time-stamp': headers['time-stamp'],
            'time-signature': headers['time-signature']
        },
        body: JSON.stringify({
            email,
            password,
            keepAlive: (rememberMe ? 1 : 0)
        })
    })
        .then(res => res.json())
        .then(data => data)
        .catch(err => err);
    if (response.resCode === 200) {
        if (rememberMe) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', response.user);
        } else {
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('user', response.user);
        }
        window.location.hash = 'dashboard';
        return true;
    }
    console.log(response);
    return false;
}