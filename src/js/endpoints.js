const host = 'https://eridu-app.herokuapp.com'//window.location.hostname === '127.0.0.1' || 'localhost' ? 'http://localhost:8080' : '';
const endpoints = {
    host,
    headerEndpoint: `${host}/header`,
    checkTokenEndpoint: `${host}/checkToken`,
    loginEndpoint: `${host}/users/login`,
    signupEndpoint: `${host}/users`,
    verifyEmailEndpoint: `${host}/users/exist/email`,
    verifyPhoneEndpoint: `${host}/users/exist/phone`,
    sendResetPasswordEndpoint: `${host}/resetToken`,
    verifyResetTokenEndpoint: `${host}/resetToken/verify`,
    resetPasswordEndpoint: `${host}/resetToken/resetpassword`,
}

export default endpoints;