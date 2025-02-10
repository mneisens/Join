async function loadContact() {
    await includeHTML();
    showContacts();
    getMyContacts();
    createUserInitials();
    renderbtnCreate();
    activeLink(4, window.location.href);
    handelContactScreenResult();
}

let checkCred = () => {
    if (!sessionStorage.getItem("user-creds")) {
        window.location.href = 'log_in.html';
    }
}

window.addEventListener("load", checkCred);
window.addEventListener('resize', handelContactScreenResult);

let inputName = document.getElementById('inputName');
let inputEmail = document.getElementById('inputEmail');
let inputPhone = document.getElementById('inputPhone');


/**
 * Open the the Widnow for create a new contact
 */
function openAddContacts() {
    document.getElementById('newContactContainer').classList.remove('d-none');
    document.getElementById('newContact').classList.remove('slideOutBottom');
    document.getElementById('newContact').classList.add('slideInBottom');
    renderAddContactIcon();
}

/**
 * Close the window for create a new contact
 */
function hideAddContact() {
    document.getElementById('newContact').classList.remove('slideInBottom');
    document.getElementById('newContact').classList.add('slideOutBottom');
    resetForm();
    const delayContactDisplayNone = setTimeout(contactDisplayNone, 180);
}


/**
 * Show the field contact create succesfull for create a new contact
 */
function slideInContactSuccesfullyBox() {
    let contactSuccesfullyBox = document.getElementById('contactSuccesfullyBox');
    contactSuccesfullyBox.classList.remove('d-none');
    contactSuccesfullyBox.classList.remove('slideOutBottom');
    contactSuccesfullyBox.classList.add('slideInRight');
    const delaysuccesfullyBoxDisplayNone = setTimeout(succesfullyBoxSlideOut, 2000)
}

/**
 * close the container for create a new contact
 */
function contactDisplayNone() {
    document.getElementById('newContactContainer').classList.add('d-none');
}

/**
 * Close the field contact create succesfull for create a new contact
 */
function succesfullyBoxSlideOut() {
    let contactSuccesfullyBox = document.getElementById('contactSuccesfullyBox');
    contactSuccesfullyBox.classList.remove('slideInRight');
    contactSuccesfullyBox.classList.add('slideOutBottom');
}

/**
 * If a new contact created, it will scroll to the new contact
 */
function scrollToNewContact(id) {
    let newContact = document.getElementById(`${id}`);
    if (newContact) {
        newContact.scrollIntoView({ behavior: 'smooth' });
        presentNewContact(newContact);
        setTimeout(() => {
            endPresentNewContact(newContact);
        }, 2000)
    }
}

/**
 * The Background Color from the new Contact are change to another color
 */
function presentNewContact(newContact) {
    newContact.classList.add('changeBgColor');
}

function endPresentNewContact(newContact) {
    newContact.classList.remove('changeBgColor');
}

/**
 * The button create new contact get rendered
 */
function renderbtnCreate() {
    let btnCreate = document.getElementById('btnCreate');
    if (inputName.value <= 0 || inputEmail.value <= 0 || inputPhone.value <= 0) {
        btnCreate.disabled = true;
        btnCreate.classList.add('btn_disabled');
    } else {
        btnCreate.disabled = false;
        btnCreate.classList.remove('btn_disabled')
    }
}

/**
 * clear the form from Contact Menu
 */
function resetForm() {
    inputName.value = '';
    inputEmail.value = '';
    inputPhone.value = '';
    document.getElementById('contactFirstInitials').innerHTML = '';
    document.getElementById('contactSecondInitials').innerHTML = '';
    contactLogo.style.backgroundColor = 'var(--icon-color)';
}

/**
 * Retrieves the name from the input field.
 * @returns {string} The value of the name input field.
 */
function getNameFromInput() {
    return inputName.value;
}

/**
 * Retrieves the email from the input field.
 * @returns {string} The value of the email input field.
 */
function getEmailFromInput() {
    return inputEmail.value;
}

