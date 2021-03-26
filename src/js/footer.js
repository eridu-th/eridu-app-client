import { stopStream } from './qrScanner.js';

export function navigators(location = 'dashboard') {
    const container = document.querySelector('.container');
    const footer = document.querySelector('footer');
    container.innerHTML = ``;
    footer.innerHTML = `
        <div class="navigator">
            <div>
                <a href="#scanner" class="" id="navi_scanner">
                    <i class="fas fa-qrcode"></i>
                    <span>Scan</span>
                </a>
            </div>
            <div>
                <a href="#search" class="" id="navi_search">
                    <i class="fas fa-search"></i>
                    <span>Search</span>
                </a>
            </div>
            <div>
                <a href="#tasks" class="" id="navi_tasks">
                    <i class="fas fa-tasks"></i>
                    <span>Tasks</span>
                </a>
            </div>
            <div>
                <a href="#setting" class="" id="navi_setting">
                    <i class="fas fa-cog"></i>
                    <span>Setting</span>
                </a>
            </div>
        </div>
    `;
    activeFeature(location);
}

const setting = `
<div>
    <a href="#setting" class="" id="navi_setting">
        <i class="fas fa-cog"></i>
        <span>Setting</span>
    </a>
</div>
`;

const logout = `
<div>
    <a href="#" class="" id="navi_logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
    </a>
</div>
`;

function activeFeature(location) {
    const scanner = document.querySelector('#navi_scanner');
    const search = document.querySelector('#navi_search');
    const tasks = document.querySelector('#navi_tasks');
    const setting = document.querySelector('#navi_setting');
    [tasks, search, scanner, setting].forEach((item) => {
        item.classList.remove('selected');
    });

    switch (location) {
        case 'dashboard':
            setting.classList.add('selected');
            break;
        case 'search':
            search.classList.add('selected');
            break;
        case 'scanner':
            scanner.classList.add('selected');
            break;
        case 'tasks':
            tasks.classList.add('selected');
            break;
        case 'setting':
            setting.classList.add('selected');
            break;
        default:
            setting.classList.add('selected');
    }
}