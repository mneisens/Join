

// // /**
// //  * Erstellt einen neuen Task im Backend
// //  * @param {Object} taskData - Die Task-Daten
// //  * @returns {Promise} - Der erstellte Task mit ID
// //  */
async function createTask(taskData) {
  try {
    const response = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Fehler beim Erstellen des Tasks: ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API-Fehler:', error);
    throw error;
  }
}


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
