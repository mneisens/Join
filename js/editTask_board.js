/**
 * Weist Kontakte im Edit-Formular zu
 * @param {Array} assignedTo - Array mit zugewiesenen Kontakten
 */
function assignContactsInEditForm(assignedToIds) {
    let badgeContainer = document.getElementById("showName");
    badgeContainer.innerHTML = "";       
  
    assignedToIds.forEach(id => {
      let checkbox = document.querySelector(`.category-checkbox[data-id="${id}"]`);
      if (!checkbox) return;
      checkbox.checked = true;
      checkbox.closest(".option").classList.add("active");
      let color    = checkbox.dataset.color;
      let initials = checkbox.dataset.initials;
      let badge    = document.createElement("div");
      badge.className = "abbreviation-badge";
      badge.textContent = initials;
      badge.style.cssText = `
        background-color: ${color};
        color: white;
        padding: 5px 10px;
        border-radius: 50%;
        margin: 2px;
        display: inline-block;
      `;
      badgeContainer.appendChild(badge);
    });

    window.currentAssignedContacts = assignedToIds.slice();
  }
  

/**
 * Überschreibe die updateSelectedAbbreviations-Funktion, um bestehende Badges zu erhalten
 */
// behalte Dir das Original, falls Du es im "Add‑Task‑Modus" noch brauchst:
/**
 * Zeigt für jede angehak­te Kontakt‑Checkbox ein Badge mit den Initialen an.
 * Läuft in Add‑ und in Edit‑Modus.
 */
window.updateSelectedAbbreviations = function() {
    let container = document.getElementById("showName");
    container.innerHTML = "";  // alte Badges löschen
    document.querySelectorAll(".category-checkbox:checked").forEach(cb => {
      let badge = document.createElement("div");
      badge.className = "abbreviation-badge";
      badge.textContent = cb.dataset.initials;
      badge.style.cssText = `
        background-color: ${cb.dataset.color};
        color: white;
        padding: 4px 8px;
        border-radius: 50%;
        margin: 2px;
        display: inline-block;
      `;
      container.appendChild(badge);
    });
  
    window.currentAssignedContacts = Array.from(
      document.querySelectorAll(".category-checkbox:checked")
    ).map(cb => parseInt(cb.dataset.id, 10));
  };
  

/**
 * Flag indicating if add task form is in edit mode
 */
let addTaskInEditMode = false;
let editTaskId = null;
let editTaskSubtasks = [];

/**
 * Initialize edit mode for a task
 * @param {string} id - ID of the task to edit
 */
/**
 * Initialize edit mode for a task
 * @param {string} id - ID of the task to edit
 */
async function initEditTask(id) {
    addTaskInEditMode = true;
    editTaskId = id;
    window.currentAssignedContacts = [];
    let bg = document.getElementById("boardAddTaskMainBg");
    bg.classList.remove("d-none");
    document.getElementById("boardHeadAddTask").innerText = "Edit Task";
    await loadCategories();
    let task = boardGetTaskById(id);
    if (!task) return console.error("Task nicht gefunden:", id);
    document.getElementById("input-title-addTask").value = task.header;
    document.getElementById("textarea-addTask").value   = task.description;
    setDateInEditForm(task.dueDate);
    setPriorityInEditForm(task.priority);
    document.getElementById("category").value           = task.category;
    loadSubtasksInEditForm(task);
    bg.dataset.category                               = task.kanbanCategory;
    editTaskSubtasks                                 = JSON.parse(JSON.stringify(task.subtasks || []));
    document.getElementById("saveTasks").style.display      = "none";
    document.getElementById("submitEditTask").style.display = "flex";
    document.getElementById("clearButton").style.display    = "none";
    assignContactsInEditForm(task.assignedTo.map(c => c.id));
  }
  


/**
 * Setzt das Datum im Edit-Formular
 * @param {string} dueDate - Fälligkeitsdatum im Format "DD/MM/YYYY"
 */
