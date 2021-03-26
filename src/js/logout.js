const logout = `
<div>
    <a href="#" class="" id="navi_logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
    </a>
</div>
`;

export function userLogout(node) {
    const footer = document.querySelector('footer');
    const container = document.querySelector('.container');
    node.onclick = function (event) {
        event.stopPropagation();
        sessionStorage.clear();
        localStorage.clear();
        footer.innerHTML = ``;
        container.style.justifyContent = `center`;
        window.location.hash = ``;
    }
}

export function user_logout_legacy() {
    const logoutBtn = document.querySelector('#navi_logout');
    const body = document.querySelector('body');
    const footer = document.querySelector('footer');
    logoutBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        sessionStorage.clear();
        localStorage.clear();
        footer.innerHTML = ``;
        body.style.backgroundColor = `rgba(0, 0, 0, 0.1)`;
        const container = document.querySelector('.container');
        container.style.justifyContent = `center`;
        window.location.hash = ``;
    })
}