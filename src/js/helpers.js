import endpoints from './endpoints.js';
import { generateHeaders } from './checkToken.js';

export function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export async function verifyEmail(event) {
    this.classList.remove('is-invalid');
    this.classList.remove('is-valid');
    const email = event.target.value;
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
        if (response.resCode === 200) {
            this.classList.add('is-valid');
        } else {
            this.classList.add('is-invalid');
        }
    }
}

export async function verifyPhone(event) {
    this.classList.remove('is-invalid');
    this.classList.remove('is-valid');
    const phone = event.target.value;
    if (phone) {
        const headers = await generateHeaders();
        const response = await fetch(endpoints.verifyPhoneEndpoint, {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
                'client-token': headers['client-token'],
                'time-stamp': headers['time-stamp'],
                'time-signature': headers['time-signature']
            },
            body: JSON.stringify({
                phone
            })
        })
            .then(res => res.json())
            .then(data => data)
            .catch(err => err);
        if (response.resCode === 200) {
            this.classList.add('is-valid');
        } else {
            this.classList.add('is-invalid');
        }
    }
}