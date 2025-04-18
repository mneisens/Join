// // // tasks-api.js
// // // const API_URL = 'http://localhost:8000/api';

// // /**
// //  * Erstellt einen neuen Task im Backend
// //  * @param {Object} taskData - Die Task-Daten
// //  * @returns {Promise} - Der erstellte Task mit ID
// //  */
// // async function createTask(taskData) {
// //   try {
// //     const response = await fetch(`${API_URL}/tasks/`, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify(taskData),
// //     });
    
// //     if (!response.ok) {
// //       const errorData = await response.json();
// //       throw new Error(`Fehler beim Erstellen des Tasks: ${JSON.stringify(errorData)}`);
// //     }
    
// //     return await response.json();
// //   } catch (error) {
// //     console.error('API-Fehler:', error);
// //     throw error;
// //   }
// // }

// // /**
// //  * Ruft alle Tasks vom Backend ab
// //  * @returns {Promise} - Array mit allen Tasks
// //  */
// // async function getTasks() {
// //   try {
// //     console.log("API-Aufruf: Tasks abrufen");
// //     const response = await fetch(`${API_URL}/tasks/`);
    
// //     if (!response.ok) {
// //       const errorText = await response.text();
// //       console.error("Server-Antwort war nicht OK:", response.status, errorText);
// //       throw new Error(`Fehler beim Abrufen der Tasks: Status ${response.status}`);
// //     }
    
// //     const data = await response.json();
// //     console.log("API-Antwort Tasks:", data);
// //     return data;
// //   } catch (error) {
// //     console.error('API-Fehler bei getTasks:', error);
// //     throw error;
// //   }
// // }

// // // Vereinfachte updateTask-Funktion
// // /**
// //  * Aktualisiert einen Task im Backend
// //  * @param {string} taskId - Die ID des Tasks
// //  * @param {Object} taskData - Die aktualisierten Task-Daten
// //  * @returns {Promise} - Der aktualisierte Task
// //  */
async function updateTask(taskId, taskData) {
  try {
    console.log(`Sende Task-Update an Backend für ID ${taskId}`);
    console.log('Request-URL:', `${API_URL}/tasks/${taskId}/`);
    console.log('Request-Methode:', 'PUT');
    console.log('Request-Daten:', JSON.stringify(taskData, null, 2));
    
    const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
      method: 'PUT',  // Verwenden wir PUT anstatt PATCH, um den gesamten Task zu ersetzen
      headers: {
        'Content-Type': 'application/json',
        // Bei Bedarf: Authorization-Header, wenn Ihr Backend diesen erfordert
      },
      body: JSON.stringify(taskData),
    });
    
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    
    // Lesen Sie den Response-Body als Text, um ihn genau zu sehen
    const responseText = await response.text();
    console.log('Response-Text:', responseText);
    
    if (!response.ok) {
      console.error("Server-Antwort war nicht OK:", response.status, responseText);
      throw new Error(`Fehler beim Aktualisieren des Tasks: Status ${response.status}`);
    }
    
    // Versuchen Sie den Response-Text als JSON zu parsen, falls möglich
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Geparste Response-Daten:", responseData);
      return responseData;
    } catch (e) {
      console.log("Response konnte nicht als JSON geparst werden, gebe Text zurück");
      return responseText;
    }
  } catch (error) {
    console.error('API-Fehler bei updateTask:', error);
    throw error;
  }
}

// // /**
// //  * Task löschen
// //  * @param {string} id - Die ID des Tasks
// //  * @returns {Promise} - Leeres Promise bei Erfolg
// //  */
// // async function deleteTask(id) {
// //   try {
// //     const response = await fetch(`${API_URL}/tasks/${id}/`, {
// //       method: 'DELETE',
// //     });
    
// //     if (!response.ok) {
// //       throw new Error('Fehler beim Löschen des Tasks');
// //     }
    
// //     return true;
// //   } catch (error) {
// //     console.error('API-Fehler:', error);
// //     throw error;
// //   }
// // }

// // // Globale Verfügbarkeit
// // window.createTask = createTask;
// // window.getTasks = getTasks;
// // window.updateTask = updateTask;
// // window.deleteTask = deleteTask;

// // tasks-api.js
// // Nutzt die bestehende API_URL aus api-service.js

// if (typeof API_URL === 'undefined') {
//   const API_URL = 'http://localhost:8000/api';
// }

// // tasks-api.js
// // API-Funktionen für Task-Verwaltung

