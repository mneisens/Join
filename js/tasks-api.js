

// // /**
// //  * Erstellt einen neuen Task im Backend
// //  * @param {Object} taskData - Die Task-Daten
// //  * @returns {Promise} - Der erstellte Task mit ID
// //  */
async function createTask(taskData) {
  try {
    // Optionen inklusive Auth‑Header holen
    const options = getRequestOptions('POST', taskData);
    const response = await fetch(`${API_URL}/tasks/`, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fehler beim Erstellen des Tasks: ${response.status} ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API-Fehler bei createTask:', error);
    throw error;
  }
}

// Mach createTask global verfügbar, falls ihr es so importiert
window.createTask = createTask;


// // // Vereinfachte updateTask-Funktion
// // /**
// //  * Aktualisiert einen Task im Backend
// //  * @param {string} taskId - Die ID des Tasks
// //  * @param {Object} taskData - Die aktualisierten Task-Daten
// //  * @returns {Promise} - Der aktualisierte Task
// //  */
async function updateTask(taskId, updatedData) {
  try {
    // Options mit Auth‑Header und JSON‑Body
    const options = getRequestOptions('PATCH', updatedData);
    const response = await fetch(`${API_URL}/tasks/${taskId}/`, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status ${response.status} ${errorText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('API-Fehler bei updateTask:', err);
    throw err;
  }
}
