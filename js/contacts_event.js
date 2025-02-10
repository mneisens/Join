/**
 * Change ContactInformation of:
 * @param {string} id -Contact ID
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phonenumber
 * @param {string} color - contact background color the initials
 * @param {string} type - the type of the buttons
 */
function editContact(id, name, email, phone, color, type) {
    showEditContacts();
    createEditContactContent();
    fillEditForm(id, name, email, phone, color);
    renderEditContactInitials();
    renderBtns(type);
}


let editContactPopUp = document.getElementById('editContactPopUp');

/**
 * Clode the window of the PopUp from edit Contact, if the contact editing is finished
 */
function showEditContacts() {
    document.getElementById('editContactContainer').classList.remove('d-none');
    editContactPopUp.classList.remove('slideOutBottom');
    editContactPopUp.classList.add('slideInBottom');

}

/**
 * render the buttons for editing a contact or delete a contact
 */
function renderBtns(type) {
    let btnDelete = document.getElementById('btnDelete');
    let BtnCancelEdit = document.getElementById('BtnCancelEdit');
    let btnSave = document.getElementById('btnSave');
    let btnSaveMyContact = document.getElementById('btnSaveMyContact');
    if (type === 'myContact') {
        btnSave.style.display = 'none';
        btnDelete.style.display = 'none';
        btnSaveMyContact.style.display = 'flex';
        BtnCancelEdit.style.display = 'flex';
    } else {
        btnSaveMyContact.style.display = 'none';
        BtnCancelEdit.style.display = 'none';
        btnSave.style.display = 'flex';
        btnDelete.style.display = 'flex';
    }
}

/**
 * show windows for edit an contact
 */
function hideEditContact() {
    editContactPopUp.classList.remove('slideInBottom');
    editContactPopUp.classList.add('slideOutBottom');
    setTimeout(function() {
        document.getElementById('editContactContainer').classList.add('d-none');
    }, 180)
}

let popUpHeadline = document.getElementById('popUpHeadline');
let popUpContent = document.getElementById('popUpContent');

/**
 * 
 */
function createEditContactContent(id, name, email, phone, color) {
    popUpHeadline.innerHTML = 'Edit contact'
    popUpContent.innerHTML = '';
    popUpContent.innerHTML += createEditContactPopUp();
}



function fillEditForm(id, name, email, phone, color) {
    let editNameInput = document.getElementById('editNameInput');
    let editEmailInput = document.getElementById('editEmailInput');
    let editPhoneInput = document.getElementById('editPhoneInput');
    let currentContactId = document.getElementById('currentContactId');
    let editLogo = document.getElementById('editLogo');
    editNameInput.value = name;
    editEmailInput.value = email;
    editPhoneInput.value = phone;
    currentContactId.value = id;
    editLogo.style.backgroundColor = color;
}

/*Render the initinial for the contacts */
function renderEditContactInitials() {
    let userFullName = editNameInput.value;
    let names = userFullName.split(' ');
    let firstContactInitial = names[0].substring(0, 1).toUpperCase();
    let secondContactInitail = '';
    if (names.length > 1) {
        secondContactInitail = names[names.length - 1].substring(0, 1).toUpperCase();
    }
    let contactInitials = firstContactInitial + secondContactInitail;
    showEditContactInitials(firstContactInitial, secondContactInitail);
    return contactInitials;
}

/**
 * Updates the HTML content of specified elements with edited contact initials.
 * @param {string} firstContactInitial - The initial of the first name from the edit form.
 * @param {string} secondContactInitial - The initial of the last name from the edit form.
 */
function showEditContactInitials(firstContactInitial, secondContactInitail) {
    document.getElementById('editFirtsContactInitials').innerHTML = firstContactInitial;
    document.getElementById('editSecondContactInitials').innerHTML = secondContactInitail;
}

/**
 * Fetches the background color of the edit form's logo element.
 * @returns {string} The background color style property of the edit form's logo element.
 */
function getColorFromEditInput() {
    return editLogo.style.backgroundColor;
}

/**
 * Processes the updated contact information, saves it, and refreshes the UI accordingly.
 */
async function startUpdatedContact() {
    let id = currentContactId.value;
    let updatedData = {
        name: editNameInput.value,
        email: editEmailInput.value,
        phone: editPhoneInput.value,
        initials: renderEditContactInitials(),
        color: getColorFromEditInput(),
        id: id
    };

    hideEditContact();
    await updateContacts(id, updatedData);
    showContacts();
    showContactInfos(updatedData);
}

/**
 * Processes the updated personal contact information, saves it using asynchronous calls,
 * and refreshes various parts of the user interface.
 */
async function startUpdatedMyContact() {
    let id = currentContactId.value;
    let updatedMyData = {
        name: getNameFromEditInput(),
        email: editEmailInput.value,
        phone: editPhoneInput.value,
        initials: renderEditContactInitials(),
        color: getColorFromEditInput(),
        type: 'myContact'
    };

    await updateMyContact(id, updatedMyData);
    await updateMyAccount();
    await getMyContacts();
    createUserInitials();
    hideEditContact();
    showContactInfos(updatedMyData);
}

function getNameFromEditInput() {
    let editNameInput = document.getElementById('editNameInput');
    return editNameInput.value;
}

/**
 * Handles form submission for contact update actions based on which submit button was pressed.
 * @param {Event} event - The event object from the form submission.
 */
function handleSubmit(event) {
    event.preventDefault();
    if (event.submitter.id === "btnSave") {
        startUpdatedContact();
    } else if (event.submitter.id === "btnSaveMyContact") {
        startUpdatedMyContact();
    }
}

