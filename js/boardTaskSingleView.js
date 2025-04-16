/**
 * This function fill the singel view task html with the data of the current task.
 *
 * @param {string} id - the firebase document id of the needed task
 */
function showTaskView(id) {
  let currentTask = boardGetTaskById(id);

  boardFillTaskWithCurrent(currentTask);

  document.getElementById("taskBgDiv").style.display = "flex";
  setTimeout(() => {
    document.getElementById("taskMainDiv").classList.add("visible");
  }, 120);
}

  
function hideTaskView() {
  document.getElementById("taskMainDiv").classList.remove("visible");
  setTimeout(() => {
    document.getElementById("taskBgDiv").style.display = "none";
  }, 120);
}

  
  /**
   * This function fill the singel view task html with the data of the current task.
   *
   * @param {JSON} task - current task
   */
  function boardFillTaskWithCurrent(task) {
    const taskConfig = returnConfigBoardCardHtml(task);
    document.getElementById("taskBgDiv").innerHTML =
      returnHtmlBoardTaskSingleView(task, taskConfig);
  
    boardRenderAssignedLine(task);
    renderBoardSingleViewSubtasks(task);
    boardTaskAddEventListener();
  }
  /**
   * It will render the subtasks to the single view html.
   *
   * @param {JSON} task - current task
   */
  function renderBoardSingleViewSubtasks(task) {
    document.getElementById("boardTaskSingleSubtasks").innerHTML = "";
  
    if (task.subtasks.length > 0) {
      let subtasksConfig = returnBoardSubtaskConfig(task);
  
      for (i = 0; i < task.subtasks.length; i++) {
        const subtask = task.subtasks[i];
        if (!subtask.done) {
          subtasksConfig.svgSrc = "/assets/symbols/Property 1=Default.svg";
        }
        document.getElementById("boardTaskSingleSubtasks").innerHTML +=
          returnHtmlBoardSubtask(subtask, subtasksConfig, i);
      }
    } else {
      document.getElementById("boardTaskSingleSubtasks").innerHTML =
        "No Subtasks";
    }
  }
  
  /**
   * Returns the configuration of the current subtask.
   *
   * @param {JSON} task - current subtask
   * @returns - json
   */
  function returnBoardSubtaskConfig(task) {
    let subtasksConfig = {
      amount: task.subtasks.length - 1,
      svgSrc: "/assets/symbols/Property 1=checked.svg",
      parentTaskId: task.taskId,
    };
    return subtasksConfig;
  }


/**
 * Ruft einen einzelnen Task anhand seiner ID ab
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
 * Subtask abhaken oder aktivieren
 * @param {string} taskId - ID des Tasks
 * @param {number} subtaskIndex - Index des Subtasks im Array
 * @param {boolean|null} newState - Optional: Neuer Status (true = erledigt, false = nicht erledigt, null = umschalten)
 */
async function boardClickSubtask(taskId, subtaskIndex, newState = null) {
  try {
    console.log(`boardClickSubtask: Task ${taskId}, Subtask Index ${subtaskIndex}, Neuer Status: ${newState}`);
    
    // Task mit der richtigen ID finden
    let task = boardGetTaskById(taskId);
    
    if (!task) {
      console.error(`Task mit ID ${taskId} nicht gefunden`);
      return;
    }
    
    // Sicherstellen, dass subtasks ein Array ist
    if (!Array.isArray(task.subtasks)) {
      console.error("Task hat keine Subtasks oder subtasks ist kein Array");
      task.subtasks = [];
      return;
    }
    
    // Sicherstellen, dass subtaskIndex gültig ist
    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      console.error(`Ungültiger Subtask-Index: ${subtaskIndex}`);
      return;
    }
    
    // Aktuellen Status ermitteln
    const currentState = task.subtasks[subtaskIndex].done || false;
    
    // Neuen Status bestimmen
    const targetState = (newState !== null) ? newState : !currentState;
    console.log(`Ändere Subtask-Status von ${currentState} zu ${targetState}`);
    
    // Status aktualisieren
    task.subtasks[subtaskIndex].done = targetState;
    
    // UI aktualisieren
    updateSubtaskCheckbox(taskId, subtaskIndex, targetState);
    
    // API-Anfrage vorbereiten
    const updateData = {
      header: task.header,
      description: task.description,
      due_date: formatDateForBackend(task.dueDate),
      priority: task.priority,
      category: task.category,
      kanban_category: task.kanbanCategory,
      subtasks: task.subtasks.map(subtask => {
        return {
          subtask: subtask.subtask || subtask.text || "",
          done: !!subtask.done
        };
      })
    };
    
    console.log("Sende Daten zum Aktualisieren des Subtasks:", updateData);
    
    // API-Aufruf
    const result = await updateTask(taskId, updateData);
    console.log("API-Ergebnis:", result);
    
    // Fortschrittsanzeige aktualisieren
    updateSubtaskProgress(taskId);
    
    return result;
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Subtasks:", error);
    return null;
  }
}


