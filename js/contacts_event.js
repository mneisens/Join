// contacts_event-non-module.js - Ereignishandhabung für Kontakte
// Diese Version verwendet keine ES6-Module, sondern globale Funktionen

/**
 * Öffnet das Bearbeitungsfenster für einen Kontakt
 */
function editContact(id, name, email, phone, color, type) {
    console.log("editContact aufgerufen mit:", id, name, email, phone, color, type);
    
    try {
        // Zeige das Bearbeitungsfenster an
        showEditContacts();
        
        // Erstelle den Inhalt des Bearbeitungsfensters
        createEditContactContent();
        
        // Fülle das Formular mit den Kontaktdaten
        fillEditForm(id, name, email, phone, color);
        
        // Zeige die Initialen an
        renderEditContactInitials();
        
        // Konfiguriere die Buttons
        renderBtns(type || 'contact');
    } catch (error) {
        console.error("Fehler beim Bearbeiten des Kontakts:", error);
        alert("Fehler beim Öffnen des Bearbeitungsfensters: " + error.message);
    }
}

/**
 * Öffnet das Bearbeitungsfenster
 */
function showEditContacts() {
    console.log("showEditContacts wird aufgerufen");
    
    const editContactContainer = document.getElementById('editContactContainer');
    const editContactPopUp = document.getElementById('editContactPopUp');
    
    if (!editContactContainer) {
      console.error("Element 'editContactContainer' nicht gefunden");
      return;
    }
    
    if (!editContactPopUp) {
      console.error("Element 'editContactPopUp' nicht gefunden");
      return;
    }
    
    editContactContainer.classList.remove('d-none');
    editContactPopUp.classList.remove('slideOutBottom');
    editContactPopUp.classList.add('slideInBottom');
}

/**
 * Render the buttons for editing a contact or delete a contact
 */
function renderBtns(type) {
    let btnDelete = document.getElementById('btnDelete');
    let BtnCancelEdit = document.getElementById('BtnCancelEdit');
    let btnSave = document.getElementById('btnSave');
    let btnSaveMyContact = document.getElementById('btnSaveMyContact');
    
    // Prüfen, ob die Elemente existieren, bevor wir sie ansprechen
    if (!btnDelete || !BtnCancelEdit || !btnSave || !btnSaveMyContact) {
        console.warn("Einige UI-Elemente für renderBtns wurden nicht gefunden. Möglicherweise sind sie noch nicht geladen.");
        return;
    }
    
    // Standard-Ansicht für alle Kontakte
    btnSaveMyContact.style.display = 'none';
    BtnCancelEdit.style.display = 'none';
    btnSave.style.display = 'flex';
    btnDelete.style.display = 'flex';
    
    // Falls es sich um den myContact handelt
    if (type === 'myContact') {
        btnSave.style.display = 'none';
        btnDelete.style.display = 'none';
        btnSaveMyContact.style.display = 'flex';
        BtnCancelEdit.style.display = 'flex';
    }
}

/**
 * Startet die Aktualisierung eines Kontakts mit den Formulardaten
 */
async function startUpdatedContact() {
    try {
      let currentContactId = document.getElementById('currentContactId');
      let editNameInput = document.getElementById('editNameInput');
      let editEmailInput = document.getElementById('editEmailInput');
      let editPhoneInput = document.getElementById('editPhoneInput');
      
      // Prüfen, ob die Elemente vorhanden sind
      if (!currentContactId || !editNameInput || !editEmailInput || !editPhoneInput) {
        console.error("Konnte nicht alle notwendigen Formularelemente finden.");
        alert("Fehler: Formularelemente nicht gefunden");
        return;
      }
      
      let id = currentContactId.value;
      console.log("Aktualisiere Kontakt mit ID:", id);
      
      // Extrahiere Formulardaten und baue das Update-Objekt
      let updatedData = {
        name: editNameInput.value,
        email: editEmailInput.value,
        phone: editPhoneInput.value,
        initials: renderEditContactInitials(),
        color: getColorFromEditInput(),
        id: id
      };
      
      console.log("Gesammelte Formulardaten:", updatedData);
      
      // Schließe das Edit-Fenster
      hideEditContact();
      
      // API-Funktion aufrufen
      await updateContact(id, updatedData);
      
      // Kontaktliste neu laden
      await showContacts();
      
      // Aktualisierte Kontaktdetails anzeigen
      showContactInfos(updatedData);
      
      // Erfolgsmeldung anzeigen
      slideInContactSuccesfullyBox();
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
      alert("Fehler beim Aktualisieren des Kontakts: " + error.message);
    }
}

