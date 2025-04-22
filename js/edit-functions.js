
//   /**
//    * Zeigt das Löschfenster für einen Kontakt an
//    */
  function showDeleteContactPopUp(id, name, initials, color) {
    
    try {
      // Zeige das Löschfenster an
      showDeleteContacts();
      
      // Zeige die Kontaktdaten im Löschfenster an
      showDeleteContactsInfos(id, name, initials, color);
    } catch (error) {
      console.error("Fehler beim Anzeigen des Löschfensters:", error);
      alert("Fehler beim Öffnen des Löschfensters: " + error.message);
    }
  }
  
//   /**
//    * Zeigt das Löschfenster an
//    */
  function showDeleteContacts() {
    let deleteContactContainer = document.getElementById('deleteContactContainer');
    let deleteContact = document.getElementById('deleteContact');
    
    if (!deleteContactContainer || !deleteContact) {
      console.error("UI-Elemente für showDeleteContacts nicht gefunden");
      return;
    }
    
    deleteContactContainer.classList.remove('d-none');
    deleteContact.classList.remove('slideOutBottom');
    deleteContact.classList.add('slideInBottom');
  }
  
//   /**
//    * Zeigt die Kontaktdaten im Löschfenster an
//    */
  function showDeleteContactsInfos(id, name, initials, color) {
    let deleteContactName = document.getElementById('deleteContactName');
    let deleteLogo = document.getElementById('deleteLogo');
    let deleteContactInitials = document.getElementById('deleteContactInitials');
    let deleteContactId = document.getElementById('deleteContactId');
    
    if (!deleteContactName || !deleteLogo || !deleteContactInitials || !deleteContactId) {
      console.error("Elemente für showDeleteContactsInfos nicht gefunden");
      return;
    }
    
    deleteContactName.innerHTML = name;
    deleteLogo.style.backgroundColor = color;
    deleteContactInitials.innerHTML = initials;
    deleteContactId.value = id;
  }
  
  /**
   * Schließt das Löschfenster
   */
  function hideDeleteContact() {
    let deleteContact = document.getElementById('deleteContact');
    let deleteContactContainer = document.getElementById('deleteContactContainer');
    
    if (!deleteContact) {
      console.error("deleteContact nicht gefunden");
      return;
    }
    
    deleteContact.classList.remove('slideInBottom');
    deleteContact.classList.add('slideOutBottom');
    
    setTimeout(function() {
      if (deleteContactContainer) {
        deleteContactContainer.classList.add('d-none');
      }
    }, 180);
  }
  

/**
 * Bereitet das Formular für die Bearbeitung eines Kontakts vor
 */
function createEditContactContent() {
  let popUpContent = document.getElementById('popUpContent');
  if (!popUpContent) {
      console.error("Element 'popUpContent' nicht gefunden");
      return;
  }
  
  popUpContent.innerHTML = `
      <form id="form-edit-contact" class="popUpForm" onsubmit="startUpdatedContact(); return false">
          <input type="hidden" id="currentContactId" value="">
          <input type="hidden" id="currentContactColor" value="">
          <div class="formInputContainer">
              <input required autocomplete="off" id="editNameInput" class="formInput" placeholder="Name" type="text" onkeyup="renderEditContactInitials()">
              <img src="./assets/icon/person.png" alt="person" class="personIcon">
          </div>
          <div class="formInputContainer">
              <input required autocomplete="off" id="editEmailInput" class="formInput" placeholder="Email" type="email">
              <img src="./assets/icon/mail.png" alt="mail" class="mailIcon">
          </div>
          <div class="formInputContainer">
              <input required autocomplete="off" id="editPhoneInput" class="formInput" placeholder="Phone" type="text" oninput="this.value = this.value.replace(/[^0-9.]/g, '');">
              <img src="./assets/img/contacts/call.png" alt="phone" class="phoneIcon">
          </div>
          <div class="popUpBtnContainer">
              <button type="button" class="popUpCancelBtn" id="btnDelete" onclick="openDeleteContact()">Delete</button>
              <button type="button" class="popUpCancelBtn d-none" id="BtnCancelEdit" onclick="hideEditContact()">Cancel</button>
              <button type="submit" class="popUpBtn" id="btnSave">Save <img src="./assets/icon/check.png" alt=""></button>
              <button type="button" class="popUpBtn d-none" id="btnSaveMyContact" onclick="updateMyAccountAndContac()">Save <img src="./assets/icon/check.png" alt=""></button>
          </div>
      </form>
  `;
}