function updateSubtaskCheckbox(taskId, subtaskIndex, checked) {
  try {
    // Finde die Checkbox-Elemente basierend auf den Datenattributen
    const subtaskRow = document.querySelector(`[data-task-id="${taskId}"][data-subtask-index="${subtaskIndex}"]`);
    
    if (subtaskRow) {
      // Aktualisiere das Bild
      const checkboxImg = subtaskRow.querySelector('.board-task-single-subtask-checkbox img');
      if (checkboxImg) {
        checkboxImg.src = checked ? 
          "/assets/symbols/Property 1=checked.svg" : 
          "/assets/symbols/Property 1=Default.svg";
      }
      
      // Optional: Füge CSS-Klasse hinzu/entferne sie für zusätzliches Styling
      if (checked) {
        subtaskRow.classList.add('done');
      } else {
        subtaskRow.classList.remove('done');
      }
    }
  } catch (e) {
    console.warn("Konnte Checkbox in UI nicht aktualisieren:", e);
  }
}

  

  function updateSubtaskProgress(taskId) {
    const task = boardGetTaskById(taskId);
    if (!task || !Array.isArray(task.subtasks) || task.subtasks.length === 0) return;
    
    // Fortschritt berechnen
    const total = task.subtasks.length;
    const completed = task.subtasks.filter(subtask => subtask.done).length;
    const percent = Math.round((completed / total) * 100);
    
    // Fortschrittsanzeige in der Task-Detailansicht aktualisieren
    const progressBarInner = document.querySelector(`#subtask-progress-bar-${taskId} .progress-bar-inner`);
    const progressText = document.querySelector(`#subtask-progress-bar-${taskId} .progress-text`);
    
    if (progressBarInner) {
      progressBarInner.style.width = `${percent}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${completed}/${total} Subtasks`;
    }
  }

  async function boardLoadTasksFromBackend() {
    try {
      console.log("Lade Tasks vom Backend...");
      // Erste Option: Verwende den speziellen Board-Tasks Endpunkt
      const response = await getBoardTasks();
      console.log("Erhaltene Tasks:", response);
      
      // Konvertiere alle Tasks in das Frontend-Format
      boardTasks = [];
      
      // Füge alle Tasks aus jeder Kategorie in das boardTasks-Array ein
      if (response.Todo) {
        boardTasks = boardTasks.concat(response.Todo.map(task => formatTaskForFrontend(task)));
      }
      if (response.InProgress) {
        boardTasks = boardTasks.concat(response.InProgress.map(task => formatTaskForFrontend(task)));
      }
      if (response.AwaitFeedback) {
        boardTasks = boardTasks.concat(response.AwaitFeedback.map(task => formatTaskForFrontend(task)));
      }
      if (response.Done) {
        boardTasks = boardTasks.concat(response.Done.map(task => formatTaskForFrontend(task)));
      }
      
      console.log("Formatierte Tasks für Frontend:", boardTasks);
      loadBoardKanbanContainer(boardTasks);
    } catch (error) {
      console.error("Fehler beim Laden der Tasks:", error);
      // Fallback: Versuche alle Tasks zu laden, wenn der spezielle Endpunkt nicht funktioniert
      try {
        const tasks = await getTasks();
        boardTasks = tasks.map(task => formatTaskForFrontend(task));
        loadBoardKanbanContainer(boardTasks);
      } catch (fallbackError) {
        console.error("Auch der Fallback für das Laden der Tasks ist fehlgeschlagen:", fallbackError);
      }
    }
  }
  
  /**
   * This function used to interfere throw the 'assigned to' of the task, and render the
   * profilebadges as well as the names to the single view task html.
   *
   * @param {JSON} task - current task
   */
  function boardRenderAssignedLine(task) {
    for (i = 0; i < task.assignedTo.length; i++) {
      let initials = boardGetInitials(task.assignedTo[i].name);
      document.getElementById("boardTaskSingleViewAssigned").innerHTML +=
        returnHtmlBoardAssignedLine(task.assignedTo[i], initials);
    }
  }
  
  function setupSubtaskCheckboxListeners() {
    // Bestehende Event-Listener entfernen (falls vorhanden)
    document.removeEventListener('change', handleSubtaskCheckboxChange);
    
    // Neuen Event-Listener hinzufügen
    document.addEventListener('change', handleSubtaskCheckboxChange);
  }
  function handleSubtaskCheckboxChange(event) {
    const checkbox = event.target;
    
    // Prüfen, ob es sich um eine Subtask-Checkbox handelt
    if (checkbox.classList.contains('subtask-checkbox')) {
      const subtaskItem = checkbox.closest('[data-subtask-id]');
      const taskItem = checkbox.closest('[data-task-id]');
      
      if (subtaskItem && taskItem) {
        const subtaskId = parseInt(subtaskItem.dataset.subtaskId);
        const taskId = taskItem.dataset.taskId;
        
        // Subtask-Status aktualisieren
        boardClickSubtask(taskId, subtaskId, checkbox);
      }
    }
  }

  /**
   * The function used to add the Eventlistener. So the Eventlistener cound be loaded
   * with this function, afterall the html page is complete with loading.
   */
  function boardTaskAddEventListener() {
    const deleteDiv = document.getElementById("taskFooterDel");
    const deleteIcon = document.getElementById("deleteIcon");
  
    deleteDiv.addEventListener("mouseenter", () => {
      deleteIcon.src = "/assets/symbols/deleteHover.svg";
    });
  
    deleteDiv.addEventListener("mouseleave", () => {
      deleteIcon.src = "/assets/symbols/delete.svg";
    });
  
    const editDiv = document.getElementById("taskFooterEdit");
    const editIcon = document.getElementById("editIcon");
  
    editDiv.addEventListener("mouseenter", () => {
      editIcon.src = "/assets/symbols/editHover.svg";
    });
  
    editDiv.addEventListener("mouseleave", () => {
      editIcon.src = "/assets/symbols/edit.svg";
    });
  }
  
  /**
   * The function used to add the Eventlistener. So the Eventlistener cound be loaded
   * with this function, afterall the html page is complete with loading.
   */
  function boardKanbanAddEventListener() {
    const buttons = document.querySelectorAll(".board-kanban-add-btn");
  
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        button.src = "/assets/symbols/plus button mobile hover.svg";
      });
      button.addEventListener("mouseleave", () => {
        button.src = "/assets/symbols/plus button mobile.svg";
      });
    });
  }

  /**
 * Löscht einen Task aus dem Backend und aktualisiert die Ansicht
 * @param {string} taskId - Die ID des zu löschenden Tasks
 */
async function deleteTask(taskId) {
  try {
    console.log(`Task mit ID ${taskId} wird gelöscht...`);
    
    // API-Aufruf an das Backend
    const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fehler beim Löschen:", response.status, errorText);
      throw new Error(`Fehler beim Löschen des Tasks: ${response.status} ${errorText}`);
    }
    
    console.log(`Task ${taskId} erfolgreich gelöscht`);
    
    // UI aktualisieren
    hideTaskView();
    
    // Task aus lokalem Array entfernen
    boardTasks = boardTasks.filter(task => task.taskId != taskId);
    
    // Board neu rendern ohne API-Aufruf
    loadBoardKanbanContainer(boardTasks);
    
    // Optional: Erfolgsmeldung anzeigen
    // showSuccessMessage("Task wurde gelöscht");
    
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
    alert("Beim Löschen des Tasks ist ein Fehler aufgetreten.");
  }
}

function formatDateForBackend(dateStr) {
  if (!dateStr) return "";
  
  // Wenn das Datum bereits im Format YYYY-MM-DD ist
  if (dateStr.includes("-")) return dateStr;
  
  // Konvertierung von DD/MM/YYYY zu YYYY-MM-DD
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}