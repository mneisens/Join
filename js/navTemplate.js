let userCreds = JSON.parse(sessionStorage.getItem('user-creds'));
let userInfo = JSON.parse(sessionStorage.getItem('user-info'));

/**
 * Checks for the presence of user credentials in sessionStorage. If the credentials are not found,
 * it redirects the user to the login page. This function is typically used to ensure that a user is authenticated
 * before allowing access to certain pages that require a login.
 */
let checkCred = () => {
    if (!sessionStorage.getItem("user-creds")) {
        window.location.href = 'log_in.html';
    }
}

window.addEventListener("load", checkCred);



 