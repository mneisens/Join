// api-service-non-module.js - Funktionen für die Kommunikation mit dem Backend
// Diese Version verwendet keine ES6-Module, sondern macht alles global verfügbar

// API-URL für alle Anfragen
const API_URL = 'http://localhost:8000/api';

/**
 * Hilfsfunktion zum Erstellen der Request-Optionen mit Auth-Header
 * @returns {Object} Die Request-Optionen mit Authorization-Header
 */
function getRequestOptions(method = 'GET', body = null) {
    // Basis-Optionen mit Headers
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // Hier den Authorization-Header hinzufügen wenn verfügbar
        }
    };

    // Token aus localStorage oder sessionStorage holen, falls vorhanden
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Token ${token}`;  // oder 'Bearer' je nach API
    }

    // Body hinzufügen, wenn vorhanden
    if (body) {
        options.body = JSON.stringify(body);
    }

    return options;
}

/**
 * Alle Kontakte vom Backend abrufen
 * @returns {Promise<Array>} Array mit allen Kontakten
 */
async function getContacts() {
    try {
        // In dieser Version nutzen wir Dummy-Daten, falls das Backend nicht erreichbar ist
        try {
            const options = getRequestOptions();
            const response = await fetch(`${API_URL}/contacts/`, options);
            
            if (!response.ok) {
                throw new Error(`Fehler beim Abrufen der Kontakte: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API nicht erreichbar, verwende Dummy-Daten:', error);
            // Dummy-Kontakte zurückgeben
            // return getDummyContacts();
        }
    } catch (error) {
        console.error('API-Fehler bei getContacts:', error);
        throw error;
    }
}

/**
 * Einen neuen Kontakt erstellen
 * @param {Object} contactData - Die Kontaktdaten
 * @returns {Promise<Object>} Der erstellte Kontakt
 */
async function createContact(contactData) {
    try {
        // In dieser Version simulieren wir die Erstellung, falls das Backend nicht erreichbar ist
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
            // Einen simulierten Kontakt mit ID zurückgeben
            // return createDummyContact(contactData);
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
        // In dieser Version simulieren wir die Aktualisierung, falls das Backend nicht erreichbar ist
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
            // Einen simulierten aktualisierten Kontakt zurückgeben
            // return updateDummyContact(contactId, contactData);
        }
    } catch (error) {
        console.error('API-Fehler bei updateContact:', error);
        throw error;
    }
}

/**
 * Einen Kontakt löschen
 * @param {number} contactId - Die ID des Kontakts
 * @returns {Promise<void>}
 */
async function deleteContact(contactId) {
    try {
        // In dieser Version simulieren wir das Löschen, falls das Backend nicht erreichbar ist
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
            // Erfolg simulieren
            // return deleteDummyContact(contactId);
        }
    } catch (error) {
        console.error('API-Fehler bei deleteContact:', error);
        throw error;
    }
}

/**
 * Hilfsfunktion: Prüft einen einzelnen Kontakt
 * @param {number} contactId - Die ID des Kontakts
 * @returns {Promise<Object>} Der Kontakt
 */
async function getContact(contactId) {
    try {
        // In dieser Version simulieren wir die Abfrage, falls das Backend nicht erreichbar ist
        try {
            const options = getRequestOptions();
            const response = await fetch(`${API_URL}/contacts/${contactId}/`, options);
            
            if (!response.ok) {
                throw new Error(`Fehler beim Abrufen des Kontakts: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API nicht erreichbar, verwende Dummy-Kontakt:', error);
            // Dummy-Kontakt zurückgeben
            // return getDummyContact(contactId);
        }
    } catch (error) {
        console.error('API-Fehler bei getContact:', error);
        throw error;
    }
}

// ============ DUMMY DATA FUNKTIONEN ============

// In-Memory Speicher für Dummy-Kontakte
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

// Aktuelle höchste ID für neue Kontakte
let nextDummyId = 4;

/**
 * Gibt alle Dummy-Kontakte zurück
 */
function getDummyContacts() {
    return [...dummyContacts]; // Kopie zurückgeben, um das Original nicht zu verändern
}

/**
 * Gibt einen bestimmten Dummy-Kontakt zurück
 */
function getDummyContact(contactId) {
    const contact = dummyContacts.find(c => c.id == contactId);
    if (!contact) {
        throw new Error(`Kontakt mit ID ${contactId} nicht gefunden`);
    }
    return {...contact}; // Kopie zurückgeben
}

/**
 * Erstellt einen neuen Dummy-Kontakt
 */
function createDummyContact(contactData) {
    const newContact = {
        ...contactData,
        id: nextDummyId++
    };
    dummyContacts.push(newContact);
    return {...newContact}; // Kopie zurückgeben
}

/**
 * Aktualisiert einen Dummy-Kontakt
 */
function updateDummyContact(contactId, contactData) {
    const index = dummyContacts.findIndex(c => c.id == contactId);
    if (index === -1) {
        throw new Error(`Kontakt mit ID ${contactId} nicht gefunden`);
    }
    
    const updatedContact = {
        ...dummyContacts[index],
        ...contactData,
        id: contactId  // ID nicht überschreiben lassen
    };
    
    dummyContacts[index] = updatedContact;
    return {...updatedContact}; // Kopie zurückgeben
}

/**
 * Löscht einen Dummy-Kontakt
 */
function deleteDummyContact(contactId) {
    const index = dummyContacts.findIndex(c => c.id == contactId);
    if (index === -1) {
        throw new Error(`Kontakt mit ID ${contactId} nicht gefunden`);
    }
    
    dummyContacts.splice(index, 1);
    return true;
}

// Globale Verfügbarkeit für alle Funktionen
window.API_URL = API_URL;
window.getContacts = getContacts;
window.createContact = createContact;
window.updateContact = updateContact;
window.deleteContact = deleteContact;
window.getContact = getContact;

//Prüfen ob userInfo bereits definiert ist, wenn nicht, initialisieren
if (typeof userInfo === 'undefined') {
    var userInfo = JSON.parse(sessionStorage.getItem("user-info") || '{"name":"Demo User"}');
}

// Prüfen ob userCreds bereits definiert ist, wenn nicht, initialisieren
// if (typeof userCreds === 'undefined') {
//     var userCreds = JSON.parse(sessionStorage.getItem("user-creds") || '{"uid":"demo-user-id"}');
// }