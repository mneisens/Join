/**
 * Asynchronously includes HTML templates into the page.
 * Searches for elements with the 'html-template' attribute and replaces their inner HTML with the content of the file specified in the attribute.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[html-template]');
    for (let i = 0; i < includeElements.length; i++) {
        let element = includeElements[i];
        let file = element.getAttribute("html-template");
        try {
            let resp = await fetch(file);
            if (resp.ok) {
                element.innerHTML = await resp.text();
            } else {
                element.innerHTML = 'Page not found';
            }
        } catch (error) {
            console.error("Fehler beim Laden des Templates:", error);
            element.innerHTML = 'Error loading template';
        }
    }
}



window.userInfo = window.userInfo || JSON.parse(sessionStorage.getItem("user-info") || '{"name":"Demo User"}');

let userCreds = JSON.parse(sessionStorage.getItem('user-creds'));

/**
 * Logs out the user by removing user-related data from session storage and redirecting to the login page.
 */
function logOut() {
    sessionStorage.removeItem("user-creds");
    sessionStorage.removeItem("user-info");
    sessionStorage.removeItem("start-Animation");
    window.location.href = 'log_in.html';
}

/**
 * Creates initials from the user's full name stored in session storage.
 * Displays the initials on the page and returns them.
 * 
 * @returns {string} The initials created from the user's name.
 */
function createUserInitials() {
    try {
        // Implementierung für Benutzer-Initialen

        // Hier könnte der Code stehen, um Initialen aus dem Benutzernamen zu erstellen
    } catch (error) {

    }
}

/**
 * Creates initials from the user's full name input field.
 * Displays the initials on the page and returns them.
 * 
 * @returns {string} The initials created from the user's name input field.
 */
function createMyContactInitials() {
    let userFullName = getNameFromInput();
    let names = userFullName.split(' ');
    let firstNameInitial = names[0].substring(0, 1).toUpperCase();
    let secondNameInitail = '';

    if (names.length > 1) {
        secondNameInitail = names[names.length - 1].substring(0, 1).toUpperCase();
    }

    let contactInitials = firstNameInitial + secondNameInitail;
    showUserInitials(firstNameInitial, secondNameInitail);
    showMyContactInitials(firstNameInitial, secondNameInitail);
    return contactInitials;
}

/**
 * Displays the user's initials in designated elements on the page.
 * 
 * @param {string} firstNameInitial - The initial of the user's first name.
 * @param {string} secondNameInitail - The initial of the user's last name.
 */
function showUserInitials(firstNameInitial, secondNameInitail) {
    document.getElementById('firstInitial').innerHTML = firstNameInitial;
    document.getElementById('secondInitial').innerHTML = secondNameInitail;
}

/**
 * Displays the user's contact initials in designated elements on the page.
 * 
 * @param {string} firstNameInitial - The initial of the user's first name.
 * @param {string} secondNameInitail - The initial of the user's last name.
 */
function showMyContactInitials(firstNameInitial, secondNameInitail) {
    document.getElementById('first').innerHTML = firstNameInitial;
    document.getElementById('second').innerHTML = secondNameInitail;
}

/**
 * Toggles the visibility of a popup menu with a transition effect.
 */
function showPopUpMenu() {
    let popUpMenuContainer = document.getElementById('popUpMenuContainer');
    if (!popUpMenuContainer.classList.contains('popUpTransition')) {
        popUpMenuContainer.classList.add('popUpTransition');

    } else {
        popUpMenuContainer.classList.remove('popUpTransition');
    }
}

/**
 * Hides the popup menu by removing the transition class.
 */
function hidePopUpMenu() {
    popUpMenuContainer.classList.remove('popUpTransition');
}

/**
 * Stops the propagation of an event.
 * 
 * @param {Event} event - The event to stop propagation for.
 */
function stopPropagation(event) {
    event.stopPropagation();
}

let activePage = window.location.href;

/**
 * Activates a navigation link if the current page URL matches the specified URL.
 * 
 * @param {number} btn - The button number to activate.
 * @param {string} pageURL - The URL of the page to match against.
 */