/**
 * Displays a pop-up for deleting a contact with pre-filled contact information.
 * @param {string} id - The ID of the contact to be deleted.
 * @param {string} name - The name of the contact to be deleted.
 * @param {string} initials - The initials of the contact to be deleted.
 * @param {string} color - The associated color of the contact to be deleted.
 */
function showDeleteContactPopUp(id, name, initials, color) {
    showDeleteContacts();
    showDeleteContactsInfos(id, name, initials, color);
}

/**
 * Displays the delete contact container and animates the entry of the delete form.
 */
function showDeleteContacts() {
    document.getElementById('deleteContactContainer').classList.remove('d-none');
    document.getElementById('deleteContact').classList.remove('slideOutBottom');
    document.getElementById('deleteContact').classList.add('slideInBottom');
}

/**
 * Dynamically creates content for deleting a contact from a pop-up window.
 */
function showDeleteContactsFromPopUp() {
    let editNameInput = document.getElementById('editNameInput');
    let name = editNameInput.value;
    let color = getColorFromEditInput();
    let id = currentContactId.value;
    popUpHeadline.innerHTML = 'Delete contact';
    popUpContent.innerHTML = '';
    popUpContent.innerHTML += createDeleteContactContent();
    showPopUpDeleteContocatInfo(name, id, color);
}

/**
 * Hides and animates the exit of the delete contact form.
 */
function hideDeleteContact() {
    document.getElementById('deleteContact').classList.remove('slideInBottom');
    document.getElementById('deleteContact').classList.add('slideOutBottom');
    const delayDeleteDisplayNone = setTimeout(deleteDisplayNone, 180);
}

/**
 * Sets the delete contact container to display none after the animation.
 */
function deleteDisplayNone() {
    document.getElementById('deleteContactContainer').classList.add('d-none');
}

/**
 * Displays the detailed contact information in the delete contact form.
 * @param {string} id - The contact's ID.
 * @param {string} name - The contact's name.
 * @param {string} initials - The contact's initials.
 * @param {string} color - The contact's associated color.
 */
function showDeleteContactsInfos(id, name, initials, color) {
    document.getElementById('deleteContactName').innerHTML = name;
    document.getElementById('deleteLogo').style.backgroundColor = color;
    document.getElementById('deleteContactInitials').innerHTML = initials;
    document.getElementById('deleteContactId').value = id;
}

/**
 * Displays the contact deletion information in a pop-up.
 * @param {string} name - The name of the contact.
 * @param {string} id - The contact's ID.
 * @param {string} color - The contact's associated color.
 */
function showPopUpDeleteContocatInfo(name, id, color) {
    document.getElementById('deleteContactName').innerHTML = name;
    document.getElementById('deleteLogo').style.backgroundColor = color;
    document.getElementById('deleteContactId').value = id;
}


/**
 * Executes the deletion of a contact, closes any open pop-up, and refreshes the contact list.
 */
async function startDeleteContact() {
    let id = document.getElementById('deleteContactId').value;
    await deleteContacts(id);
    closeEditOrDeletePopUp();
    showContactInfoContentContainer.innerHTML = '';
    hideShowContactInfo();
    showContacts();
}

/**
 * delete the choosen contact
 */
async function startDeleteContactDirekt() {
    let id = document.getElementById('deleteContactId').value;
    await deleteContacts(id);
    hideDeleteContact();
    showContactInfoContentContainer.innerHTML = '';
    hideShowContactInfo();
    showContacts();
}


/**
 * show the container of the selectContainer
 */
function selectContact(contactElement) {
    document.querySelectorAll('.contactContainer').forEach(contact => {
        contact.classList.remove('selectedContact');
    });
    contactElement.classList.add('selectedContact');
}

/**
 * render the Informations of my own contact
 *  
 */
function renderMyContact(myContacts) {
    const myContactElement = document.createElement('div');
    myContactElement.className = "contactContainer";
    let myContact = getMyContact(myContacts);
    myContactElement.onclick = function () {
        selectContact(myContactElement);
        handelShowContactInfo(myContact);
    };
    myContactElement.innerHTML = createMyContact(myContact);
    myContactContainer.appendChild(myContactElement);
    return myContactElement;
}


/**
 * get the informations of my own contact
 */
function getMyContact(myContacts) {
    for (let i = 0; i < myContacts.length; i++) {
        const myContact = myContacts[0];
        return myContact;
    }
}

/**
 * show the edit button in mobile view
 */
function showEditMobilBtn() {
    let showContactInfoBtnContainer = document.getElementById('showContactInfoBtnContainer');
    let btnContainer = document.getElementById('btnContainer');
    let newContactInfoMobilBtn = document.getElementById('newContactInfoMobilBtn');
        showContactInfoBtnContainer.style.display = 'flex';
        btnContainer.classList.remove('slideoutright');
        btnContainer.classList.add('slideInRight');
        newContactInfoMobilBtn.classList.add('d-none');
        showContactInfoBtnContainer.onclick = function() {
            hideEditMobilBtn();
        }
}

/**
 * Show the button for mobile view
 */
function hideEditMobilBtn() {
    let showContactInfoBtnContainer = document.getElementById('showContactInfoBtnContainer');
    let btnContainer = document.getElementById('btnContainer');
    let newContactInfoMobilBtn = document.getElementById('newContactInfoMobilBtn');
    btnContainer.classList.remove('slideInRight');
    btnContainer.classList.add('slideoutright');
    setTimeout(function () {
        newContactInfoMobilBtn.classList.remove('d-none');;
        showContactInfoBtnContainer.style.display = 'none';
    }, 250)
}