function setDateInEditForm(dueDate) {
    if (!dueDate) return;
    
    try {
        let parts = dueDate.split('/');
        if (parts.length === 3) {
            let formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            document.getElementById("date-addTask").value = formattedDate;
        }
    } catch (error) {
        console.error("Fehler beim Setzen des Datums:", error);
    }
}

/**
 * Setzt die Priorität im Edit-Formular
 * @param {string} priority - Priorität (urgent, medium, low)
 */
function setPriorityInEditForm(priority) {
    try {
        let buttons = document.querySelectorAll(".prio-addTask button");
        buttons.forEach(button => {
            button.classList.remove("active", "prio-btn-active");
            button.style.backgroundColor = "";
            button.setAttribute("value", "false");
        });
        
        // Die Bilder zurücksetzen
        document.getElementById("prio-up-orange").classList.remove("d-none");
        document.getElementById("prio-medium-ye").classList.remove("d-none");
        document.getElementById("prio-down-green").classList.remove("d-none");
        document.getElementById("prio-up-white").classList.add("d-none");
        document.getElementById("prio-medium-white").classList.add("d-none");
        document.getElementById("prio-down-white").classList.add("d-none");

        let selectedButton = document.getElementById(priority);
        if (selectedButton) {
            selectedButton.classList.add("active", "prio-btn-active");
            selectedButton.setAttribute("value", "true");
            if (priority === "urgent") {
                selectedButton.style.backgroundColor = "rgba(255, 61, 0, 1)";
                document.getElementById("prio-up-orange").classList.add("d-none");
                document.getElementById("prio-up-white").classList.remove("d-none");
            } else if (priority === "medium") {
                selectedButton.style.backgroundColor = "rgba(255, 168, 0, 1)";
                document.getElementById("prio-medium-ye").classList.add("d-none");
                document.getElementById("prio-medium-white").classList.remove("d-none");
            } else if (priority === "low") {
                selectedButton.style.backgroundColor = "rgba(122, 226, 41, 1)";
                document.getElementById("prio-down-green").classList.add("d-none");
                document.getElementById("prio-down-white").classList.remove("d-none");
            }
            
            selectedButton.classList.add("btn-font");
        } else {
            let mediumButton = document.getElementById("medium");
            mediumButton.classList.add("active", "prio-btn-active");
            mediumButton.setAttribute("value", "true");
            mediumButton.style.backgroundColor = "rgba(255, 168, 0, 1)";
            document.getElementById("prio-medium-ye").classList.add("d-none");
            document.getElementById("prio-medium-white").classList.remove("d-none");
            mediumButton.classList.add("btn-font");
        }
    } catch (error) {
        console.error("Fehler beim Setzen der Priorität:", error);
    }
}

/**
 * Lädt die Subtasks in das Edit-Formular
 * @param {Object} task - Der zu bearbeitende Task
 */
function loadSubtasksInEditForm(task) {
    try {
        let subtasksContainer = document.getElementById("addedTasks");
        subtasksContainer.innerHTML = "";
        
        if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
            task.subtasks.forEach((subtask, index) => {
                let subtaskText = subtask.subtask || subtask.text || "";
                let subtaskElement = document.createElement("li");
                subtaskElement.className = "one-subtask";
                subtaskElement.id = index;
                subtaskElement.innerHTML = `
                    <span class="subtask-text">• ${escapeHTML(subtaskText)}</span>
                    <div class="subtask-icons">
                        <img src="/assets/img/contacts/edit.png" alt="Bearbeiten" class="edit-icon">
                        <img src="/assets/img/contacts/delete.png" alt="Löschen" class="delete-icon">
                    </div>
                `;
                subtasksContainer.appendChild(subtaskElement);
            });
        }
    } catch (error) {
        console.error("Fehler beim Laden der Subtasks:", error);
    }
}

/**
 * Erstellt Badges für Kontakte
 * @param {Array} contacts - Array mit Kontakten
 * @param {HTMLElement} container - Container für die Badges
 */