/**
 * Startet das Löschen eines Kontakts direkt von der Detailansicht
 */
async function startDeleteContactDirekt() {
    let id = document.getElementById('deleteContactId').value;
    
    try {
        // API-Funktion aufrufen
        await deleteContact(id);
        hideDeleteContact();
        let showContactInfoContentContainer = document.getElementById('showContactInfoContentContainer');
        if (showContactInfoContentContainer) {
            showContactInfoContentContainer.innerHTML = '';
        }
        hideShowContactInfo();
        await showContacts();
    } catch (error) {
        console.error("Fehler beim Löschen:", error);
        alert("Fehler beim Löschen des Kontakts: " + error.message);
    }
}

/**
 * Zeigt den Lösch-Dialog für einen Kontakt an
 */
function showDeleteContactPopUp(id, name, initials, color) {
    let deleteContactContainer = document.getElementById('deleteContactContainer');
    let deleteContact = document.getElementById('deleteContact');
    let deleteContactId = document.getElementById('deleteContactId');
    let deleteContactName = document.getElementById('deleteContactName');
    let deleteContactInitials = document.getElementById('deleteContactInitials');
    let deleteLogo = document.getElementById('deleteLogo');
    
    if (!deleteContactContainer || !deleteContact || !deleteContactId || 
        !deleteContactName || !deleteContactInitials || !deleteLogo) {
        console.error("Konnte nicht alle Elemente für den Löschdialog finden");
        return;
    }
    
    // Werte setzen
    deleteContactId.value = id;
    deleteContactName.textContent = name;
    deleteContactInitials.textContent = initials;
    deleteLogo.style.backgroundColor = color;
    
    // Dialog anzeigen
    deleteContactContainer.classList.remove('d-none');
    deleteContact.classList.remove('slideOutBottom');
    deleteContact.classList.add('slideInBottom');
    
    // Lösch-Button-Event-Handler einstellen
    let btnDeleteConfirm = document.getElementById('btnDeleteConfirm');
    if (btnDeleteConfirm) {
        btnDeleteConfirm.onclick = startDeleteContactDirekt;
    }
}

/**
 * Funktion zum Ausblenden des Lösch-Dialogs
 */
function hideDeleteContact() {
    let deleteContactContainer = document.getElementById('deleteContactContainer');
    let deleteContact = document.getElementById('deleteContact');
    
    if (deleteContactContainer && deleteContact) {
        deleteContact.classList.remove('slideInBottom');
        deleteContact.classList.add('slideOutBottom');
        
        // Nach kurzer Verzögerung Dialog verstecken
        setTimeout(() => {
            deleteContactContainer.classList.add('d-none');
        }, 200);
    }
}

/**
 * Erstellt das Formular zum Bearbeiten eines Kontakts
 */
function createEditContactContent() {
    let popUpContent = document.getElementById('popUpContent');
    if (popUpContent) {
        popUpContent.innerHTML = createEditContactPopUp();
        
        // Event-Listener für das Formular hinzufügen
        let editForm = document.getElementById('editContactForm');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                startUpdatedContact();
            });
        }
        
        // Event-Listener für den Cancel-Button
        let btnCancel = document.getElementById('BtnCancelEdit');
        if (btnCancel) {
            btnCancel.addEventListener('click', hideEditContact);
        }
        
        // Event-Listener für den Delete-Button
        let btnDelete = document.getElementById('btnDelete');
        if (btnDelete) {
            btnDelete.addEventListener('click', function() {
                // Die Daten für den Löschdialog aus dem Formular holen
                let id = document.getElementById('currentContactId').value;
                let name = document.getElementById('editNameInput').value;
                let initials = renderEditContactInitials();
                let color = getColorFromEditInput();
                
                showDeleteContactPopUp(id, name, initials, color);
            });
        }
    }
}

/**
 * Füllt das Bearbeitungsformular mit Kontaktdaten
 */
function fillEditForm(id, name, email, phone, color) {
    let currentContactId = document.getElementById('currentContactId');
    let editNameInput = document.getElementById('editNameInput');
    let editEmailInput = document.getElementById('editEmailInput');
    let editPhoneInput = document.getElementById('editPhoneInput');
    let editLogo = document.getElementById('editLogo');
    
    if (currentContactId) currentContactId.value = id;
    if (editNameInput) editNameInput.value = name;
    if (editEmailInput) editEmailInput.value = email;
    if (editPhoneInput) editPhoneInput.value = phone;
    if (editLogo) editLogo.style.backgroundColor = color;
}

