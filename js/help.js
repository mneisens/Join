/**
 * Asynchronously loads the help screen of the application. This function is responsible for including HTML content dynamically
 * and initializing user-specific display elements, such as creating user initials. It ensures that the help screen is populated
 * with relevant content and personalized user details upon loading.
 */
async function loadHelpScreen() {
    await includeHTML();
    createUserInitials();
}

/**
 * Checks if user credentials are stored in sessionStorage. If no credentials are found,
 * the function redirects the user to the login page. This ensures that only authenticated
 * users can access certain parts of the application that require a login.
 */
// let checkCred = () => {
//     if (!sessionStorage.getItem("user-creds")) {
//         window.location.href = 'log_in.html';
//     }
// }

// window.addEventListener("load", checkCred);




