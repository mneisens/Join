/**
 * Lädt Tasks gruppiert nach Kanban-Kategorien
 * @returns {Promise} - Objekt mit Tasks nach Kategorien
 */
async function getBoardTasks() {
    try {
        let options  = getRequestOptions('GET');
        let response = await fetch(`${API_URL}/tasks/`, options);
        
        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Board-Tasks');
        }
        
        let tasks = await response.json();
        let groupedTasks = {
            Todo: [],
            InProgress: [],
            AwaitFeedback: [],
            Done: []
        };
        
        tasks.forEach(task => {
            let category = task.kanban_category || 'Todo';
            if (groupedTasks[category]) {
                groupedTasks[category].push(task);
            } else {
                groupedTasks.Todo.push(task);
            }
        });
        
        return groupedTasks;
    } catch (error) {
        console.error('API-Fehler:', error);
        throw error;
    }
}
  

/**
 * Ändert die Kanban-Kategorie eines Tasks (für Drag & Drop)
 * @param {number} taskId - Die ID des Tasks
 * @param {string} newCategory - Die neue Kanban-Kategorie
 * @returns {Promise} - Der aktualisierte Task
 */
async function updateTaskCategory(taskId, newCategory) {
    try {
      let categoryMapping = {
        "Todo": "Todo",                  
        "InProgress": "InProgress",      
        "AwaitFeedback": "AwaitFeedback",
        "Done": "Done"
      };
      let formattedCategory = categoryMapping[newCategory] || newCategory;      
      let requestData = {
        kanban_category: formattedCategory
      };
      let options  = getRequestOptions('PATCH', requestData);
      let response = await fetch(`${API_URL}/tasks/${taskId}/`, options);
      
      if (!response.ok) {
        let errorText = await response.text();
        console.error("Server-Antwort:", response.status, errorText);
        throw new Error(`Fehler beim Aktualisieren der Task-Kategorie: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API-Fehler bei updateTaskCategory:', error);
      throw error;
    }
  }


async function inspectTaskFormatting() {
    try {
      let options  = getRequestOptions();
let response = await fetch(`${API_URL}/tasks/`, options);
      
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Tasks');
      }
      
      let tasks = await response.json();
      
      if (tasks.length > 0) {
        return tasks[0];
      } else {
      }
    } catch (error) {
    }
  }

  window.addEventListener('DOMContentLoaded', function() {
    inspectTaskFormatting().then(task => {

    });
  });

  window.getBoardTasks = getBoardTasks;
  window.updateTaskCategory = updateTaskCategory;


  function formatAssignedToForFrontend(assignedTo) {
    if (!Array.isArray(assignedTo)) return [];
    return assignedTo.map(contact => {
      let id = typeof contact === 'number'
                 ? contact
                 : parseInt(contact, 10);
      return { id, name: contact.name, color: contact.color, initials: contact.initials };
    });
  }

  window.getRequestOptions = getRequestOptions;