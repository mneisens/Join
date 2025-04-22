/**
 * Asynchronously loads the help screen of the application. This function is responsible for including HTML content dynamically
 * and initializing user-specific display elements, such as creating user initials. It ensures that the help screen is populated
 * with relevant content and personalized user details upon loading.
 */
async function loadHelpScreen() {
    await includeHTML();
    createUserInitials();
}