/**
 * Retrieves the phone number from the input field.
 * @returns {string} The value of the phone input field.
 */
function getPhoneFromInput() {
    return inputPhone.value;
}

/**
 * Fetches the background color of the 'contactLogo' element.
 * @returns {string} The background color style property of the 'contactLogo' element.
 */
function getColorFromInput() {
    let contactLogo = document.getElementById('contactLogo');
    return contactLogo.style.backgroundColor;
}

/**
 * Computes and displays the initials of the user based on the full name input.
 * The initials consist of the first letter of the first name and the first letter of the last name.
 * @returns {string} The concatenated initials of the user.
 */
function renderContactInitials() {
    let userFullName = inputName.value;
    let names = userFullName.split(' ');
    let firstContactInitial = names[0].substring(0, 1).toUpperCase();
    let secondContactInitail = '';
    if (names.length > 1) {
        secondContactInitail = names[names.length - 1].substring(0, 1).toUpperCase();
    }
    let contactInitials = firstContactInitial + secondContactInitail;
    showContactInitials(firstContactInitial, secondContactInitail);
    return contactInitials;
}

/**
 * Updates the HTML content of specified elements with edited contact initials.
 * @param {string} firstContactInitial - The initial of the first name from the edit form.
 * @param {string} secondContactInitial - The initial of the last name from the edit form.
 */
function showContactInitials(firstContactInitial, secondContactInitail) {
    document.getElementById('contactFirstInitials').innerHTML = firstContactInitial;
    document.getElementById('contactSecondInitials').innerHTML = secondContactInitail;
}

/**
 * The color for the random generate initialien background
 */
const contactsBgColors = [
    "#FF7A00", "#FF5EB3", "#9327FF",
    "#00BEE8", "#1FD7C1", "#FF745E",
    "#FFA35E", "#FC71FF", "#FFC701",
    "#0038FF", "#C3FF2B", "#FFE62B",
    "#FF4646", "#FFBB2B", "#39A0ED",
    "#FFDA77", "#B7DABB", "#FF9A9A",
    "#C285E8", "#7AE8A6", "#FF72C0",
    "#58D68D", "#FFC300", "#AED6F1",
    "#F8C471", "#D2B4DE", "#F1948A",
    "#5DADE2", "#76D7C4", "#F4D03F"
];


/**
 * generate random color for the backgorund of the initials
 */
function getRandomColor() {
    return contactsBgColors[Math.floor(Math.random() * contactsBgColors.length)];
}

/**
 * Render the contact Icon
 */
function renderAddContactIcon() {
    let currentColor = getRandomColor();
    let contactLogo = document.getElementById('contactLogo');
    if (inputName.value.length <= 0) {
        contactLogo.style.backgroundColor = 'var(--icon-color)';
        contactLogo.style.backgroundImage = 'url("/assets/icon/person_add.png")';
        contactLogo.style.backgroundPosition = 'center';
        contactLogo.style.backgroundRepeat = 'no-repeat';
    } else {
        contactLogo.style.backgroundColor = currentColor;
        contactLogo.style.backgroundImage = '';
    }
}


/**
 * Render all contacts from the firebase database
 */
function renderCalendarContacts(contacts) {
    const groupedContacts = {};
    contacts.forEach(contact => {
        if (contact.name && typeof contact.name === 'string') {
            const firstLetter = contact.name.charAt(0).toUpperCase();
            if (!groupedContacts[firstLetter]) {
                groupedContacts[firstLetter] = [];
            }
            groupedContacts[firstLetter].push(contact);
        }
    });

    Object.keys(groupedContacts).sort().forEach(letter => {
        const section = document.createElement("div");
        section.className = "letterSection";
        const title = document.createElement("div");
        title.className = "letterTitle";
        title.textContent = letter;
        section.appendChild(title);
        groupedContacts[letter].forEach(contact => {
            section.appendChild(renderContacts(contact));
        });
        contactsListContainer.appendChild(section);
    });
}

/**
 * Render all contacts from the firebase database
 */
