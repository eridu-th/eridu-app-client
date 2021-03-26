export function aboutDriverApp() {
    const header = document.querySelector('header');
    header.style.display = `block`;
    header.innerHTML = `
        <div id="header">user profile</div>
    `;
    const setting = document.querySelector('#setting');
    setting.innerHTML = `
        <div>
        
        </div>
        <div>
            
        </div>
        <div>
            <a href="#setting" class="btn btn-primary">Back To Setting</a>
        </div>
    `;
}