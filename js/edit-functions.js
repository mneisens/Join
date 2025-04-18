// /**
//  * Erstellt den Inhalt des Bearbeitungsfensters
//  */
// function createEditContactContent() {
//     console.log("createEditContactContent wird aufgerufen");
    
//     const popUpHeadline = document.getElementById('popUpHeadline');
//     const popUpContent = document.getElementById('popUpContent');
    
//     if (!popUpHeadline || !popUpContent) {
//       console.error("Elemente für createEditContactContent nicht gefunden");
//       return;
//     }
    
//     popUpHeadline.innerHTML = 'Edit contact';
//     popUpContent.innerHTML = '';
//     popUpContent.innerHTML = createEditContactPopUp();
//   }
  
//   /**
//    * Füllt das Bearbeitungsformular mit den Kontaktdaten
//    */
//   function fillEditForm(id, name, email, phone, color) {
//     console.log("fillEditForm wird aufgerufen mit:", id, name, email, phone, color);
    
//     const editNameInput = document.getElementById('editNameInput');
//     const editEmailInput = document.getElementById('editEmailInput');
//     const editPhoneInput = document.getElementById('editPhoneInput');
//     const currentContactId = document.getElementById('currentContactId');
//     const editLogo = document.getElementById('editLogo');
    
//     if (!editNameInput || !editEmailInput || !editPhoneInput || !currentContactId || !editLogo) {
//       console.error("Formularelemente für fillEditForm nicht gefunden");
//       return;
//     }
    
//     editNameInput.value = name;
//     editEmailInput.value = email;
//     editPhoneInput.value = phone;
//     currentContactId.value = id;
//     editLogo.style.backgroundColor = color;
//   }
  
//   /**
//    * Rendert die Initialen im Bearbeitungsfenster
//    */
//   function renderEditContactInitials() {
//     const editNameInput = document.getElementById('editNameInput');
    
//     if (!editNameInput) {
//       console.error("editNameInput für renderEditContactInitials nicht gefunden");
//       return '';
//     }
    
//     let userFullName = editNameInput.value;
//     let names = userFullName.split(' ');
//     let firstContactInitial = names[0].substring(0, 1).toUpperCase();
//     let secondContactInitial = '';
    
//     if (names.length > 1) {
//       secondContactInitial = names[names.length - 1].substring(0, 1).toUpperCase();
//     }
    
//     let contactInitials = firstContactInitial + secondContactInitial;
//     showEditContactInitials(firstContactInitial, secondContactInitial);
//     return contactInitials;
//   }
  
//   /**
//    * Zeigt die Initialen im Bearbeitungsfenster an
//    */
//   function showEditContactInitials(firstContactInitial, secondContactInitial) {
//     const editFirtsContactInitials = document.getElementById('editFirtsContactInitials');
//     const editSecondContactInitials = document.getElementById('editSecondContactInitials');
    
//     if (!editFirtsContactInitials || !editSecondContactInitials) {
//       console.error("Elemente für showEditContactInitials nicht gefunden");
//       return;
//     }
    
//     editFirtsContactInitials.innerHTML = firstContactInitial;
//     editSecondContactInitials.innerHTML = secondContactInitial;
//   }
  
//   /**
//    * Schließt das Bearbeitungsfenster
//    */
//   function hideEditContact() {
//     const editContactPopUp = document.getElementById('editContactPopUp');
//     const editContactContainer = document.getElementById('editContactContainer');
    
//     if (!editContactPopUp) {
//       console.error("editContactPopUp nicht gefunden");
//       return;
//     }
    
//     editContactPopUp.classList.remove('slideInBottom');
//     editContactPopUp.classList.add('slideOutBottom');
    
//     setTimeout(function() {
//       if (editContactContainer) {
//         editContactContainer.classList.add('d-none');
//       }
//     }, 180);
//   }
  
//   /**
//    * Holt die Hintergrundfarbe aus dem Edit-Logo
//    */
//   function getColorFromEditInput() {
//     const editLogo = document.getElementById('editLogo');
    
