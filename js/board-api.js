// board-api.js
// Nutzt die bestehende API_URL aus api-service.js

// console.log("js geladen");
// import { getRequestOptions, API_URL } from './api-service.js';
/**
 * Lädt Tasks gruppiert nach Kanban-Kategorien
 * @returns {Promise} - Objekt mit Tasks nach Kategorien
 */

// const API_URL = window.API_URL || 'http://localhost:8000/api';


/**
 * Lädt Tasks gruppiert nach Kanban-Kategorien
 * @returns {Promise} - Objekt mit Tasks nach Kategorien
 */
async function getBoardTasks() {
    try {
        // Hole alle Tasks
        const options  = getRequestOptions('GET');
        const response = await fetch(`${API_URL}/tasks/`, options);
        
        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Board-Tasks');
        }
        
        // Gruppiere Tasks nach Kanban-Kategorie
        const tasks = await response.json();
        const groupedTasks = {
            Todo: [],
            InProgress: [],
            AwaitFeedback: [],
            Done: []
        };
        
        tasks.forEach(task => {
            const category = task.kanban_category || 'Todo';
            if (groupedTasks[category]) {
                groupedTasks[category].push(task);
            } else {
                // Fallback, falls die Kategorie nicht bekannt ist
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
/**
 * Ändert die Kanban-Kategorie eines Tasks (für Drag & Drop)
 * @param {number} taskId - Die ID des Tasks
 * @param {string} newCategory - Die neue Kanban-Kategorie
 * @returns {Promise} - Der aktualisierte Task
 */
/**
 * Ändert die Kanban-Kategorie eines Tasks (für Drag & Drop)
 * @param {number} taskId - Die ID des Tasks
 * @param {string} newCategory - Die neue Kanban-Kategorie
 * @returns {Promise} - Der aktualisierte Task
 */
async function updateTaskCategory(taskId, newCategory) {
    try {
      // console.log(`Versuche Task ${taskId} nach ${newCategory} zu verschieben...`);
      
      // Mapping von Frontend-Kategorien zu Backend-Kategorien
      // Versuchen wir verschiedene Formatierungen, da wir nicht wissen, was das Backend erwartet
      const categoryMapping = {
        "Todo": "Todo",                  // Original beibehalten
        "InProgress": "InProgress",      // Original beibehalten
        "AwaitFeedback": "AwaitFeedback",
        "Done": "Done"
      };
      
      // Verwende das Mapping oder behalte die originale Kategorie
      const formattedCategory = categoryMapping[newCategory] || newCategory;
      
      // console.log("Formatierte Kategorie:", formattedCategory);
      
      const requestData = {
        kanban_category: formattedCategory
      };
      
      // console.log("Gesendete Daten:", requestData);
      
      const options  = getRequestOptions('PATCH', requestData);
      const response = await fetch(`${API_URL}/tasks/${taskId}/`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server-Antwort:", response.status, errorText);
        throw new Error(`Fehler beim Aktualisieren der Task-Kategorie: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API-Fehler bei updateTaskCategory:', error);
      throw error;
    }
  }

  // Füge diese Funktion zur board-api.js hinzu
async function inspectTaskFormatting() {
    try {
      // Hole alle Tasks
      const options  = getRequestOptions();
const response = await fetch(`${API_URL}/tasks/`, options);
      
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Tasks');
      }
      
      const tasks = await response.json();
      
      if (tasks.length > 0) {
        console.log("Erste Task-Daten:", tasks[0]);
        console.log("Kanban-Kategorie-Format:", tasks[0].kanban_category);
        return tasks[0];
      } else {
        console.log("Keine Tasks gefunden");
      }
    } catch (error) {
      console.error('API-Fehler:', error);
    }
  }
  
  // Rufe diese Funktion beim Laden der Seite auf
  window.addEventListener('DOMContentLoaded', function() {
    inspectTaskFormatting().then(task => {
      console.log("Analyse der Task-Struktur abgeschlossen");
    });
  });
  // Globale Verfügbarkeit
  window.getBoardTasks = getBoardTasks;
  window.updateTaskCategory = updateTaskCategory;






  function formatAssignedToForFrontend(assignedTo) {
    if (!Array.isArray(assignedTo)) return [];
    return assignedTo.map(contact => {
      // Nur eine ID ⇒ kein name/color/initials
      const id = typeof contact === 'number'
                 ? contact
                 : parseInt(contact, 10);
      return { id, name: contact.name, color: contact.color, initials: contact.initials };
    });
  }

  window.getRequestOptions = getRequestOptions;