function renderContacts(contact) {
    const contactElement = document.createElement("div");
    contactElement.className = "contactContainer";
    contactElement.id = `${contact.id}`;
    contactElement.onclick = function () {
        selectContact(contactElement);
        handelShowContactInfo(contact);
    };
    contactElement.innerHTML = createContacts(contact);
    contactsListContainer.appendChild(contactElement);
    return contactElement;
}

let showContactLogo = document.getElementById('showContactLogo');
let showContactName = document.getElementById('showContactName');
let showContactMail = document.getElementById('showContactMail');
let showContactPhone = document.getElementById('showContactPhone');


/**
 * Handle the Info Contact side if the window is smaller then 750px
 */
function handelShowContactInfo(array) {
    if (window.innerWidth <= 750) {
        showContactInfoMobil(array);
    } else {
        showContactInfos(array);
    }
}

let contactListContainer = document.getElementById('contactListContainer');
let showContactContainer = document.getElementById('showContactContainer');
let showContactBackContainer = document.getElementById('showContactBackContainer');
let showContactInfoContentContainer = document.getElementById('showContactInfoContentContainer');
let newContactMobilBtn = document.getElementById('newContactMobilBtn');
let newContactInfoMobilBtn = document.getElementById('newContactInfoMobilBtn');


/**
 * Handle the Contact Info, if the window is bigger than 750px
 */
function handelContactScreenResult() {
    if (window.innerWidth > 750) {
        renderContactsPageOver750();
    } else {
        renderContactsPageUnder750();
    }
}

function renderContactsPageOver750() {
    showContactBackContainer.style.display = 'none';
    showContactContainer.style.display = 'flex';
    if (showContactContainer) {
        contactListContainer.classList.remove('d-none');
    }
}

function renderContactsPageUnder750() {
    if (showContactContainer) {
        showContactContainer.style.display = 'flex';
        newContactInfoMobilBtn.style.display = 'flex';
        if (contactListContainer) {
            showContactContainer.style.display = 'none';
            contactListContainer.classList.remove('d-none');
            showContactBackContainer.style.display = 'none';
            newContactMobilBtn.classList.remove('d-none');
            newContactInfoMobilBtn.classList.add('d-none');;
        }
    } else {
        showContactContainer.style.display = 'none';
    }
}


let showContactContent = document.getElementById('showContactContent');

/**
 * Show the Contact Informations in mobile view
 */
function showContactInfoMobil(array) {
    contactListContainer.classList.add('d-none');
    newContactMobilBtn.classList.add('d-none');
    newContactInfoMobilBtn.classList.remove('d-none');
    showContactContainer.style.display = 'flex';
    showContactContent.style.display = 'flex';
    setTimeout(function () {
        showContactBackContainer.style.display = 'flex';
    }, 750)
    showContactInfoContentContainer.innerHTML = createContactsInfo(array);
    checkContactId(array);
}

/**
 * show the Contact Informations, of the one contact that is clicked
 */
function showContactInfos(array) {
    showContactInfoContentContainer.innerHTML = createContactsInfo(array);
    checkContactId(array);
}

/**
 * show the contact Informations window
 */
function hideShowContactInfo() {
    contactListContainer.classList.remove('d-none');
    newContactMobilBtn.classList.remove('d-none');
    newContactInfoMobilBtn.classList.add('d-none');
    if (window.innerWidth < 750) {
        showContactContainer.style.display = 'none';
    }
    showContactBackContainer.style.display = 'none';
}

let editContactForm = document.getElementById('editContactForm');

/**
 * 
 *Check the ID of the Contact 
 */
function checkContactId(array) {
    let deleteBtn = document.getElementById('delete-contact-btn');
    if (!array.type) {
        deleteBtn.style.display = 'flex';
    } else {
        deleteBtn.style.display = 'none';
    }
}


/**
 * Close the Window for edit and delete a contact
 */
function closeEditOrDeletePopUp() {
    let editContactContainer = document.getElementById('editContactContainer');
    if (editContactContainer) {
        hideEditContact();
    } else {
        hideDeleteContact();
    }
}