function createContactBadges(contacts, container) {
    if (!container || !Array.isArray(contacts)) return;
    
    contacts.forEach(contact => {
        // Initialen ermitteln (mit besserer Fehlerbehandlung)
        let initials = "??";
        if (contact.initials) {
            initials = contact.initials;
        } else if (contact.name) {
            initials = getInitialsFromName(contact.name);
        } else if (typeof contact === 'object' && contact !== null) {
            let nameSource = contact.fullName || contact.userName || contact.email || "";
            if (nameSource) {
                initials = getInitialsFromName(nameSource);
            }
        }
        
        let color = contact.color || getRandomColor();
        let badge = document.createElement("div");
        badge.className = "abbreviation-badge";
        badge.textContent = initials;
        badge.style.backgroundColor = color;
        badge.style.color = "white";
        badge.style.padding = "5px 10px";
        badge.style.borderRadius = "50%";
        badge.style.margin = "2px";
        badge.style.display = "inline-block";
        
        // Daten-Attribute für spätere Identifikation
        if (contact.id) badge.dataset.contactId = contact.id;
        if (contact.name) badge.dataset.contactName = contact.name;
        
        container.appendChild(badge);
    });
}

/**
 * Hilfsfunktion um Initialen aus einem Namen zu extrahieren
 */
function getInitialsFromName(fullName) {
    if (!fullName) return "??";
    
    // Spezialfall für Namen mit Titeln (Dr., Prof., etc.)
    if (fullName.includes(".")) {
        // Entferne Titel wie "Dr." oder "Prof."
        fullName = fullName.replace(/^[^a-zA-Z]*[a-zA-Z]+\.\s*/g, "");
    }
    
    let names = fullName.trim().split(/\s+/);
    let firstInitial = names[0] ? names[0].charAt(0).toUpperCase() : '';
    let secondInitial = '';
    
    if (names.length > 1) {
        secondInitial = names[names.length - 1].charAt(0).toUpperCase();
    }
    
    return (firstInitial + secondInitial) || "??";
}

/**
 * Ändert einen Subtask im Edit-Modus
 * @param {string|number} subtaskId - ID oder Index des Subtasks
 * @param {string} action - "add", "edit", "delete"
 * @param {string} newText - Neuer Text für den Subtask (bei add/edit)
 * @returns {string|number} - ID des neuen/bearbeiteten Subtasks
 */
function editTaskChangeSubtask(subtaskId, action, newText) {
    // Wenn editTaskSubtasks nicht existiert, initialisieren
    if (!Array.isArray(editTaskSubtasks)) {
        editTaskSubtasks = [];
    }
    
    switch (action) {
        case "add":
            // Neuen Subtask hinzufügen
            let newId = editTaskSubtasks.length;
            editTaskSubtasks.push({
                subtask: newText,
                done: false
            });
            return newId;
            
        case "edit":
            // Subtask bearbeiten
            let index = parseInt(subtaskId, 10);
            if (!isNaN(index) && index >= 0 && index < editTaskSubtasks.length) {
                editTaskSubtasks[index].subtask = newText;
            }
            return subtaskId;
            
        case "delete":
            // Subtask löschen
            let deleteIndex = parseInt(subtaskId, 10);
            if (!isNaN(deleteIndex) && deleteIndex >= 0 && deleteIndex < editTaskSubtasks.length) {
                editTaskSubtasks.splice(deleteIndex, 1);
                
                // IDs der Elemente im DOM aktualisieren
                let subtaskElements = document.querySelectorAll("#addedTasks .one-subtask");
                subtaskElements.forEach((element, i) => {
                    element.id = i;
                });
            }
            return null;
            
        default:
            console.error("Ungültige Aktion für editTaskChangeSubtask:", action);
            return subtaskId;
    }
}

/**
 * Speichert die bearbeitete Task in der Datenbank
 */
