// api-service.js
// Hier definieren wir alle API-Aufrufe zum Backend

const API_URL = 'http://localhost:8000/api';

/**
 * Kontakt erstellen
 * @param {Object} contactData - Die Kontaktdaten (first_name, last_name, email, phone)
 * @returns {Promise} - Der erstellte Kontakt mit ID
 */
async function createContact(contactData) {
  try {
    const response = await fetch(`${API_URL}/contacts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Fehler beim Erstellen des Kontakts: ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API-Fehler:', error);
    throw error;
  }
}

/**
 * Alle Kontakte abrufen
 * @returns {Promise} - Array mit allen Kontakten
 */
async function getContacts() {
  try {
      // console.log("API-Aufruf: Kontakte abrufen");
      const response = await fetch('http://localhost:8000/api/contacts/');
      
      if (!response.ok) {
          const errorText = await response.text();
          console.error("Server-Antwort war nicht OK:", response.status, errorText);
          throw new Error(`Fehler beim Abrufen der Kontakte: Status ${response.status}`);
      }
      
      const data = await response.json();
      // console.log("API-Antwort Kontakte:", data);
      return data;
  } catch (error) {
      console.error('API-Fehler bei getContacts:', error);
      throw error;
  }
}

/**
 * Kontakt aktualisieren
 * @param {string} id - Die ID des Kontakts
 * @param {Object} contactData - Die aktualisierten Kontaktdaten
 * @returns {Promise} - Der aktualisierte Kontakt
 */
async function updateContact(id, contactData) {
  try {
    // console.log(`Aktualisiere Kontakt mit ID ${id}:`, contactData);
    
    const response = await fetch(`${API_URL}/contacts/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server antwortete mit Status:", response.status, errorText);
      throw new Error(`Fehler beim Aktualisieren des Kontakts: Status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API-Fehler:', error);
    throw error;
  }
}

/**
 * Kontakt löschen
 * @param {string} id - Die ID des Kontakts
 * @returns {Promise} - Leeres Promise bei Erfolg
 */
async function deleteContact(id) {
  try {
    const response = await fetch(`${API_URL}/contacts/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Fehler beim Löschen des Kontakts');
    }
    
    return true;
  } catch (error) {
    console.error('API-Fehler:', error);
    throw error;
  }
}