/**
* Füllt das Bearbeitungsformular mit den Kontaktdaten
*/
function fillEditForm(id, name, email, phone, color) {
  let currentContactId = document.getElementById('currentContactId');
  let currentContactColor = document.getElementById('currentContactColor');
  let editNameInput = document.getElementById('editNameInput');
  let editEmailInput = document.getElementById('editEmailInput');
  let editPhoneInput = document.getElementById('editPhoneInput');
  let editLogo = document.getElementById('editLogo');
  
  if (!currentContactId || !currentContactColor || !editNameInput || 
      !editEmailInput || !editPhoneInput || !editLogo) {
      console.error("Nicht alle Formularelemente gefunden");
      return;
  }
  
  currentContactId.value = id;
  currentContactColor.value = color; // Speichern der ursprünglichen Farbe
  editNameInput.value = name;
  editEmailInput.value = email;
  editPhoneInput.value = phone || '';
  editLogo.style.backgroundColor = color;
}

/**
* Berechnet und zeigt die Initialen des Kontakts basierend auf dem Namen im Bearbeitungsformular
*/
function renderEditContactInitials() {
  let editNameInput = document.getElementById('editNameInput');
  let editFirtsContactInitials = document.getElementById('editFirtsContactInitials');
  let editSecondContactInitials = document.getElementById('editSecondContactInitials');
  
  if (!editNameInput || !editFirtsContactInitials || !editSecondContactInitials) {
      console.error("Elemente für Initialen-Anzeige nicht gefunden");
      return '';
  }
  
  let userFullName = editNameInput.value;
  let names = userFullName.split(' ');
  let firstContactInitial = names[0].substring(0, 1).toUpperCase();
  let secondContactInitial = '';
  
  if (names.length > 1) {
      secondContactInitial = names[names.length - 1].substring(0, 1).toUpperCase();
  }
  
  editFirtsContactInitials.innerHTML = firstContactInitial;
  editSecondContactInitials.innerHTML = secondContactInitial;
  
  return firstContactInitial + secondContactInitial;
}

/**
* Holt die Hintergrundfarbe aus dem Bearbeitungsformular
*/
function getColorFromEditInput() {
  let currentContactColor = document.getElementById('currentContactColor');
  return currentContactColor ? currentContactColor.value : getRandomColor();
}

/**
* Schließt das Bearbeitungsfenster
*/
function hideEditContact() {
  let editContactPopUp = document.getElementById('editContactPopUp');
  let editContactContainer = document.getElementById('editContactContainer');
  
  if (!editContactPopUp || !editContactContainer) {
      console.error("Elemente zum Schließen nicht gefunden");
      return;
  }
  
  editContactPopUp.classList.remove('slideInBottom');
  editContactPopUp.classList.add('slideOutBottom');
  
  setTimeout(function () {
      editContactContainer.classList.add('d-none');
  }, 180);
}

/**
* Öffnet das Löschfenster für einen Kontakt
*/
function openDeleteContact() {
  hideEditContact();
  
  let deleteContactContainer = document.getElementById('deleteContactContainer');
  let deleteContact = document.getElementById('deleteContact');
  let deleteContactInitials = document.getElementById('deleteContactInitials');
  let deleteContactName = document.getElementById('deleteContactName');
  let deleteContactId = document.getElementById('deleteContactId');
  let editNameInput = document.getElementById('editNameInput');
  let currentContactId = document.getElementById('currentContactId');
  
  if (!deleteContactContainer || !deleteContact || !deleteContactInitials ||
      !deleteContactName || !deleteContactId || !editNameInput || !currentContactId) {
      console.error("Elemente für Löschfenster nicht gefunden");
      return;
  }
  
  deleteContactContainer.classList.remove('d-none');
  deleteContact.classList.remove('slideOutBottom');
  deleteContact.classList.add('slideInBottom');
  
  // Setze die Informationen für das Löschfenster
  deleteContactInitials.innerHTML = renderEditContactInitials();
  deleteContactName.innerHTML = editNameInput.value;
  deleteContactId.value = currentContactId.value;
  
  // Setze die Farbe vom Kontakt auch im Löschfenster
  let currentContactColor = document.getElementById('currentContactColor');
  let deleteLogo = document.getElementById('deleteLogo');
  
  if (currentContactColor && deleteLogo) {
      deleteLogo.style.backgroundColor = currentContactColor.value;
  }
}

/**
* Schließt das Löschfenster
*/
function hideDeleteContact() {
  let deleteContactContainer = document.getElementById('deleteContactContainer');
  let deleteContact = document.getElementById('deleteContact');
  
  if (!deleteContactContainer || !deleteContact) {
      console.error("Elemente zum Schließen des Löschfensters nicht gefunden");
      return;
  }
  
  deleteContact.classList.remove('slideInBottom');
  deleteContact.classList.add('slideOutBottom');
  
  setTimeout(function () {
      deleteContactContainer.classList.add('d-none');
  }, 180);
}