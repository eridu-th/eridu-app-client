import endpoints from './endpoints.js';
import { generateHeaders } from './checkToken.js';
import { getParameterByName } from './helpers.js';

export async function actionsToQR(res = '') {
    // let res = document.querySelector('#outputData').innerText.trim().toLowerCase();
    const parcelId = getParameterByName('id');

    const trackingIdRegex = /.?(([Ee][Xx]|[Ss][Tt]|[Pp]{2})\d{13}).?/g.exec(res);
    const outputData = document.querySelector('#output_data');
    const parcelStatus = document.querySelector('#parcel_status');
    parcelStatus.innerHTML = ``;
    const actionToResult = document.querySelector('#actionToResult');
    if (trackingIdRegex) {
        const trackingId = trackingIdRegex[1].toUpperCase()
        if (res.includes('http')) {
            outputData.innerHTML = `
            Parcel ID: <a href=${res}>${trackingId}</a>
            `;
        } else {
            outputData.innerText = trackingId;
        }
        actionToResult.style.display = `block`;
        const link = actionToResult.querySelector('a');
        if (trackingId.includes('ST')) {
            link.setAttribute('href', `#search?id=${trackingId}`);
            link.innerText = `Update Delivery Status`;
        } else if (trackingId.includes('PP')) {
            const checkRegistration = await checkPreprintId(trackingId);
            if (checkRegistration.resCode === 200 && checkRegistration.registered) {
                const { status } = await checkParcelStatus(checkRegistration.trackingID);
                actionsToDeliveryStatus(status.toLowerCase(), checkRegistration.trackingID, parcelStatus, link);
            } else if (checkRegistration.resCode === 200) {
                const param = parcelId ? `&parcelId=${parcelId}` : ``;
                link.setAttribute('href', `#register?id=${trackingId}${param}`);
                link.innerText = `Register Parcel`;
                if (param && param.includes('EX')) {
                    window.location.hash = `register?id=${trackingId}${param}`;
                }
            } else {
                console.log(checkRegistration.message);
                alert(checkRegistration.message);
                outputData.innerText = `Invalid Tracking ID ${trackingId}`;
            }
        } else if (trackingId.includes('EX')) {
            const { status } = await checkParcelStatus(trackingId);
            actionsToDeliveryStatus(status.toLowerCase(), trackingId, parcelStatus, link);
        }
    } else {
        if (res.includes('http') || res.includes('www')) {
            outputData.innerHTML = `
           <a href=${res}>${res}</a>
        `;
        } else {
            outputData.innerText = res;
        }
    }
}

function actionsToDeliveryStatus(status = '', trackingId = '', statusTag = null, btn = null) {
    if (status && trackingId && btn && statusTag) {
        statusTag.innerText = `Status: ${status}`;
        if (status === 'pending') {
            btn.setAttribute('href', `#search/trackingid?id=${trackingId}`);
            btn.innerText = `Update Delivery Status`;
        } else if (status === 'delivered') {
            btn.setAttribute('href', `${endpoints.appEndpoint}/tracking?t=${trackingId}`);
            btn.innerText = `Check Parcel POD`;
        } else {
            btn.setAttribute('href', `#search/trackingid?id=${trackingId}`);
            btn.innerText = `Search Parcel`;
        }
    } else {
        return null;
    }
}

export async function checkParcelStatus(rawTrackingId = '') {
    const trackingId = /.?(([Ee][Xx]|[Ss][Tt]|[Pp]{2})\d{13}).?/g.exec(rawTrackingId)[1].toUpperCase();
    if (trackingId) {
        const headers = await generateHeaders();
        const response = await fetch(endpoints.searchParcelById, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'User-Token': `${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
                'Client-Token': headers['Client-Token'],
                'Time-Stamp': headers['Time-Stamp'],
                'Time-Signature': headers['Time-Signature']
            },
            body: JSON.stringify({
                trackingId
            })
        }).then(res => res.json()).then(data => data).catch(err => err);
        return {
            trackingId: response[0].shipmentID,
            status: response[0].status
        };
    }
    return null;
}

export async function checkPreprintId(id = '') {//'PP2103161318148'
    if (id) {
        const UAT = localStorage.getItem('token');
        const headers = await generateHeaders();
        const response = await fetch(endpoints.checkPreprintIdEndpoint, {
            method: 'post',
            mod: 'cors',
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json',
                'User-Token': `${UAT}`,
                'Client-Token': headers['Client-Token'],
                'Time-Stamp': headers['Time-Stamp'],
                'Time-Signature': headers['Time-Signature']
            },
            body: JSON.stringify({
                qr: id
            })
        })
            .then(res => res.json())
            .then(data => data)
            .catch(err => err);
        console.log(response);
        return response;
    }
    return null;
}

export async function registerPreprintId(preprintId = '', trackingId = '') { //'EX2103091044393'
    const UAT = localStorage.getItem('token');
    const headers = await generateHeaders();
    const check = await checkPreprintId(preprintId);
    if (check.resCode === 200 && !check.registered) {
        const response = await fetch(endpoints.registerPreprintIdEndpoint, {
            method: 'post',
            mod: 'cors',
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json',
                'User-Token': `${UAT}`,
                'Client-Token': headers['Client-Token'],
                'Time-Stamp': headers['Time-Stamp'],
                'Time-Signature': headers['Time-Signature']
            },
            body: JSON.stringify({
                qr: preprintId,
                trackingID: trackingId
            })
        })
            .then(res => res.json())
            .then(data => data)
            .catch(err => err);
        console.log(response);
        return response;
    }
    return null;
}

export async function preprintIdCreator() {
    const UAT = localStorage.getItem('token');
    const headers = await generateHeaders();
    const response = await fetch('https://api.airportels.ninja/api/msc/qr/preprint/generate', {
        method: 'post',
        mod: 'cors',
        responseType: 'json',
        headers: {
            'Content-Type': 'application/json',
            'User-Token': `${UAT}`,
            'Client-Token': headers['Client-Token'],
            'Time-Stamp': headers['Time-Stamp'],
            'Time-Signature': headers['Time-Signature']
        }
    })
        .then(res => res.json())
        .then(data => data)
        .catch(err => err);
    console.log(response);
}