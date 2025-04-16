// // tasks-api.js
// // const API_URL = 'http://localhost:8000/api';

// /**
//  * Erstellt einen neuen Task im Backend
//  * @param {Object} taskData - Die Task-Daten
//  * @returns {Promise} - Der erstellte Task mit ID
//  */
// async function createTask(taskData) {
//   try {
//     const response = await fetch(`${API_URL}/tasks/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(taskData),
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Fehler beim Erstellen des Tasks: ${JSON.stringify(errorData)}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('API-Fehler:', error);
//     throw error;
//   }
// }

// /**
//  * Ruft alle Tasks vom Backend ab
//  * @returns {Promise} - Array mit allen Tasks
//  */
// async function getTasks() {
//   try {
//     console.log("API-Aufruf: Tasks abrufen");
//     const response = await fetch(`${API_URL}/tasks/`);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Server-Antwort war nicht OK:", response.status, errorText);
//       throw new Error(`Fehler beim Abrufen der Tasks: Status ${response.status}`);
//     }
    
//     const data = await response.json();
//     console.log("API-Antwort Tasks:", data);
//     return data;
//   } catch (error) {
//     console.error('API-Fehler bei getTasks:', error);
//     throw error;
//   }
// }

// // Vereinfachte updateTask-Funktion
// /**
//  * Aktualisiert einen Task im Backend
//  * @param {string} taskId - Die ID des Tasks
//  * @param {Object} taskData - Die aktualisierten Task-Daten
//  * @returns {Promise} - Der aktualisierte Task
//  */
// async function updateTask(taskId, taskData) {
//   try {
//     console.log(`Sende Task-Update an Backend für ID ${taskId}`);
//     console.log('Request-URL:', `${API_URL}/tasks/${taskId}/`);
//     console.log('Request-Methode:', 'PUT');
//     console.log('Request-Daten:', JSON.stringify(taskData, null, 2));
    
//     const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
//       method: 'PUT',  // Verwenden wir PUT anstatt PATCH, um den gesamten Task zu ersetzen
//       headers: {
//         'Content-Type': 'application/json',
//         // Bei Bedarf: Authorization-Header, wenn Ihr Backend diesen erfordert
//       },
//       body: JSON.stringify(taskData),
//     });
    
//     console.log('Response Status:', response.status);
//     console.log('Response OK:', response.ok);
    
//     // Lesen Sie den Response-Body als Text, um ihn genau zu sehen
//     const responseText = await response.text();
//     console.log('Response-Text:', responseText);
    
//     if (!response.ok) {
//       console.error("Server-Antwort war nicht OK:", response.status, responseText);
//       throw new Error(`Fehler beim Aktualisieren des Tasks: Status ${response.status}`);
//     }
    
//     // Versuchen Sie den Response-Text als JSON zu parsen, falls möglich
//     let responseData;
//     try {
//       responseData = JSON.parse(responseText);
//       console.log("Geparste Response-Daten:", responseData);
//       return responseData;
//     } catch (e) {
//       console.log("Response konnte nicht als JSON geparst werden, gebe Text zurück");
//       return responseText;
//     }
//   } catch (error) {
//     console.error('API-Fehler bei updateTask:', error);
//     throw error;
//   }
// }

// /**
//  * Task löschen
//  * @param {string} id - Die ID des Tasks
//  * @returns {Promise} - Leeres Promise bei Erfolg
//  */
// async function deleteTask(id) {
//   try {
//     const response = await fetch(`${API_URL}/tasks/${id}/`, {
//       method: 'DELETE',
//     });
    
//     if (!response.ok) {
//       throw new Error('Fehler beim Löschen des Tasks');
//     }
    
//     return true;
//   } catch (error) {
//     console.error('API-Fehler:', error);
//     throw error;
//   }
// }

// // Globale Verfügbarkeit
// window.createTask = createTask;
// window.getTasks = getTasks;
// window.updateTask = updateTask;
// window.deleteTask = deleteTask;

// tasks-api.js
// Nutzt die bestehende API_URL aus api-service.js

if (typeof API_URL === 'undefined') {
  const API_URL = 'http://localhost:8000/api';
}

/**
* Holt alle Tasks vom Server
* @returns {Promise} - Array aller Tasks
*/
async function getTasks() {
  try {
      const response = await fetch(`${API_URL}/tasks/`);
      
      if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Tasks');
      }
      
      return await response.json();
  } catch (error) {
      console.error('API-Fehler:', error);
      throw error;
  }
}