//     if (!editLogo) {
//       console.error("editLogo nicht gefunden");
//       return '#000000'; // Fallback-Farbe
//     }
    
//     return editLogo.style.backgroundColor;
//   }
  
//   /**
//    * Behandelt das Absenden des Bearbeitungsformulars
//    */
//   function handleSubmit(event) {
//     event.preventDefault();
    
//     if (event.submitter.id === "btnSave") {
//       startUpdatedContact();
//     } else if (event.submitter.id === "btnSaveMyContact") {
//       console.log("btnSaveMyContact wurde geklickt");
//     }
//   }
  
//   /**
//    * Zeigt das Löschfenster aus dem Bearbeitungsfenster heraus an
//    */
//   function showDeleteContactsFromPopUp() {
//     const editNameInput = document.getElementById('editNameInput');
//     const editLogo = document.getElementById('editLogo');
//     const currentContactId = document.getElementById('currentContactId');
//     const popUpHeadline = document.getElementById('popUpHeadline');
//     const popUpContent = document.getElementById('popUpContent');
    
//     if (!editNameInput || !editLogo || !currentContactId || !popUpHeadline || !popUpContent) {
//       console.error("Elemente für showDeleteContactsFromPopUp nicht gefunden");
//       return;
//     }
    
//     let name = editNameInput.value;
//     let color = editLogo.style.backgroundColor;
//     let id = currentContactId.value;
    
//     popUpHeadline.innerHTML = 'Delete contact';
//     popUpContent.innerHTML = '';
//     popUpContent.innerHTML = createDeleteContactContent();
//     showPopUpDeleteContocatInfo(name, id, color);
//   }
  
//   /**
//    * Zeigt die Kontaktdaten im Löschfenster an
//    */
//   function showPopUpDeleteContocatInfo(name, id, color) {
//     const deleteContactName = document.getElementById('deleteContactName');
//     const deleteLogo = document.getElementById('deleteLogo');
//     const deleteContactId = document.getElementById('deleteContactId');
    
//     if (!deleteContactName || !deleteLogo || !deleteContactId) {
//       console.error("Elemente für showPopUpDeleteContocatInfo nicht gefunden");
//       return;
//     }
    
//     deleteContactName.innerHTML = name;
//     deleteLogo.style.backgroundColor = color;
//     deleteContactId.value = id;
//   }
  
//   /**
//    * Zeigt das Löschfenster für einen Kontakt an
//    */
  function showDeleteContactPopUp(id, name, initials, color) {
    console.log("showDeleteContactPopUp aufgerufen mit:", id, name, initials, color);
    
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
    const deleteContactContainer = document.getElementById('deleteContactContainer');
    const deleteContact = document.getElementById('deleteContact');
    
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
    const deleteContactName = document.getElementById('deleteContactName');
    const deleteLogo = document.getElementById('deleteLogo');
    const deleteContactInitials = document.getElementById('deleteContactInitials');
    const deleteContactId = document.getElementById('deleteContactId');
    
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
    const deleteContact = document.getElementById('deleteContact');
    const deleteContactContainer = document.getElementById('deleteContactContainer');
    
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
  
//   // Alle Funktionen global verfügbar machen
//   window.createEditContactContent = createEditContactContent;
//   window.fillEditForm = fillEditForm;
//   window.renderEditContactInitials = renderEditContactInitials;
//   window.showEditContactInitials = showEditContactInitials;
//   window.hideEditContact = hideEditContact;
//   window.getColorFromEditInput = getColorFromEditInput;
//   window.handleSubmit = handleSubmit;
//   window.showDeleteContactsFromPopUp = showDeleteContactsFromPopUp;
//   window.showPopUpDeleteContocatInfo = showPopUpDeleteContocatInfo;
//   window.showDeleteContactPopUp = showDeleteContactPopUp;
//   window.showDeleteContacts = showDeleteContacts;
//   window.showDeleteContactsInfos = showDeleteContactsInfos;
//   window.hideDeleteContact = hideDeleteContact;

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
  
  // Hintergrundfarbe des Logos setzen
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
  // Wir verwenden die gespeicherte Farbe statt eine neue zu generieren
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