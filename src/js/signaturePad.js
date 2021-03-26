import { userToken, generateHeaders } from './checkToken.js';
import { userLogin } from './userLogin.js';
import endpoints from './endpoints.js';
const uploadEndpoint = endpoints.uploadEndpoint;

export function createSignaturePad(shipmentId) {
    const footer = document.querySelector('footer')
    footer.remove();
    const container = document.querySelector('.container');
    const signatureDiv = document.createElement('div');
    signatureDiv.className = 'modal-dialog modal-dialog-scrollable update-pod';
    signatureDiv.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalScrollableTitle">Tracking ID: ${shipmentId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div id="signature_upload" class="signature-pad">
                <div class="signature-pad--body">
                    <canvas id="signature_canvas">This browser doesn't support canvas</canvas>
                </div>
                <div class="signature-pad--footer">
                    <div class="description">Sign above</div>
                    <div class="signature-pad--actions">
                        <div>
                            <button type="button" class="button clear" data-action="clear">Clear</button>
                            <button type="button" class="button" data-action="undo">Undo</button>
                        </div>
                        <div>
                            <button type="button" class="button save" data-action="save-png">Save
                                as
                                PNG</button>
                            <button type="button" class="button save" data-action="save-jpg">Save
                                as
                                JPG</button>                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" data-action="upload-signature">Upload</button>
        </div>
    </div>
    `;

    const svgBtn = `<button type="button" class="button save" data-action="save-svg">Save as SVG</button>`;

    container.appendChild(signatureDiv);

    const clearButton = signatureDiv.querySelector("[data-action=clear]");
    const undoButton = signatureDiv.querySelector("[data-action=undo]");
    const savePNGButton = signatureDiv.querySelector("[data-action=save-png]");
    const saveJPGButton = signatureDiv.querySelector("[data-action=save-jpg]");
    // const saveSVGButton = signatureDiv.querySelector("[data-action=save-svg]");
    const signatureCanvas = signatureDiv.querySelector("#signature_canvas");
    const signaturePad = new SignaturePad(signatureCanvas, {
        backgroundColor: 'rgb(255, 255, 255)'
    });
    function resizeCanvas() {
        // This part causes the canvas to be cleared
        signatureCanvas.width = signatureCanvas.offsetWidth;
        signatureCanvas.height = signatureCanvas.offsetHeight;
        // signatureCanvas.clientHeight = signatureCanvas.offsetHeight;
        // if (/iphone|ipad|mac|apple|os\sx/.test(deviceAgent().toLowerCase())) {}
        signatureCanvas.getContext("2d");
        signaturePad.clear();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function download(dataURL, filename) {
        const blob = dataURLToBlob(dataURL);
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.style = "display: none";
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
    }

    // One could simply use Canvas#toBlob method instead, but it's just to show
    // that it can be done using result of SignaturePad#toDataURL.
    function dataURLToBlob(dataURL) {
        // Code taken from https://github.com/ebidel/filer.js
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(":")[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }

    clearButton.addEventListener("click", function (event) {
        signaturePad.clear();
    });

    undoButton.addEventListener("click", function (event) {
        const data = signaturePad.toData();

        if (data) {
            data.pop(); // remove the last dot or line
            signaturePad.fromData(data);
        }
    });

    savePNGButton.addEventListener("click", function (event) {
        if (signaturePad.isEmpty()) {
            alert("Please provide a signature first.");
        } else {
            const dataURL = signaturePad.toDataURL();
            download(dataURL, "signature.png");
        }
    });

    saveJPGButton.addEventListener("click", function (event) {
        if (signaturePad.isEmpty()) {
            alert("Please provide a signature first.");
        } else {
            const dataURL = signaturePad.toDataURL("image/jpeg");
            download(dataURL, "signature.jpg");
        }
    });

    // saveSVGButton.addEventListener("click", function (event) {
    //     if (signaturePad.isEmpty()) {
    //         alert("Please provide a signature first.");
    //     } else {
    //         const dataURL = signaturePad.toDataURL('image/svg+xml');
    //         download(dataURL, "signature.svg");
    //     }
    // });

    const uploadBtn = container.querySelector('[data-action=upload-signature]');
    uploadBtn.onclick = async function (event) {
        const dataURL = signaturePad.toDataURL("image/jpeg");
        const token = userToken();
        if (token) {
            const headers = await generateHeaders();
            const response = await fetch(uploadEndpoint, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Token': `${token}`,
                    'Client-Token': headers['Client-Token'],
                    'Time-Stamp': headers['Time-Stamp'],
                    'Time-Signature': headers['Time-Signature']
                },
                body: JSON.stringify({
                    trackingID: shipmentId,
                    type: 'signature',
                    PODImage: [dataURL],
                    fileName: `signatuer_${shipmentId}`
                })
            }).then(res => res.json()).then(data => data).catch(err => alert(err));
            if (response.resCode === 200 && response.result.length) {
                // need to inactivate buttons when the delivery status is delivered
                const message = `upload signature for ${shipmentId} success!`;
                console.log(message);
                alert(message);
                removeSignaturePad();
            } else {
                const message = `Error! Upload signature for ${shipmentId} failed!`;
                console.log(message);
                alert(message);
            }
        } else {
            alert('token is invalid!');
            userLogin();
        }
    }

    const closeBtnTop = container.querySelector('.modal-header button');
    closeBtnTop.onclick = removeSignaturePad;
    const closeBtnBottom = container.querySelector('.modal-footer button');
    closeBtnBottom.onclick = removeSignaturePad;

    function removeSignaturePad() {
        signatureDiv.remove();
        container.insertAdjacentElement('afterend', footer);
    }

    function deviceAgent() {
        let re = /\((.*?)\)/g;
        let userAgent = navigator.userAgent.match(re)[0];
        userAgent = userAgent.slice(1, (userAgent.length - 1));
        return userAgent;
    }
}