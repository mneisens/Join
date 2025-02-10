/**
 * Asynchronously loads the privacy policy page content. This function handles the dynamic inclusion
 * of HTML components, hides navigation elements not relevant to the privacy policy, adjusts the page layout
 * based on the window size, and highlights the active link corresponding to the privacy policy in the navigation bar.
 */
async function loadPrivacyPolici() {
    await includeHTML();
    hideNavElements();
    addResizeToPage(window.location.href);
    activeLink(6, window.location.href);
}