/**
 * Schließt das Bearbeitungsfenster
 */
function hideEditContact() {
    let editContactContainer = document.getElementById('editContactContainer');
    let editContactPopUp = document.getElementById('editContactPopUp');
    
    if (editContactContainer && editContactPopUp) {
        editContactPopUp.classList.remove('slideInBottom');
        editContactPopUp.classList.add('slideOutBottom');
        
        // Nach kurzer Verzögerung Dialog verstecken
        setTimeout(() => {
            editContactContainer.classList.add('d-none');
        }, 200);
    }
}

/**
 * Event-Propagation stoppen (für Popups)
 */
function stopPropagation(event) {
    event.stopPropagation();
}

/**
 * Rendert die Kontakt-Initialen im Bearbeitungsfenster
 */
function renderEditContactInitials() {
    let userFullName = document.getElementById('editNameInput').value;
    let names = userFullName.split(' ');
    let firstContactInitial = names[0] ? names[0].substring(0, 1).toUpperCase() : '';
    let secondContactInitial = '';
    if (names.length > 1) {
        secondContactInitial = names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    // Initialen in DOM-Elementen anzeigen
    let firstInitialsElement = document.getElementById('editFirtsContactInitials');
    let secondInitialsElement = document.getElementById('editSecondContactInitials');
    
    if (firstInitialsElement) firstInitialsElement.textContent = firstContactInitial;
    if (secondInitialsElement) secondInitialsElement.textContent = secondContactInitial;
    
    return firstContactInitial + secondContactInitial;
}

/**
 * Holt die Hintergrundfarbe des Kontakt-Logos im Bearbeitungsfenster
 */
function getColorFromEditInput() {
    let editLogo = document.getElementById('editLogo');
    return editLogo ? editLogo.style.backgroundColor : getRandomColor();
}

/**
 * Für Mobile-Geräte: Bearbeitungsoptionen anzeigen/verstecken
 */
function showEditMobilBtn() {
    // Implementation optional - kann nach Bedarf angepasst werden
    console.log("showEditMobilBtn wurde aufgerufen");
}

// Rendert einen einzelnen Kontakt in der Liste
function renderContacts(contact) {
    const contactElement = document.createElement("div");
    contactElement.className = "contactContainer";
    contactElement.id = `${contact.id}`;
    
    contactElement.addEventListener('click', function() {
        console.log("Kontakt angeklickt:", contact);
        
        // Inline-Implementierung der selectContact-Funktion
        document.querySelectorAll('.contactContainer').forEach(c => {
            c.classList.remove('selectedContact');
        });
        contactElement.classList.add('selectedContact');
        
        // Zeige Kontaktinformationen
        handelShowContactInfo(contact);
    });
    
    contactElement.innerHTML = createContacts(contact);
    return contactElement;
}

// Abgesicherte Funktion zur Mobil/Desktop-Anzeige
function handelContactScreenResult() {
    if (!document.getElementById('showContactContainer') || 
        !document.getElementById('contactListContainer') ||
        !document.getElementById('newContactMobilBtn') ||
        !document.getElementById('newContactInfoMobilBtn')) {
        console.warn("Einige UI-Elemente für handelContactScreenResult wurden nicht gefunden.");
        return;
    }
    
    if (window.innerWidth > 750) {
        renderContactsPageOver750();
    } else {
        renderContactsPageUnder750();
    }
}

// Funktionen global verfügbar machen
window.editContact = editContact;
window.showEditContacts = showEditContacts;
window.renderBtns = renderBtns;
window.startUpdatedContact = startUpdatedContact;
window.startDeleteContactDirekt = startDeleteContactDirekt;
window.showDeleteContactPopUp = showDeleteContactPopUp;
window.hideDeleteContact = hideDeleteContact;
window.createEditContactContent = createEditContactContent;
window.fillEditForm = fillEditForm;
window.hideEditContact = hideEditContact;
window.stopPropagation = stopPropagation;
window.renderEditContactInitials = renderEditContactInitials;
window.getColorFromEditInput = getColorFromEditInput;
window.showEditMobilBtn = showEditMobilBtn;
window.renderContacts = renderContacts;
window.handelContactScreenResult = handelContactScreenResult;