
const API_URL = 'http://localhost:8000/api';

/**
 * @returns {Object} Die Request-Optionen mit Authorization-Header
 */
function getRequestOptions(method = 'GET', body = null) {
  const options = {
    method,
    headers: {
        'Authorization': 'Token ' + localStorage.getItem('authToken'),
      'Content-Type': 'application/json',
    }
  };
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) options.headers['Authorization'] = `Token ${token}`;
  if (body) options.body = JSON.stringify(body);
  return options;
}

/**
 * All contacts from backend
 * @returns {Promise<Array>} Array mit allen Kontakten
 */
async function getContacts() {
    try {
        try {
            const options = getRequestOptions();
            const response = await fetch(`${API_URL}/contacts/`, options);
            
            if (!response.ok) {
                throw new Error(`Fehler beim Abrufen der Kontakte: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API nicht erreichbar, verwende Dummy-Daten:', error);

        }
    } catch (error) {
        console.error('API-Fehler bei getContacts:', error);
        throw error;
    }
}

/**
 * Create a new contact
 * @param {Object} contactData 
 * @returns {Promise<Object>} 
 */
async function createContact(contactData) {
    try {
        try {
            const options = getRequestOptions('POST', contactData);
            const response = await fetch(`${API_URL}/contacts/`, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fehler beim Erstellen des Kontakts: ${response.status} ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API nicht erreichbar, simuliere Kontakt-Erstellung:', error);
        }
    } catch (error) {
        console.error('API-Fehler bei createContact:', error);
        throw error;
    }
}

/**
 * Einen bestehenden Kontakt aktualisieren
 * @param {number} contactId - Die ID des Kontakts
 * @param {Object} contactData - Die neuen Kontaktdaten
 * @returns {Promise<Object>} Der aktualisierte Kontakt
 */
async function updateContact(contactId, contactData) {
    try {
        try {
            const options = getRequestOptions('PATCH', contactData);
            const response = await fetch(`${API_URL}/contacts/${contactId}/`, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fehler beim Aktualisieren des Kontakts: ${response.status} ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API nicht erreichbar, simuliere Kontakt-Aktualisierung:', error);
        }
    } catch (error) {
        console.error('API-Fehler bei updateContact:', error);
        throw error;
    }
}

/**
 * delete a contact
 * @param {number} contactId - Die ID des Kontakts
 * @returns {Promise<void>}
 */
async function deleteContact(contactId) {
    try {
        try {
            const options = getRequestOptions('DELETE');
            const response = await fetch(`${API_URL}/contacts/${contactId}/`, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fehler beim Löschen des Kontakts: ${response.status} ${errorText}`);
            }
            
            return true;
        } catch (error) {
            console.warn('API nicht erreichbar, simuliere Kontakt-Löschung:', error);
        }
    } catch (error) {
        console.error('API-Fehler bei deleteContact:', error);
        throw error;
    }
}

/**
 * Check existence of a contact
 * @param {number} contactId - Contact-ID
 * @returns {Promise<Object>} Contact-Objekt
 */
async function getContact(contactId) {
    try {
        try {
            const options = getRequestOptions();
            const response = await fetch(`${API_URL}/contacts/${contactId}/`, options);
            
            if (!response.ok) {
                throw new Error(`Fehler beim Abrufen des Kontakts: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API nicht erreichbar, verwende Dummy-Kontakt:', error);
        }
    } catch (error) {
        console.error('API-Fehler bei getContact:', error);
        throw error;
    }
}

// ============ DUMMY DATA FUNCTION ============

let dummyContacts = [
    { 
        id: 1, 
        name: "Max Mustermann", 
        email: "max@example.com", 
        phone: "0123456789", 
        color: "#FF7A00", 
        initials: "MM" 
    },
    { 
        id: 2, 
        name: "Anna Schmidt", 
        email: "anna@example.com", 
        phone: "0987654321", 
        color: "#9327FF", 
        initials: "AS" 
    },
    { 
        id: 3, 
        name: "John Doe", 
        email: "john@example.com", 
        phone: "0123498765", 
        color: "#1FD7C1", 
        initials: "JD" 
    }
];

let nextDummyId = 4;

/**
 * take dummyContacts and return a copy
 */
function getDummyContacts() {
    return [...dummyContacts]; 
}

/**
 * Take a contactId and return the corresponding dummy contact
 */
function getDummyContact(contactId) {
    const contact = dummyContacts.find(c => c.id == contactId);
    if (!contact) {
        throw new Error(`Kontakt mit ID ${contactId} nicht gefunden`);
    }
    return {...contact}; 
}

/**
 * Create Dummy Data
 */
function createDummyContact(contactData) {
    const newContact = {
        ...contactData,
        id: nextDummyId++
    };
    dummyContacts.push(newContact);
    return {...newContact}; 
}

/**
 * Update Dummy Data
 */
function updateDummyContact(contactId, contactData) {
    const index = dummyContacts.findIndex(c => c.id == contactId);
    if (index === -1) {
        throw new Error(`Kontakt mit ID ${contactId} nicht gefunden`);
    }
    
    const updatedContact = {
        ...dummyContacts[index],
        ...contactData,
        id: contactId 
    };
    
    dummyContacts[index] = updatedContact;
    return {...updatedContact}; 
}

/**
 * Delete Dummy Data
 */
function deleteDummyContact(contactId) {
    const index = dummyContacts.findIndex(c => c.id == contactId);
    if (index === -1) {
        throw new Error(`Kontakt mit ID ${contactId} nicht gefunden`);
    }
    
    dummyContacts.splice(index, 1);
    return true;
}


window.API_URL = API_URL;
window.getContacts = getContacts;
window.createContact = createContact;
window.updateContact = updateContact;
window.deleteContact = deleteContact;
window.getContact = getContact;


if (typeof userInfo === 'undefined') {
    var userInfo = JSON.parse(sessionStorage.getItem("user-info") || '{""}');
}
