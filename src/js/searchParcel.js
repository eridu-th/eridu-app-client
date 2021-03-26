import { handleSubmitEvent, handleInputEvent, searchParcelById } from './searchFunctions.js';
import { getParameterByName } from './helpers.js';

const state = {
    id: null,
    parcelId: null
}

export function searchFeatures() {

    const header = document.querySelector('header');
    header.style.display = `block`;
    header.innerHTML = `
        <div id="header">Search parcel</div>
    `;

    const searchInputByTrackingId = `
    <form action="" class="form-group">
        <input class="form-control" id="tracking_id" type="text" name="tracking_id" value=""
            placeholder="#EX1234567890123" autocomplete="off">
        <button type="submit"><i class="fa fa-search"></i></button>        
    </form>
    `;

    const searchInputByPhone = `
    <form action="">
        <input class="form-control" id="receiver_phone" type="tel" name="receiver_phone" value=""
            inputmode="numeric" placeholder="#0632166699" autocomplete="off" pattern="[0-9]{10}">
        <button type="submit"><i class="fa fa-search"></i></button>
    </form>
    `;

    let searchForm = searchInputByPhone;
    const location = window.location.hash.split('?')[0];
    state.id = getParameterByName('id');
    state.parcelId = getParameterByName('parcelId');
    let phoneBtnClass = 'primary';
    let trackIdbtnClass = 'dark';

    if (location.includes('trackingid')) {
        searchForm = searchInputByTrackingId;
        phoneBtnClass = 'dark';
        trackIdbtnClass = 'primary';
    } else {
        searchForm = searchInputByPhone;
    }

    const container = document.querySelector('.container');
    container.style.justifyContent = `space-between`;
    container.innerHTML = `
    <div id="search_parcel">
        <div id="search_functions">
            <div id="search_by_phone_btn" class="btn btn-${phoneBtnClass}">Receiver Phone</div>
            <div id="search_by_tracking_id_btn" class="btn btn-${trackIdbtnClass}">Tracking ID</div>
        </div>
        <div id="search_list">
            <div id="search_bar">
                ${searchForm}
            </div>            
        </div>
        <div id="search_filters">
        </div>
        <div id="result_list">
            <ul class="list-group list-group-flush">
                <li class="list-group-item">Please search parcel by <br> <b>Receiver Phone</b> or <br> <b>Tracking ID</b></li>
            </ul>
        </div>
    </div>
    `;

    handleSubmitEvent();
    handleInputEvent();

    if (state.id) {
        const searchBar = document.querySelector('#search_bar');
        searchBar.querySelector('input').value = state.id;
        searchParcelById(state.id);
    }

    const searchByPhoneBtn = document.querySelector('#search_by_phone_btn');
    const searchByTrackingIdBtn = document.querySelector('#search_by_tracking_id_btn');


    searchByPhoneBtn.addEventListener('click', addSearchInput);
    searchByTrackingIdBtn.addEventListener('click', addSearchInput);

    function addSearchInput(event) {
        event.stopPropagation();
        const buttons = [...this.parentNode.children];
        buttons.forEach(btn => {
            if (btn === this) {
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-dark');
            } else {
                btn.classList.add('btn-dark');
                btn.classList.remove('btn-primary');
            }
        });
        if (this.id === 'search_by_tracking_id_btn') {
            document.querySelector('#search_by_tracking_id_btn').classList.add('btn-primary');
            document.querySelector('#search_by_phone_btn').classList.add('btn-dark');
            window.location.hash = 'search/trackingid';
        } else if (this.id === 'search_by_phone_btn') {
            window.location.hash = 'search/phone';
        }
        document.querySelector('#result_list ul').innerHTML = `<li class="list-group-item">Please search parcel by <br> <b>Receiver Phone</b> or <br> <b>Tracking ID</b></li>`;
        handleSubmitEvent();
        handleInputEvent();
    }
}