function activeLink(index, path) {
    try {
        let links = document.querySelectorAll('.nav-list li');
        if (links && links.length > 0) {
            for (let i = 0; i < links.length; i++) {
                links[i].classList.remove('active-link');
            }
            if (path) {
                for (let i = 0; i < links.length; i++) {
                    let linkHref = links[i].querySelector('a')?.getAttribute('href');
                    if (linkHref && path.includes(linkHref)) {
                        links[i].classList.add('active-link');
                        return;
                    }
                }
            }
            if (index >= 0 && index < links.length) {
                links[index].classList.add('active-link');
            }
        }
    } catch (error) {
        console.error("Fehler beim Setzen des aktiven Links:", error);
    }
}

/**
 * Hides navigation elements if the user is not logged in.
 * Also handles screen resize events to adjust element visibility.
 */
function hideNavElements() {
    let backBtn = document.getElementById('backBtn');
    let navTemplate = document.getElementById('navTemplate');
    let headerHeadline = document.getElementById('headerHeadline');
    let headerMenuContainer = document.getElementById('headerMenuContainer');
    if (!sessionStorage.getItem("user-creds")) {
        backBtn.style.display = 'none';
        navTemplate.style.display = 'none';
        headerHeadline.style.display = 'none';
        headerMenuContainer.style.display = 'none';
        handleScreenResize();
    } else {
        createUserInitials();
    }
}

/**
 * Handles screen resize events to adjust the visibility of the navigation template and content container height.
 */
function handleScreenResize() {
    let menuNavTemplate = document.getElementById('menuNavTemplate');
    let contentContainer = document.getElementById('contentContainer');
    if (menuNavTemplate) {
        if (window.innerWidth <= 1200) {
            menuNavTemplate.classList.add('d-none');
            contentContainer.style.height = 'calc(100% - 120px)';
        } else {
            menuNavTemplate.classList.remove('d-none');
        }
    } else {
        console.error("Element mit der ID 'menuNavTemplate' wurde nicht gefunden.");
    }
}

/**
 * Adds a resize event listener to the window if the current page URL matches the specified URL.
 * 
 * @param {string} pageURL - The URL of the page to match against.
 */
function addResizeToPage(pageURL) {
    if (activePage === pageURL) {
        window.addEventListener('resize', hideNavElements);
    }
}

/**
 * Handles the logout process by determining if the user is a guest or a registered user and performing the appropriate logout actions.
 */
function handelLogOut() {
    let signOutBtn = document.getElementById('signOutBtn');
    if (userInfo.name === 'Guest') {
        startDeleteCurrentGuest();
    } else {
        logOut();
    }
}


if (typeof loadContact === 'undefined') {
    window.loadContact = async function() {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (typeof window.__originalLoadContact === 'function') {
            return window.__originalLoadContact();
        } else {
            console.error("Die eigentliche loadContact-Funktion wurde nicht gefunden!");
            await includeHTML();
            activeLink(4, window.location.href);
        }
    };


}



  async function doLogoutFetch() {
    try {
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: { 'Authorization': 'Token ' + localStorage.getItem('authToken') }
      });
    } catch (e) {
      console.warn('Logout-Request fehlgeschlagen:', e);
    } finally {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('user-creds');
      sessionStorage.removeItem('user-info');
      window.location.href = 'log_in.html';
    }
  }
  
  function handelLogOut() {
    doLogoutFetch();
  }

  function createUserInitials() {
    try {
        let user = JSON.parse(sessionStorage.getItem("user-info"));
        console.log(user);
        
        if (!user || !user.name) return 
           

        let fullName = user.name.trim(); 
        let firstInitial = fullName.charAt(0).toUpperCase();
      
        console.log(firstInitial);
        
        document.getElementById('firstInitial').innerHTML = firstInitial;
        
        return firstInitial;
    } catch (error) {
        console.error("Fehler beim Erstellen der Initialen:", error);
    }
}
window.addEventListener('load', async () => {
    await includeHTML();       
    createUserInitials();       
});