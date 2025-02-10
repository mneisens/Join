/**
 * Asynchronously loads the legal notice page. This function is responsible for including HTML content dynamically,
 * hiding navigation elements that are not required for the legal notice page, adapting the page layout in response to
 * window resizing, and activating the appropriate navigation link.
 */
async function loadLegalNotice() {
    await includeHTML();
    hideNavElements();
    addResizeToPage(window.location.href);
    activeLink(5, window.location.href);
}
