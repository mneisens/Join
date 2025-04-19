/**
 * Weist Kontakte im Edit-Formular zu
 * @param {Array} assignedTo - Array mit zugewiesenen Kontakten
 */
// 2) Vereinfachte assignContactsInEditForm: nur anhand der IDs an­haken
function assignContactsInEditForm(assignedToIds) {
    const badgeContainer = document.getElementById("showName");
    badgeContainer.innerHTML = "";             // alte Badges entfernen
  
    assignedToIds.forEach(id => {
      // a) Checkbox mit diesem data-id finden
      const checkbox = document.querySelector(`.category-checkbox[data-id="${id}"]`);
      if (!checkbox) return;
  
      // b) Checkbox anhaken + Option optisch als aktiv markieren
      checkbox.checked = true;
      checkbox.closest(".option").classList.add("active");
  
      // c) Zugehörigen Badge erstellen
      //    Farbe & Initialen aus globaler Liste oder aus data-Attribute nehmen
      const color    = checkbox.dataset.color;
      const initials = checkbox.dataset.initials;
      const badge    = document.createElement("div");
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
  
    // zum Speichern merken
    window.currentAssignedContacts = assignedToIds.slice();
  }
  

/**
 * Überschreibe die updateSelectedAbbreviations-Funktion, um bestehende Badges zu erhalten
 */
// behalte Dir das Original, falls Du es im "Add‑Task‑Modus" noch brauchst:
const originalUpdateSelectedAbbreviations = window.updateSelectedAbbreviations;

window.updateSelectedAbbreviations = function() {
  if (addTaskInEditMode) {
    const checkboxes = document.querySelectorAll(".category-checkbox");
    const container  = document.getElementById("showName");
    if (!container) return;

    // 1) Container leeren
    container.innerHTML = "";

    // 2) Alle angehakten Checkboxen sammeln
    const selected = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => ({
        id      : cb.dataset.id,
        name    : cb.dataset.name,
        initials: cb.dataset.initials,
        color   : cb.dataset.color
      }));

    // 3) Für jedes selektierte Kontakt‑Objekt einen Badge anlegen
    selected.forEach(contact => {
      const badge = document.createElement("div");
      badge.className = contact.name;
      badge.dataset.contactId   = contact.id;
      badge.dataset.contactName = contact.name;
      badge.textContent         = contact.initials;
      badge.style.cssText       =
        `background-color: ${contact.color};
      `
      container.appendChild(badge);
    });

    // 4) Für's spätere Speichern merken
    window.currentAssignedContacts = selected;
    return;
  }

  // im Normal‑Modus das Original nutzen
  if (originalUpdateSelectedAbbreviations) {
    originalUpdateSelectedAbbreviations();
  }
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
// 3) In initEditTask: erst loadCategories(), dann assignContactsInEditForm()
// 3) In initEditTask: erst loadCategories(), dann assignContactsInEditForm()
async function initEditTask(id) {
    addTaskInEditMode = true;
    editTaskId = id;
    window.currentAssignedContacts = [];
  
    // Modal öffnen
    const bg = document.getElementById("boardAddTaskMainBg");
    bg.classList.remove("d-none");
    document.getElementById("boardHeadAddTask").innerText = "Edit Task";
  
    // a) Kontakte/Checkboxen neu laden
    await loadCategories();
  
    // b) Task-Daten holen
    const task = boardGetTaskById(id);
    if (!task) return console.error("Task nicht gefunden:", id);
  
    // c) Formularelemente füllen ...
    document.getElementById("input-title-addTask").value = task.header;
    document.getElementById("textarea-addTask").value   = task.description;
    setDateInEditForm(task.dueDate);
    setPriorityInEditForm(task.priority);
    document.getElementById("category").value           = task.category;
    loadSubtasksInEditForm(task);
    bg.dataset.category                               = task.kanbanCategory;
    editTaskSubtasks                                 = JSON.parse(JSON.stringify(task.subtasks || []));
  
    // Buttons umschalten
    document.getElementById("saveTasks").style.display      = "none";
    document.getElementById("submitEditTask").style.display = "flex";
    document.getElementById("clearButton").style.display    = "none";
  
    // d) Jetzt genau die IDs aus assigned_to anhaken und Badges bauen
    assignContactsInEditForm(task.assignedTo.map(c => c.id));
  }
  


/**
 * Setzt das Datum im Edit-Formular
 * @param {string} dueDate - Fälligkeitsdatum im Format "DD/MM/YYYY"
 */
function setDateInEditForm(dueDate) {
    if (!dueDate) return;
    
    try {
        // Konvertieren von DD/MM/YYYY zu YYYY-MM-DD für input[type="date"]
        const parts = dueDate.split('/');
        if (parts.length === 3) {
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
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
        console.log("Setze Priorität:", priority);
        
        // Alle Prioritäts-Buttons zurücksetzen
        const buttons = document.querySelectorAll(".prio-addTask button");
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
        
        // Ausgewählte Priorität aktivieren
        const selectedButton = document.getElementById(priority);
        if (selectedButton) {
            selectedButton.classList.add("active", "prio-btn-active");
            selectedButton.setAttribute("value", "true");
            
            // Farbe entsprechend der Priorität setzen
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
            // Fallback: Medium als Standard setzen
            const mediumButton = document.getElementById("medium");
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
        const subtasksContainer = document.getElementById("addedTasks");
        subtasksContainer.innerHTML = "";
        
        if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
            task.subtasks.forEach((subtask, index) => {
                const subtaskText = subtask.subtask || subtask.text || "";
                const subtaskElement = document.createElement("li");
                subtaskElement.className = "one-subtask";
                subtaskElement.id = index; // Verwende Index als temporäre ID
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

// document.getElementById("optionsContainer")
//   .addEventListener("change", e => {
//     if (!addTaskInEditMode) return;             // nur im Edit‑Modus
//     const boxes = Array.from(
//       document.querySelectorAll(".category-checkbox")
//     );
//     // Alle angehakten in Kontakt‑Objekte umwandeln
//     const sel = boxes
//       .filter(cb => cb.checked)
//       .map(cb => ({
//         id      : cb.dataset.id,
//         name    : cb.dataset.name,
//         initials: cb.dataset.initials,
//         color   : cb.dataset.color
//       }));
//     renderContactBadges(sel);
//   });

// document.querySelectorAll(".category-checkbox").forEach(cb => {
//     console.log(cb.dataset.id, cb.checked);
// });

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
            // Versuchen, aus anderen Eigenschaften Initialen zu extrahieren
            const nameSource = contact.fullName || contact.userName || contact.email || "";
            if (nameSource) {
                initials = getInitialsFromName(nameSource);
            }
        }
        
        // Farbe ermitteln
        const color = contact.color || getRandomColor();
        
        // Badge erstellen
        const badge = document.createElement("div");
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
        console.log("Badge erstellt für:", contact.name || "Unbekannter Kontakt", "mit Initialen:", initials);
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
    
    const names = fullName.trim().split(/\s+/);
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
            const newId = editTaskSubtasks.length;
            editTaskSubtasks.push({
                subtask: newText,
                done: false
            });
            return newId;
            
        case "edit":
            // Subtask bearbeiten
            const index = parseInt(subtaskId, 10);
            if (!isNaN(index) && index >= 0 && index < editTaskSubtasks.length) {
                editTaskSubtasks[index].subtask = newText;
            }
            return subtaskId;
            
        case "delete":
            // Subtask löschen
            const deleteIndex = parseInt(subtaskId, 10);
            if (!isNaN(deleteIndex) && deleteIndex >= 0 && deleteIndex < editTaskSubtasks.length) {
                editTaskSubtasks.splice(deleteIndex, 1);
                
                // IDs der Elemente im DOM aktualisieren
                const subtaskElements = document.querySelectorAll("#addedTasks .one-subtask");
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
        console.log("Speichere bearbeitete Task mit ID:", editTaskId);

        // Alte Kontakte aus der globalen Variable holen
        const oldContacts = Array.isArray(window.currentAssignedContacts)
            ? window.currentAssignedContacts
            : [];

        // Neue Kontakte aus den Checkboxen sammeln
        const newlyChecked = Array.from(document.querySelectorAll(".category-checkbox:checked"))
            .map(cb => ({
                id: cb.dataset.id,
                name: cb.dataset.name,
                color: cb.dataset.color,
                initials: cb.dataset.initials
            }));

        // Alte und neue Kontakte zusammenführen und Duplikate entfernen
        const mergedContacts = [...oldContacts];
        newlyChecked.forEach(newContact => {
            if (!mergedContacts.some(existingContact => existingContact.id === newContact.id)) {
                mergedContacts.push(newContact);
            }
        });

        // Aktualisiere die globale Variable
        window.currentAssignedContacts = mergedContacts;

        console.log("Zusammengeführte Kontakte:", mergedContacts);

        // Aktualisierte Task-Daten erstellen
        const updatedTask = {
            header: document.getElementById("input-title-addTask").value || "",
            description: document.getElementById("textarea-addTask").value || "",
            due_date: formatDateForBackend(document.getElementById("date-addTask").value),
            priority: document.querySelector(".prio-addTask button.active")?.id || "medium",
            category: document.getElementById("category").value || "User Story",
            kanban_category: document.getElementById("boardAddTaskMainBg").dataset.category || "Todo",
            subtasks: editTaskSubtasks,
            assigned_to: mergedContacts.map(contact => contact.id) // Nur IDs für das Backend
        };

        console.log("Aktualisierte Task-Daten:", updatedTask);

        // Task über API aktualisieren
        await updateTask(editTaskId, updatedTask);

        // Erfolgsmeldung anzeigen
        showSuccessMessage("Task erfolgreich aktualisiert");

        // Board neu laden
        await boardLoadTasksFromBackend();

        // Formular zurücksetzen und ausblenden
        resetAddTaskHtml();
        setTimeout(() => {
            document.getElementById("boardAddTaskMainBg").classList.add("d-none");
        }, 2000);
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
    
    // Wenn das Datum bereits im Format YYYY-MM-DD ist
    if (dateStr.includes("-")) return dateStr;
    
    // Konvertierung von DD/MM/YYYY zu YYYY-MM-DD
    const [day, month, year] = dateStr.split("/");
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
        // Wenn es ein Objekt mit ID ist
        if (contact.id) {
            const id = parseInt(contact.id, 10);
            return isNaN(id) ? null : id;
        }
        // Wenn es eine direkte ID ist
        if (typeof contact === 'number') {
            return contact;
        }
        return null;
    }).filter(id => id !== null); // Entferne ungültige IDs
}

/**
 * Fügt einen Subtask im Edit-Modus hinzu
 */
function addSubtaskInEditMode() {
    // Input-Feld finden und Text extrahieren
    const inputField = document.getElementById("input-title-addTasks");
    const subtaskText = inputField.value.trim();
    
    // Nichts tun, wenn der Text leer ist
    if (subtaskText === "") return;
    
    // Subtask zum Array hinzufügen
    const newId = editTaskChangeSubtask("new", "add", subtaskText);
    
    // Subtask zum UI hinzufügen
    const ul = document.getElementById("addedTasks");
    const li = document.createElement("li");
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
    
    // Input-Feld leeren
    inputField.value = "";
}


/**
 * Baut den Badge‑Container komplett neu auf
 * @param {Array} contacts – Liste von {id,name,initials,color}
 */
function renderContactBadges(contacts) {
  const container = document.getElementById("showName");
  if (!container) return;
  container.innerHTML = "";
  contacts.forEach(c => {
    const badge = document.createElement("div");
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

  // Für’s Speichern merken
  window.currentAssignedContacts = contacts;
}
