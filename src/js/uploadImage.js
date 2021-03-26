import { userToken, generateHeaders } from './checkToken.js';
import endpoints from './endpoints.js';

const uploadEndpoint = endpoints.uploadEndpoint;

const state = {
    files: [],
    compressedFiles: []
}

export function createImageUploader(shipmentId) {
    const footer = document.querySelector('footer')
    footer.remove();
    const container = document.querySelector('.container');
    const imageUploaderDiv = document.createElement('div');
    imageUploaderDiv.className = 'modal-dialog modal-dialog-scrollable update-pod';
    imageUploaderDiv.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalScrollableTitle">Tracking ID: ${shipmentId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div id="photo_upload">
                <div class="custom-file-container" data-upload-id="imageUploader">
                    <div class="image-upload-btns">
                        <label class="custom-file-container__custom-file card shadow bg-white roundedcard shadow bg-white rounded">
                            <div id="photo_btn">
                                <img src="https://img.icons8.com/plasticine/camera.png" alt="photo_button">
                                <p>Take a photo</p>
                            </div>
                            <input type="file" class="custom-file-container__custom-file__custom-file-input"
                                accept="image/jpeg, image/png, image/gif" multiple aria-label="Choose File" style="display:none" />
                            <input type="hidden" name="MAX_FILE_SIZE" value="10485760" style="display:none" />
                            <span class="custom-file-container__custom-file__custom-file-control" style="display:none"></span>
                        </label>
                        
                    </div>
                    <div class="custom-file-container__image-preview"></div>
                    <label><span>Remove All Photos</span>
                            <a href="javascript:void(0)" class="custom-file-container__image-clear"
                                title="Clear Image">&times;</a>
                        </label>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" data-action="upload-image">Upload</button>
        </div>
    </div>
    `;
    container.appendChild(imageUploaderDiv);


    let upload = new FileUploadWithPreview("imageUploader");

    const uploadBtn = container.querySelector('[data-action=upload-image]');
    uploadBtn.onclick = async function (event) {
        const files = upload.cachedFileArray;
        if (files.length) {
            files.forEach((file) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (event) {
                    const imgElement = document.createElement('img');
                    imgElement.src = event.target.result;
                    imgElement.onload = function (e) {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 400;

                        const scaleSize = MAX_WIDTH / e.target.width;
                        canvas.width = MAX_WIDTH;
                        canvas.height = e.target.height * scaleSize;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);
                        const srcEncoded = ctx.canvas.toDataURL(e.target, 'image/jpeg', 0.92);
                        state.compressedFiles.push(srcEncoded);
                        if (state.compressedFiles.length === files.length) {
                            uploadImages(state.compressedFiles, upload);
                        }
                    }
                }
            });
        }
    }

    async function uploadImages(images = [], fileInputs) {
        const token = userToken();
        const headers = await generateHeaders();
        if (token) {
            await fetch(uploadEndpoint, {
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
                    type: 'image',
                    PODImage: images,
                    fileName: `pod_${shipmentId}_${(new Date()).toISOString()}`
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.resCode === 200 && data.result.length) {
                        // need to inactivate buttons when the delivery status is delivered
                        const image = data.result.length > 1 ? 'images' : 'image'
                        const message = `upload ${data.result.length} ${image} for ${shipmentId} success!`;
                        console.log(message);
                        alert(message);
                        fileInputs.clearPreviewPanel();
                        removeImageUploader();
                    } else {
                        const message = `upload image for ${shipmentId} failed`;
                        console.log(message);
                        alert(message);
                    }
                }).catch(err => {
                    alert(err);
                });
        } else {
            alert('token is invalid!');
            userLogin();
        }
    }

    const closeBtnTop = container.querySelector('.modal-header button');
    closeBtnTop.onclick = removeImageUploader;
    const closeBtnBottom = container.querySelector('.modal-footer button');
    closeBtnBottom.onclick = removeImageUploader;

    function removeImageUploader() {
        imageUploaderDiv.remove();
        container.insertAdjacentElement('afterend', footer);
    }
}