/**
* Holt einen einzelnen Task anhand seiner ID
* @param {number} id - Die ID des Tasks
* @returns {Promise} - Der abgerufene Task
*/
async function getTask(id) {
  try {
      const response = await fetch(`${API_URL}/tasks/${id}/`);
      
      if (!response.ok) {
          throw new Error(`Fehler beim Abrufen des Tasks mit ID ${id}`);
      }
      
      return await response.json();
  } catch (error) {
      console.error('API-Fehler:', error);
      throw error;
  }
}

/**
* Erstellt einen neuen Task
* @param {Object} taskData - Die Task-Daten
* @returns {Promise} - Der erstellte Task mit ID
*/
async function createTask(taskData) {
  try {
      // Daten für das Backend formatieren
      const formattedData = formatTaskForBackend(taskData);
      
      const response = await fetch(`${API_URL}/tasks/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
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

/**
* Aktualisiert einen bestehenden Task
* @param {number} id - Die ID des Tasks
* @param {Object} taskData - Die aktualisierten Task-Daten
* @returns {Promise} - Der aktualisierte Task
*/
async function updateTask(id, taskData) {
  try {
      console.log(`Aktualisiere Task mit ID ${id}:`, taskData);
      
      // Daten für das Backend formatieren
      const formattedData = formatTaskForBackend(taskData);
      
      console.log("Formatierte Daten für Backend:", formattedData);
      
      const response = await fetch(`${API_URL}/tasks/${id}/`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
          const errorText = await response.text();
          console.error("Server antwortete mit Status:", response.status, errorText);
          throw new Error(`Fehler beim Aktualisieren des Tasks: Status ${response.status}`);
      }
      
      return await response.json();
  } catch (error) {
      console.error('API-Fehler:', error);
      throw error;
  }
}

/**
* Formatiert Task-Daten für das Backend
* @param {Object} task - Die Task-Daten im Frontend-Format
* @returns {Object} - Die Task-Daten im Backend-Format
*/
function formatTaskForBackend(task) {
  // Wenn das Datum im Format DD/MM/YYYY ist, konvertiere es zu YYYY-MM-DD
  let dueDate = task.dueDate || task.due_date || '';
  if (dueDate.includes('/')) {
      const [day, month, year] = dueDate.split('/');
      dueDate = `${year}-${month}-${day}`;
  } else if (dueDate.includes('-')) {
      // Wenn das Datum bereits im Format YYYY-MM-DD ist, behalte es bei
      dueDate = task.dueDate || task.due_date;
  }
  
  // Formatiere assigned_to für das Backend
  let assignedTo = [];
  if (Array.isArray(task.assignedTo) || Array.isArray(task.assigned_to)) {
      assignedTo = (task.assignedTo || task.assigned_to).map(person => {
          if (typeof person === 'object') {
              return {
                  name: person.name,
                  color: person.color || person.bg || getRandomColor(),
                  initials: person.initials || getInitialsFromName(person.name)
              };
          }
          return {
              name: `Person ${person}`,
              color: getRandomColor(),
              initials: "??"
          };
      });
  }
  
  // Formatiere subtasks für das Backend
  let subtasks = [];
  if (Array.isArray(task.subtasks)) {
      subtasks = task.subtasks.map(subtask => {
          if (typeof subtask === 'object') {
              return {
                  subtask: subtask.subtask || subtask.text || "",
                  done: !!subtask.done
              };
          }
          return {
              subtask: String(subtask),
              done: false
          };
      });
  }
  
  // Stelle sicher, dass alle erwarteten Felder vorhanden sind
  return {
      header: task.header || "",
      description: task.description || "",
      due_date: dueDate,
      priority: task.priority || "medium",
      category: task.category || "User Story",
      kanban_category: task.kanbanCategory || task.kanban_category || "Todo",
      assigned_to: assignedTo,
      subtasks: subtasks
  };
}

/**
* Hilfsfunktion zum Extrahieren der Initialen aus einem Namen
* @param {string} name - Der vollständige Name
* @returns {string} - Die Initialen (1-2 Zeichen)
*/
function getInitialsFromName(name) {
  if (!name) return "?";
  
  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length === 0) return "?";
  
  if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
  }
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
}

/**
* Hilfsfunktion für zufällige Farben
* @returns {string} - Eine zufällige Farbe als Hex-Wert
*/
function getRandomColor() {
  const colors = [
      "#FF7A00", "#FF5EB3", "#9327FF", "#00BEE8", "#1FD7C1", 
      "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Globale Verfügbarkeit
window.getTasks = getTasks;
window.getTask = getTask;
window.createTask = createTask;
window.updateTask = updateTask;