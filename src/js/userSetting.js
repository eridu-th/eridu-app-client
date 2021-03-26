import { userLogout } from './logout.js';

export function userSetting() {
    const header = document.querySelector('header');
    header.style.display = `block`;
    header.innerHTML = `
        <div id="header">SETTINGS</div>
    `;
    const container = document.querySelector('.container');
    container.style.justifyContent = `space-between`;
    container.innerHTML = `
        <div id="setting">
            <div id="search_setting">
                <form action="">
                    <input id="search_input" type="text" name="search_input" value="" placeholder="Search Setting...">
                    <button type="submit"><i class="fa fa-search"></i></button>
                </form>
            </div>
            <div id="setting_list">
                <h3>Account Setting</h3>                        
                <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <a href="#setting/userprofile">
                        <div>
                            <i class="fas fa-user"></i>
                        </div>
                        <div>User Profile</div>
                        <div>
                            <i class="fas fa-greater-than"></i>
                        </div>
                    </a>
                </li>
                <li class="list-group-item">
                    <a href="#setting/resetpassword">
                        <div>
                            <i class="fas fa-lock"></i>
                        </div>
                        <div>Reset Password</div>
                        <div>
                            <i class="fas fa-greater-than"></i>
                        </div>
                    </a>
                </li>
                <li class="list-group-item">
                    <a href="#setting/about">
                        <div>
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <div>About</div>
                        <div>
                            <i class="fas fa-greater-than"></i>
                        </div>
                    </a>
                </li>
                </ul>
            </div>
            <div>
                <div id="logout_btn" class="btn btn-secondary">
                    <div><i class="fas fa-sign-out-alt"></i></div>
                    <div>Logout</div>
                </div>
            </div>
        </div>
    `;

    const logoutBtn = document.querySelector('#logout_btn');
    userLogout(logoutBtn);
}