async function pushEditTaskToDatabase() {
    try {
      let oldIds = Array.isArray(window.currentAssignedContacts)
        ? window.currentAssignedContacts.map(c => typeof c === 'object' ? c.id : c)
        : [];
      let newIds = Array.from(
        document.querySelectorAll('.category-checkbox:checked')
      ).map(cb => parseInt(cb.dataset.id, 10));
  
      let mergedIds = Array.from(new Set([...oldIds, ...newIds]));
      window.currentAssignedContacts = mergedIds;
      let updatedTask = {
        header        : document.getElementById("input-title-addTask").value || "",
        description   : document.getElementById("textarea-addTask").value || "",
        due_date      : formatDateForBackend(document.getElementById("date-addTask").value),
        priority      : document.querySelector(".prio-addTask button.active")?.id || "medium",
        category      : document.getElementById("category").value || "User Story",
        kanban_category: document.getElementById("boardAddTaskMainBg").dataset.category || "Todo",
        subtasks      : editTaskSubtasks,
        assigned_to   : mergedIds
      };
      await updateTask(editTaskId, updatedTask);
      await boardLoadTasksFromBackend();
      closeAddTask();
      hideTaskView();
      // …
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Task:", error);
      alert("Fehler beim Speichern der Änderungen: " + error.message);
    }
  }
  

/**
 * Setzt das Add Task HTML zurück zum normalen Modus
 */
function resetAddTaskHtml() {
    addTaskInEditMode = false;
    editTaskId = null;
    editTaskSubtasks = [];
    
    document.getElementById("boardHeadAddTask").innerText = "Add Task";
    document.getElementById("saveTasks").style.display = "flex";
    document.getElementById("submitEditTask").style.display = "none";
    document.getElementById("clearButton").style.display = "flex";
    
    resetForm();
}

/**
 * Eine Hilfsfunktion zum Umwandeln des Datums ins Backend-Format
 * @param {string} dateStr - Datum in einem Format wie DD/MM/YYYY oder YYYY-MM-DD
 * @returns {string} - Datum im Format YYYY-MM-DD für das Backend
 */
function formatDateForBackend(dateStr) {
    if (!dateStr) return "";
    if (dateStr.includes("-")) return dateStr;
    let [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
}

/**
 * Formatiert die zugewiesenen Kontakte für das Backend
 * @param {Array} assignedTo - Array mit zugewiesenen Kontakten
 * @returns {Array} - Array mit IDs für das Backend
 */
function formatAssignedToForBackend(assignedTo) {
    if (!Array.isArray(assignedTo)) return [];
    
    return assignedTo.map(contact => {
        if (contact.id) {
            let id = parseInt(contact.id, 10);
            return isNaN(id) ? null : id;
        }
        if (typeof contact === 'number') {
            return contact;
        }
        return null;
    }).filter(id => id !== null);
}

/**
 * Fügt einen Subtask im Edit-Modus hinzu
 */
function addSubtaskInEditMode() {
    // Input-Feld finden und Text extrahieren
    let inputField = document.getElementById("input-title-addTasks");
    let subtaskText = inputField.value.trim();
    
    if (subtaskText === "") return;
    let newId = editTaskChangeSubtask("new", "add", subtaskText);
    let ul = document.getElementById("addedTasks");
    let li = document.createElement("li");
    li.className = "one-subtask";
    li.id = newId;
    li.innerHTML = `
        <span class="subtask-text">• ${escapeHTML(subtaskText)}</span>
        <div class="subtask-icons">
            <img src="/assets/img/contacts/edit.png" alt="Bearbeiten" class="edit-icon">
            <img src="/assets/img/contacts/delete.png" alt="Löschen" class="delete-icon">
        </div>
    `;
    ul.appendChild(li);
    inputField.value = "";
}


/**
 * Baut den Badge‑Container komplett neu auf
 * @param {Array} contacts – Liste von {id,name,initials,color}
 */
function renderContactBadges(contacts) {
  let container = document.getElementById("showName");
  if (!container) return;
  container.innerHTML = "";
  contacts.forEach(c => {
    let badge = document.createElement("div");
    badge.className = "abbreviation-badge";
    badge.dataset.contactId   = c.id;
    badge.dataset.contactName = c.name;
    badge.textContent         = c.initials;
    badge.style.cssText       =
      `background-color: ${c.color};
       color: white;
       padding: 5px 10px;
       border-radius: 50%;
       margin: 2px;
       display: inline-block;`;
    container.appendChild(badge);
  });
  window.currentAssignedContacts = contacts;
}
