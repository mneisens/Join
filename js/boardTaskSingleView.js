/**
 * Zeigt die Detailansicht einer Task an
 * @param {string} id - ID der Task
 */
async function showTaskView(id) {
  try {
    // Task-Daten abrufen
    let currentTask = boardGetTaskById(id);
    
    if (!currentTask) {
      console.error(`Keine Task mit ID ${id} gefunden`);
      return;
    }

    // Prüfen, ob die zugewiesenen Kontakte vervollständigt werden müssen
    if (Array.isArray(currentTask.assignedTo) && currentTask.assignedTo.length > 0) {
      // Prüfen, ob es sich um IDs oder unvollständige Objekte handelt
      const needsFullContacts = currentTask.assignedTo.some(contact => 
        typeof contact === 'number' || 
        typeof contact === 'string' || 
        (typeof contact === 'object' && !contact.name)
      );
      
      if (needsFullContacts) {
        // Alle Kontakte vom Server laden
        const allContacts = await getContacts();
        
        // Die assignedTo-Werte mit vollständigen Kontaktobjekten ersetzen
        currentTask.assignedTo = currentTask.assignedTo.map(contactRef => {
          // ID extrahieren
          const contactId = typeof contactRef === 'object' ? contactRef.id : contactRef;
          
          // Passenden Kontakt finden
          const fullContact = allContacts.find(c => c.id == contactId);
          
          if (fullContact) {
            console.log(
              `Kontakt gefunden: ${fullContact.name} (${fullContact.id})`,
              `E-Mail: ${fullContact.email}, Telefon: ${fullContact.phone}`,
              `Farbe: ${fullContact.color}, Initialen: ${fullContact.initials}`,
            );
            
            return {
              id: fullContact.id,
              name: fullContact.name,
              email: fullContact.email,
              phone: fullContact.phone,
              color: fullContact.color || getRandomColor(),
              initials: fullContact.initials || getInitialsFromName(fullContact.name)
            };
          } else {
            // Fallback, wenn kein passender Kontakt gefunden wurde
            return {
              id: contactId,
              name: `Kontakt ${contactId}`,
              color: getRandomColor(),
              initials: "??"
            };
          }
        });
      }
    }
    
    // Task-Ansicht mit vollständigen Daten anzeigen
    boardFillTaskWithCurrent(currentTask);
    
    // UI-Elemente anzeigen
    document.getElementById("taskBgDiv").style.display = "flex";
    setTimeout(() => {
      document.getElementById("taskMainDiv").classList.add("visible");
    }, 120);
  } catch (error) {
    console.error("Fehler beim Anzeigen der Task:", error);
  }
}

/**
 * Schließt die Task-Detailansicht
 */
function hideTaskView() {
  document.getElementById("taskMainDiv").classList.remove("visible");
  setTimeout(() => {
    document.getElementById("taskBgDiv").style.display = "none";
  }, 120);
  loadBoardKanbanContainer(boardTasks);
}

/**
 * Generiert die Detailansicht für eine Task
 * @param {Object} task - Die anzuzeigende Task
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
 * Rendert die Subtasks in der Detailansicht
 * @param {Object} task - Die anzuzeigende Task
 */
function renderBoardSingleViewSubtasks(task) {
  const container = document.getElementById("boardTaskSingleSubtasks");
  container.innerHTML = "";

  if (task.subtasks && task.subtasks.length > 0) {
    let subtasksConfig = returnBoardSubtaskConfig(task);

    for (let i = 0; i < task.subtasks.length; i++) {
      const subtask = task.subtasks[i];
      if (!subtask.done) {
        subtasksConfig.svgSrc = "/assets/symbols/Property 1=Default.svg";
      } else {
        subtasksConfig.svgSrc = "/assets/symbols/Property 1=checked.svg";
      }
      container.innerHTML += returnHtmlBoardSubtask(subtask, subtasksConfig, i);
    }
  } else {
    container.innerHTML = "No Subtasks";
  }
}

/**
 * Erstellt die Konfiguration für Subtasks
 * @param {Object} task - Die aktuelle Task
 * @returns {Object} Konfigurationsobjekt für Subtasks
 */
function returnBoardSubtaskConfig(task) {
  return {
    amount: task.subtasks.length - 1,
    svgSrc: "/assets/symbols/Property 1=checked.svg",
    parentTaskId: task.taskId,
  };
}

/**
 * Aktualisiert den Status eines Subtasks
 * @param {string} taskId - ID der Task
 * @param {number} subtaskIndex - Index des Subtasks
 * @param {boolean|null} newState - Neuer Status oder null für Umschaltung
 */
async function boardClickSubtask(taskId, subtaskIndex, newState = null) {
  try {
    // Task finden
    let task = boardGetTaskById(taskId);
    
    if (!task || !Array.isArray(task.subtasks) || subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      console.error(`Ungültiger Task oder Subtask-Index: ${taskId}, ${subtaskIndex}`);
      return;
    }
    
    // Status ändern
    const currentState = task.subtasks[subtaskIndex].done || false;
    const targetState = (newState !== null) ? newState : !currentState;
    
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
      subtasks: task.subtasks.map(subtask => ({
        subtask: subtask.subtask || subtask.text || "",
        done: !!subtask.done
      }))
    };
    
    // API-Aufruf
    const result = await updateTask(taskId, updateData);
    
    // Fortschrittsanzeige aktualisieren
    updateSubtaskProgress(taskId);
    
    return result;
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Subtasks:", error);
    return null;
  }
}

