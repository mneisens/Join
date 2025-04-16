/**
 * Bereitet das Bearbeiten eines Kontakts vor
 */
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

// Mache die Funktion global verfügbar
window.editContact = editContact;


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
  
  // Global verfügbar machen
  window.showEditContacts = showEditContacts;



/**
 * render the buttons for editing a contact or delete a contact
 * Abgesichert gegen fehlende Elemente im DOM
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
    
    // Falls es sich um den myContact handelt (kann in Zukunft entfernt werden)
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
      
      let updatedData = {
        name: editNameInput.value,
        email: editEmailInput.value,
        phone: editPhoneInput.value,
        initials: renderEditContactInitials(),
        color: getColorFromEditInput(),
        id: id
      };
      
      console.log("Gesammelte Formulardaten:", updatedData);
      
      hideEditContact();
      
      // Warten auf das Update und die Antwort vom Server
      await updateContacts(id, updatedData);
      
      // Kontaktliste neu laden
      await showContacts();
      
      // Aktualisierte Kontaktdetails anzeigen
      showContactInfos(updatedData);
      
      // Erfolgsmeldung
      alert("Kontakt erfolgreich aktualisiert!");
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
        await deleteContacts(id);
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
 * Hilfsfunktion: Renderung eines einzelnen Kontakts in der Liste
 */
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

// Leere Dummy-Funktionen, damit keine Fehler auftreten, falls der Code diese aufruft
function updateMyContact() {
    console.log("updateMyContact ist nicht mehr implementiert");
    return Promise.resolve();
}

function updateMyAccount() {
    console.log("updateMyAccount ist nicht mehr implementiert");
    return Promise.resolve();
}

function getMyContact(myContacts) {
    console.log("getMyContact ist nicht mehr implementiert");
    return {};
}

function renderMyContact() {
    console.log("renderMyContact ist nicht mehr implementiert");
    return {};
}

