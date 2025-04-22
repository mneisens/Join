
/**
 * Creates and returns a string representing the HTML structure for a contact.
 * This structure includes the contact's logo, name, and email.
 * @param {Object} contact - The contact object containing data to display.
 * @returns {string} HTML string representing the contact for display.
 */
function createContacts(contact) {
    return `
        <div class="contactLogo" id="contactInitialLogo" style="background-color: ${contact.color};">
            <div id="contactInitials">${contact.initials}</div>
        </div>
        <div class="contactInfoContainer">
            <div class="contactListName">${contact.name}</div>
            <div class="contactListMail">${contact.email}</div>
        </div>`;
}


/**
 * Creates and returns a string representing the detailed HTML structure for displaying
 * extended information about a contact. This includes contact logos, names, emails,
 * phone numbers, and buttons for editing and deleting the contact.
 * @param {Object} array - The contact object containing detailed information to display.
 * @returns {string} HTML string representing detailed contact information for display.
 */
function createContactsInfo(array) {
    return `<div id="showContactInfoContainer" class="showContactInfoContainer">
    <div id="showContact-informations" class="showContactInfo">
        <div class="showContactInfoHeader">
            <div class="showContactInfoHeaderLogoContainer">
                <div id="showContactLogo" class="showContactInfoLogo"
                    style="background-color: ${array.color};">
                    <div class="showContactInfoInitials">${array.initials}</div>
                </div>
            </div>
            <div class="showContactInfoHeadline">
                <div id="showContactName" class="showContactInfoName">${array.name}</div>
                <div class="showContactInfoBtnContainer" id="showContactInfoBtnContainer">
                   <div class="btnContainer" id="btnContainer"> 
                    <button id="edit-contact-btn" class="editBtn"
                        onclick="editContact('${array.id}', '${array.name}', '${array.email}', '${array.phone}', '${array.color}', '${array.type}')">
                        <img src="/assets/img/contacts/edit.png" class="editIcon">Edit
                    </button>
                    <button id="delete-contact-btn" class="deleteBtn"
                        onclick="showDeleteContactPopUp('${array.id}', '${array.name}', '${array.initials}', '${array.color}')">
                        <img src="/assets/img/contacts/delete.png" class="deleteIcon">Delete
                    </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="showContactInfoContent">
            <div class="showContactInformation">Contact Informations</div>
            <div class="showContactInfoKontakt">E-Mail</div>
            <a id="showContactMail" class="showContactInfoMail" href="mailto:${array.email}">${array.email}</a>
            <div class="showContactInfoKontakt">Phone</div>
            <a id="showContactPhone" class="showContactInfoPhone" href="tel:${array.phone}">${array.phone}</a>
        </div>
    </div>
</div>`;
}

// /**
//  * Creates and returns a string representing the HTML structure for a personal contact card.
//  * This structure includes the contact's logo, name, and a label indicating it is "My Card."
//  * @param {Object} myContact - The contact object containing data to display for the personal card.
//  * @returns {string} HTML string representing the personal contact card for display.
//  */
function createMyContact(myContact) {
    return `<div class="contactLogo" id="contactInitialLogo" style="background-color: ${myContact.color};">
                <div id="contactInitials">${myContact.initials}</div>
            </div>
            <div class="contactInfoContainer">
                <div class="contactListName">${myContact.name}</div>
                <div class="contactText">My Card</div>
            </div>`;
}

/**
 * 
 * Create a Popup for delete a contact.
 */
function createDeleteContactContent() {
    return `<div class="popUpMessageContainer">
                <div class="popUpMessage">Are you sure you want to delete the contact <span
                     id="deleteContactName" class="popUpDeleteContact"></span>?
                </div>
                <input type="text" value="" id="deleteContactId" class="d-none">
                    <div class="popUpBtnContainer">
                        <button type="button" id="btnDeleteCancel" class="popUpCancelBtn"
                            onclick="closeEditOrDeletePopUp()">Cancel</button>
                        <button type="button" id="btnSave" class="popUpBtn"
                             onclick="startDeleteContact()">Delete<img src="/assets/icon/check.png" alt=""></button>
                    </div>
            </div>`;
}

/**
 * Create a Edit PopUp Window for change the cotact informations of an contact
 *
 */
function createEditContactPopUp() {
    return `<form id="editContactForm" class="popUpForm" onkeyup="renderEditContactInitials();"
    onsubmit="handleSubmit(event)">
    <div class="formInputContainer">
        <input required autocomplete="off" id="editNameInput" class="formInput"
            placeholder="Name" type="text" value="" onkeyup="renderAddContactIcon()">
        <img src="/assets/icon/person.png" alt="person" class="personIcon">
    </div>
    <div class="formInputContainer">
        <input required autocomplete="off" id="editEmailInput" class="formInput"
            placeholder="Email" type="email" value="">
        <img src="/assets/icon/mail.png" alt="mail" class="mailIcon">
    </div>
    <div class="formInputContainer">
        <input required autocomplete="off" id="editPhoneInput" class="formInput"
            placeholder="Phone" type="text" value="" oninput="this.value = this.value.replace(/[^0-9.]/g, '');">
        <img src="/assets/img/contacts/call.png" alt="phone" class="phoneIcon">
    </div>
    <input type="text" value="" id="currentContactId" class="d-none">
    <div class="popUpBtnContainer">
        <button id="btnDelete" class="popUpCancelBtn"
            onclick="showDeleteContactsFromPopUp()">Delete</button>
        <button type="button" id="BtnCancelEdit" class="popUpCancelBtn"
            onclick="hideEditContact()">Cancel</button>
        <button type="submit" id="btnSave" class="popUpBtn">Save <img
                src="/assets/icon/check.png" alt=""></button>
        <button type="submit" id="btnSaveMyContact" class="popUpBtn">Save <img
                src="/assets/icon/check.png" alt=""></button>
    </div>
</form>`;
}


/**
 * Wird aufgerufen, wenn der Edit-Button geklickt wird
 */
window.editContactClicked = function(id, name, email, phone, color) {    
    if (typeof editContact === 'function') {
        editContact(id, name, email, phone, color);
    } else {
        console.error("Funktion editContact ist nicht definiert!");
        alert("Die Bearbeitungsfunktion ist derzeit nicht verfügbar.");
    }
};

/**
 * Wird aufgerufen, wenn der Delete-Button geklickt wird
 */
window.deleteContactClicked = function(id, name, initials, color) {    
    if (typeof showDeleteContactPopUp === 'function') {
        showDeleteContactPopUp(id, name, initials, color);
    } else {
        console.error("Funktion showDeleteContactPopUp ist nicht definiert!");
        alert("Die Löschfunktion ist derzeit nicht verfügbar.");
    }
};