// // Globale API-URL definieren, falls noch nicht gesetzt
// if (typeof API_URL === 'undefined') {
//   const API_URL = 'http://localhost:8000/api';
// }

// /**
//  * Alle Tasks abrufen
//  * @returns {Promise} - Array mit allen Tasks
//  */
// async function getTasks() {
//   try {
//     console.log("Rufe alle Tasks ab...");
//     const response = await fetch(`${API_URL}/tasks/`);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server-Antwort war nicht OK:", response.status, errorText);
//       throw new Error(`Fehler beim Abrufen der Tasks: Status ${response.status}`);
//     }
    
//     const data = await response.json();
//     console.log(`${data.length} Tasks abgerufen`);
//     return data;
//   } catch (error) {
//     console.error('API-Fehler bei getTasks:', error);
//     throw error;
//   }
// }

// /**
//  * Einen einzelnen Task abrufen
//  * @param {number} id - Die ID des Tasks
//  * @returns {Promise} - Der Task-Datensatz
//  */
// async function getTask(id) {
//   try {
//     console.log(`Rufe Task mit ID ${id} ab...`);
//     const response = await fetch(`${API_URL}/tasks/${id}/`);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server-Antwort war nicht OK:", response.status, errorText);
//       throw new Error(`Fehler beim Abrufen des Tasks: Status ${response.status}`);
//     }
    
//     const data = await response.json();
//     console.log("Task abgerufen:", data);
//     return data;
//   } catch (error) {
//     console.error('API-Fehler bei getTask:', error);
//     throw error;
//   }
// }

// /**
//  * Einen neuen Task erstellen
//  * @param {Object} taskData - Die Task-Daten
//  * @returns {Promise} - Der erstellte Task mit ID
//  */
// async function createTask(taskData) {
//   try {
//     console.log("Erstelle neuen Task:", taskData);
    
//     const response = await fetch(`${API_URL}/tasks/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(taskData),
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("Server-Fehler:", errorData);
//       throw new Error(`Fehler beim Erstellen des Tasks: ${JSON.stringify(errorData)}`);
//     }
    
//     const createdTask = await response.json();
//     console.log("Task erstellt:", createdTask);
//     return createdTask;
//   } catch (error) {
//     console.error('API-Fehler bei createTask:', error);
//     throw error;
//   }
// }

// /**
//  * Einen Task aktualisieren
//  * @param {number} id - Die ID des Tasks
//  * @param {Object} taskData - Die aktualisierten Task-Daten
//  * @returns {Promise} - Der aktualisierte Task
//  */
// async function updateTask(id, taskData) {
//   try {
//     console.log(`Aktualisiere Task mit ID ${id}:`, taskData);
    
//     const response = await fetch(`${API_URL}/tasks/${id}/`, {
//       method: 'PUT', // Einige APIs verwenden auch PATCH
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(taskData),
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server-Fehler:", response.status, errorText);
//       throw new Error(`Fehler beim Aktualisieren des Tasks: Status ${response.status}`);
//     }
    
//     const updatedTask = await response.json();
//     console.log("Task aktualisiert:", updatedTask);
//     return updatedTask;
//   } catch (error) {
//     console.error('API-Fehler bei updateTask:', error);
//     throw error;
//   }
// }

// /**
//  * Einen Task löschen
//  * @param {number} id - Die ID des zu löschenden Tasks
//  * @returns {Promise} - True bei Erfolg
//  */
// async function deleteTask(id) {
//   try {
//     console.log(`Lösche Task mit ID ${id}...`);
    
//     const response = await fetch(`${API_URL}/tasks/${id}/`, {
//       method: 'DELETE',
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server-Fehler:", response.status, errorText);
//       throw new Error(`Fehler beim Löschen des Tasks: Status ${response.status}`);
//     }
    
//     console.log(`Task ${id} gelöscht`);
//     return true;
//   } catch (error) {
//     console.error('API-Fehler bei deleteTask:', error);
//     throw error;
//   }
// }

// /**
//  * Task-ID aus URL-Parameter abrufen
//  * @returns {number|null} - Die Task-ID oder null
//  */
// function getTaskIdFromUrl() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const id = urlParams.get('taskId');
//   return id ? parseInt(id) : null;
// }

// // Funktionen global verfügbar machen
// window.getTasks = getTasks;
// window.getTask = getTask;
// window.createTask = createTask;
// window.updateTask = updateTask;
// window.deleteTask = deleteTask;
// window.getTaskIdFromUrl = getTaskIdFromUrl;