/**
 * Aktualisiert die Checkbox-Darstellung eines Subtasks
 * @param {string} taskId - ID der Task
 * @param {number} subtaskIndex - Index des Subtasks
 * @param {boolean} checked - Ist der Subtask erledigt?
 */
function updateSubtaskCheckbox(taskId, subtaskIndex, checked) {
  try {
    const subtaskRow = document.querySelector(`[data-task-id="${taskId}"][data-subtask-index="${subtaskIndex}"]`);
    
    if (subtaskRow) {
      const checkboxImg = subtaskRow.querySelector('.board-task-single-subtask-checkbox img');
      if (checkboxImg) {
        checkboxImg.src = checked ? 
          "/assets/symbols/Property 1=checked.svg" : 
          "/assets/symbols/Property 1=Default.svg";
      }
      
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

/**
 * Aktualisiert die Fortschrittsanzeige einer Task
 * @param {string} taskId - ID der Task
 */
function updateSubtaskProgress(taskId) {
  const task = boardGetTaskById(taskId);
  if (!task || !Array.isArray(task.subtasks) || task.subtasks.length === 0) return;
  
  // Fortschritt berechnen
  const total = task.subtasks.length;
  const completed = task.subtasks.filter(subtask => subtask.done).length;
  const percent = Math.round((completed / total) * 100);
  
  // Fortschrittsanzeige aktualisieren
  const progressBarInner = document.querySelector(`#subtask-progress-bar-${taskId} .progress-bar-inner`);
  const progressText = document.querySelector(`#subtask-progress-bar-${taskId} .progress-text`);
  
  if (progressBarInner) {
    progressBarInner.style.width = `${percent}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${completed}/${total} Subtasks`;
  }
}

/**
 * Rendert die zugewiesenen Kontakte in der Task-Detailansicht
 * @param {Object} task - Die anzuzeigende Task
 */
function boardRenderAssignedLine(task) {
  // Container für zugewiesene Kontakte finden
  const container = document.getElementById("boardTaskSingleViewAssigned");
  if (!container) {
    console.error("Container für zugewiesene Kontakte nicht gefunden");
    return;
  }
  
  // Container leeren
  container.innerHTML = '';
  
  // Prüfen, ob Kontakte vorhanden sind
  if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
    // Debug-Ausgabe
    console.log("Zugewiesene Kontakte:", task.assignedTo);
    
    // Für jeden Kontakt ein Element erstellen
    task.assignedTo.forEach(contact => {
      // Name und Initialen extrahieren oder Fallback verwenden
      const name = contact.name || `Kontakt ${contact.id}`;
      let initials = contact.initials || '';
      
      // Wenn keine Initialen vorhanden, aus dem Namen erzeugen
      if (!initials && name) {
        initials = getInitialsFromName(name);
      }
      
      // Farbe extrahieren oder Fallback verwenden
      const color = contact.color || getRandomColor();
      
      // HTML für den Kontakt hinzufügen
      container.innerHTML += `
        <div class="task-assigned-users-div">
          <div class="task-assigned-user-main">
            <div class="task-assigned-user-inner">
              <div class="board-profile-badge" style="background-color: ${color};">${initials}</div>
              <span>${name}</span>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    // Nachricht anzeigen, wenn keine Kontakte zugewiesen sind
    container.innerHTML = '<div class="task-assigned-users-div"><p>Keine Kontakte zugewiesen</p></div>';
  }
}
/**
 * Fügt Event-Listener zu den Task-Elementen hinzu
 */
function boardTaskAddEventListener() {
  const deleteDiv = document.getElementById("taskFooterDel");
  const deleteIcon = document.getElementById("deleteIcon");
  const editDiv = document.getElementById("taskFooterEdit");
  const editIcon = document.getElementById("editIcon");

  if (deleteDiv && deleteIcon) {
    deleteDiv.addEventListener("mouseenter", () => {
      deleteIcon.src = "/assets/symbols/deleteHover.svg";
    });
  
    deleteDiv.addEventListener("mouseleave", () => {
      deleteIcon.src = "/assets/symbols/delete.svg";
    });
  }

  if (editDiv && editIcon) {
    editDiv.addEventListener("mouseenter", () => {
      editIcon.src = "/assets/symbols/editHover.svg";
    });
  
    editDiv.addEventListener("mouseleave", () => {
      editIcon.src = "/assets/symbols/edit.svg";
    });
  }
}

/**
 * Löscht eine Task
 * @param {string} taskId - ID der zu löschenden Task
 */
async function deleteTask(taskId) {
  try {
    // getRequestOptions fügt Content‑Type & Authorization-Header hinzu
    const options  = getRequestOptions('DELETE');
    const response = await fetch(`${API_URL}/tasks/${taskId}/`, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fehler beim Löschen des Tasks: ${response.status} ${errorText}`);
    }
    
    // UI aktualisieren
    hideTaskView();
    boardTasks = boardTasks.filter(task => task.taskId != taskId);
    loadBoardKanbanContainer(boardTasks);
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
    alert("Beim Löschen des Tasks ist ein Fehler aufgetreten.");
  }
}
/**
 * Formatiert ein Datum für das Backend
 * @param {string} dateStr - Datum im Format DD/MM/YYYY
 * @returns {string} Datum im Format YYYY-MM-DD
 */
function formatDateForBackend(dateStr) {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
  
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

