/**
 * Erstellt den Inhalt des Bearbeitungsfensters
 */
function createEditContactContent() {
    console.log("createEditContactContent wird aufgerufen");
    
    const popUpHeadline = document.getElementById('popUpHeadline');
    const popUpContent = document.getElementById('popUpContent');
    
    if (!popUpHeadline || !popUpContent) {
      console.error("Elemente für createEditContactContent nicht gefunden");
      return;
    }
    
    popUpHeadline.innerHTML = 'Edit contact';
    popUpContent.innerHTML = '';
    popUpContent.innerHTML = createEditContactPopUp();
  }
  
  /**
   * Füllt das Bearbeitungsformular mit den Kontaktdaten
   */
  function fillEditForm(id, name, email, phone, color) {
    console.log("fillEditForm wird aufgerufen mit:", id, name, email, phone, color);
    
    const editNameInput = document.getElementById('editNameInput');
    const editEmailInput = document.getElementById('editEmailInput');
    const editPhoneInput = document.getElementById('editPhoneInput');
    const currentContactId = document.getElementById('currentContactId');
    const editLogo = document.getElementById('editLogo');
    
    if (!editNameInput || !editEmailInput || !editPhoneInput || !currentContactId || !editLogo) {
      console.error("Formularelemente für fillEditForm nicht gefunden");
      return;
    }
    
    editNameInput.value = name;
    editEmailInput.value = email;
    editPhoneInput.value = phone;
    currentContactId.value = id;
    editLogo.style.backgroundColor = color;
  }
  
  /**
   * Rendert die Initialen im Bearbeitungsfenster
   */
  function renderEditContactInitials() {
    const editNameInput = document.getElementById('editNameInput');
    
    if (!editNameInput) {
      console.error("editNameInput für renderEditContactInitials nicht gefunden");
      return '';
    }
    
    let userFullName = editNameInput.value;
    let names = userFullName.split(' ');
    let firstContactInitial = names[0].substring(0, 1).toUpperCase();
    let secondContactInitial = '';
    
    if (names.length > 1) {
      secondContactInitial = names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    let contactInitials = firstContactInitial + secondContactInitial;
    showEditContactInitials(firstContactInitial, secondContactInitial);
    return contactInitials;
  }
  
  /**
   * Zeigt die Initialen im Bearbeitungsfenster an
   */
  function showEditContactInitials(firstContactInitial, secondContactInitial) {
    const editFirtsContactInitials = document.getElementById('editFirtsContactInitials');
    const editSecondContactInitials = document.getElementById('editSecondContactInitials');
    
    if (!editFirtsContactInitials || !editSecondContactInitials) {
      console.error("Elemente für showEditContactInitials nicht gefunden");
      return;
    }
    
    editFirtsContactInitials.innerHTML = firstContactInitial;
    editSecondContactInitials.innerHTML = secondContactInitial;
  }
  
  /**
   * Schließt das Bearbeitungsfenster
   */
  function hideEditContact() {
    const editContactPopUp = document.getElementById('editContactPopUp');
    const editContactContainer = document.getElementById('editContactContainer');
    
    if (!editContactPopUp) {
      console.error("editContactPopUp nicht gefunden");
      return;
    }
    
    editContactPopUp.classList.remove('slideInBottom');
    editContactPopUp.classList.add('slideOutBottom');
    
    setTimeout(function() {
      if (editContactContainer) {
        editContactContainer.classList.add('d-none');
      }
    }, 180);
  }
  
  /**
   * Holt die Hintergrundfarbe aus dem Edit-Logo
   */
  function getColorFromEditInput() {
    const editLogo = document.getElementById('editLogo');
    
    if (!editLogo) {
      console.error("editLogo nicht gefunden");
      return '#000000'; // Fallback-Farbe
    }
    
    return editLogo.style.backgroundColor;
  }
  
  /**
   * Behandelt das Absenden des Bearbeitungsformulars
   */
  function handleSubmit(event) {
    event.preventDefault();
    
    if (event.submitter.id === "btnSave") {
      startUpdatedContact();
    } else if (event.submitter.id === "btnSaveMyContact") {
      console.log("btnSaveMyContact wurde geklickt");
    }
  }
  
  /**
   * Zeigt das Löschfenster aus dem Bearbeitungsfenster heraus an
   */
  function showDeleteContactsFromPopUp() {
    const editNameInput = document.getElementById('editNameInput');
    const editLogo = document.getElementById('editLogo');
    const currentContactId = document.getElementById('currentContactId');
    const popUpHeadline = document.getElementById('popUpHeadline');
    const popUpContent = document.getElementById('popUpContent');
    
    if (!editNameInput || !editLogo || !currentContactId || !popUpHeadline || !popUpContent) {
      console.error("Elemente für showDeleteContactsFromPopUp nicht gefunden");
      return;
    }
    
    let name = editNameInput.value;
    let color = editLogo.style.backgroundColor;
    let id = currentContactId.value;
    
    popUpHeadline.innerHTML = 'Delete contact';
    popUpContent.innerHTML = '';
    popUpContent.innerHTML = createDeleteContactContent();
    showPopUpDeleteContocatInfo(name, id, color);
  }
  
  /**
   * Zeigt die Kontaktdaten im Löschfenster an
   */
  function showPopUpDeleteContocatInfo(name, id, color) {
    const deleteContactName = document.getElementById('deleteContactName');
    const deleteLogo = document.getElementById('deleteLogo');
    const deleteContactId = document.getElementById('deleteContactId');
    
    if (!deleteContactName || !deleteLogo || !deleteContactId) {
      console.error("Elemente für showPopUpDeleteContocatInfo nicht gefunden");
      return;
    }
    
    deleteContactName.innerHTML = name;
    deleteLogo.style.backgroundColor = color;
    deleteContactId.value = id;
  }
  
  /**
   * Zeigt das Löschfenster für einen Kontakt an
   */
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
  
  /**
   * Zeigt das Löschfenster an
   */
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
  
  /**
   * Zeigt die Kontaktdaten im Löschfenster an
   */
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
  
  // Alle Funktionen global verfügbar machen
  window.createEditContactContent = createEditContactContent;
  window.fillEditForm = fillEditForm;
  window.renderEditContactInitials = renderEditContactInitials;
  window.showEditContactInitials = showEditContactInitials;
  window.hideEditContact = hideEditContact;
  window.getColorFromEditInput = getColorFromEditInput;
  window.handleSubmit = handleSubmit;
  window.showDeleteContactsFromPopUp = showDeleteContactsFromPopUp;
  window.showPopUpDeleteContocatInfo = showPopUpDeleteContocatInfo;
  window.showDeleteContactPopUp = showDeleteContactPopUp;
  window.showDeleteContacts = showDeleteContacts;
  window.showDeleteContactsInfos = showDeleteContactsInfos;
  window.hideDeleteContact = hideDeleteContact;