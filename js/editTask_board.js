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
function initEditTask(id) {
    console.log("Initialisiere Edit-Modus für Task:", id);
    editTaskId = id;
    addTaskInEditMode = true;
    
    try {
        // Task aus dem Board-Array holen
        const task = boardGetTaskById(id);
        if (!task) {
            console.error("Task nicht gefunden:", id);
            return;
        }
        
        // Add Task Formular vorbereiten
        document.getElementById("boardAddTaskMainBg").classList.remove("d-none");
        document.getElementById("boardHeadAddTask").innerText = "Edit Task";
        
        // Formulardaten befüllen
        document.getElementById("input-title-addTask").value = task.header || "";
        document.getElementById("textarea-addTask").value = task.description || "";
        
        // Datum formatieren und eintragen
        setDateInEditForm(task.dueDate);
        
        // Priorität setzen
        setPriorityInEditForm(task.priority);
        
        // Kategorie setzen
        document.getElementById("category").value = task.category || "User Story";
        
        // Subtasks laden
        loadSubtasksInEditForm(task);
        
        // Zugewiesene Kontakte setzen
        assignContactsInEditForm(task.assignedTo);
        
        // Buttons für Edit-Modus anpassen
        document.getElementById("saveTasks").style.display = "none";
        document.getElementById("submitEditTask").style.display = "flex";
        document.getElementById("clearButton").style.display = "none";
        
        // Kanban-Kategorie im Formular speichern
        document.getElementById("boardAddTaskMainBg").dataset.category = task.kanbanCategory;
        
        // Subtasks-Array für spätere Bearbeitung speichern
        editTaskSubtasks = JSON.parse(JSON.stringify(task.subtasks || []));
        
    } catch (error) {
        console.error("Fehler beim Initialisieren des Edit-Modus:", error);
    }
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
        // Alle Prioritäts-Buttons zurücksetzen
        const buttons = document.querySelectorAll(".prio-addTask button");
        buttons.forEach(button => {
            button.classList.remove("active");
            button.style.backgroundColor = "";
            button.setAttribute("value", "false");
        });
        
        // Ausgewählte Priorität aktivieren
        const selectedButton = document.getElementById(priority);
        if (selectedButton) {
            setButtonValues(selectedButton);
        } else {
            // Fallback: Medium als Standard setzen
            setButtonValues(document.getElementById("medium"));
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

/**
 * Weist Kontakte im Edit-Formular zu
 * @param {Array} assignedTo - Array mit zugewiesenen Kontakten
 */
function assignContactsInEditForm(assignedTo) {
    try {
        // Zuerst alle Checkboxen zurücksetzen
        const checkboxes = document.querySelectorAll(".category-checkbox");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Wenn keine Kontakte zugewiesen sind, abbrechen
        if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
            updateSelectedAbbreviations();
            return;
        }
        
        // Für jeden zugewiesenen Kontakt die entsprechende Checkbox aktivieren
        assignedTo.forEach(contact => {
            // Suche nach dem Kontakt-Namen
            const contactName = contact.name || "";
            
            checkboxes.forEach(checkbox => {
                const checkboxName = checkbox.dataset.name || "";
                if (checkboxName.toLowerCase() === contactName.toLowerCase()) {
                    checkbox.checked = true;
                }
            });
        });
        
        // UI aktualisieren
        updateSelectedAbbreviations();
    } catch (error) {
        console.error("Fehler beim Zuweisen der Kontakte:", error);
    }
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
        
        // Formulardaten sammeln
        const formData = collectFormData();
        
        // Aktualisierte Task-Daten erstellen
        const updatedTask = {
            header: formData.header,
            description: formData.description,
            due_date: formatDateForBackend(formData.dueDate), 
            priority: formData.priority,
            category: formData.category,
            kanban_category: formData.kanbanCategory,
            subtasks: editTaskSubtasks,
            assigned_to: formatAssignedToForBackend(formData.assignedTo)
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