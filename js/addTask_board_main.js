/**
 * Loads and initializes the "Add Task" page components.
 * @async
 */
async function loadAddTasks() {
    await includeHTML();
    createUserInitials();
    aktiveLink();
  }
  
  let currentContactId = null;
  let kanbanCategory = "Todo";
  

  /**
   * Sets up event listeners for the document once the DOM is fully loaded.
   */
  document.addEventListener("DOMContentLoaded", () => {
    setupFormListener();
    setupPriorityButtons();
    setupAssignedTaskButton();
    setMinDateForCalendar();
    loadCategories();
    updateSelectedAbbreviations();
  });
  
  /**
   * Sets up the form listener for form submission.
   */
  function setupFormListener() {
    let form = document.getElementById("myForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        alert("Bitte alle Felder ausfüllen.");
      } else {
        submitContact();
      }
    });
  }
  
  /**
   * Formats a date string from "YYYY-MM-DD" to "DD/MM/YYYY".
   * @param {string} dateStr - The date string in "YYYY-MM-DD" format.
   * @returns {string} The formatted date string in "DD/MM/YYYY" format.
   */
  function formatDate(dateStr) {
    let [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }
  
  /**
   * Collects data from the form.
   * @returns {Object} The collected form data.
   */
  function getTaskListItems() {
    const ulTasks = document.getElementById("addedTasks");
    const lisTasks = ulTasks.querySelectorAll("li");
    return Array.from(lisTasks).map(li => ({
      subtask: encodeHTML(
        li.querySelector(".subtask-text")
          .textContent.replace(/^\•\s*/, "")
          .trim()
      ),
      done: false
    }));
  }
  
  /**
   * Retrieves data from checked category checkboxes.
   * @returns {Array<Object>} An array of objects containing the name, color, initials, and id of each checked category.
   */
  function getCheckedCategories() {
    const checkboxes = document.querySelectorAll(".category-checkbox");
    return Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => ({
      name: checkbox.dataset.name,
      color: checkbox.dataset.color,
      initials: checkbox.dataset.initials,
      id: checkbox.dataset.id
    }));
  }
  
  /**
   * Retrieves the active priority level.
   * @returns {string} The id of the active priority button or "low" if no button is active.
   */
  function getActivePriority() {
    return document.querySelector(".prio-addTask button.active")?.id || "low";
  }
  
  /**
   * Encodes HTML entities in the header and description input fields.
   * @returns {Object} An object containing the encoded header and description.
   */
  function getHeaderAndDescription() {
    return {
      header: encodeHTML(document.getElementById("input-title-addTask").value),
      description: encodeHTML(document.getElementById("textarea-addTask").value),
    };
  }
  
  
  /**
   * Assembles all parts of the form data into a single object.
   * @returns {Object} The assembled form data object.
   */
  function assembleData() {
    const { header, description } = getHeaderAndDescription();
    return {
      header,
      description,
      dueDate: formatDate(document.getElementById("date-addTask").value),
      priority: getActivePriority(),
      category: document.getElementById("category").value,
      subtasks: getTaskListItems(),
      categoryAbbreviations: getCategoryAbbreviations(),
      assignedTo: getCheckedCategories(),
      kanbanCategory: kanbanCategory, 
    };
  }
  
  /**
   * Collects and returns the form data.
   * @returns {Object} The form data object.
   */
  function collectFormData() {
    const titleInput = document.getElementById('input-title-addTask');
    const descInput = document.getElementById('textarea-addTask');
    const dateInput = document.getElementById('date-addTask');
    const categorySelect = document.getElementById('category');
    
    // Priorität bestimmen
    let priority = 'medium'; // Standard
    const priorityButtons = ['urgent', 'medium', 'low'];
    priorityButtons.forEach(btn => {
      const button = document.getElementById(btn);
      if (button && button.classList.contains('prio-btn-active')) {
        priority = btn;
      }
    });
    
    // Kanban-Kategorie aus Formular-Datenattribut oder aktive Kategorie verwenden
    const kanbanCategory = document.getElementById('boardAddTaskMainBg').dataset.category || 'Todo';
    
    // Subtasks sammeln
    const subtasks = [];
    const subtaskElements = document.querySelectorAll('#addedTasks .subtask-item');
    subtaskElements.forEach(element => {
      const checkbox = element.querySelector('input[type="checkbox"]');
      const text = element.querySelector('span').textContent;
      
      subtasks.push({
        subtask: text,
        done: checkbox ? checkbox.checked : false
      });
    });
    
    // Zugewiesene Personen - hier muss Ihre spezifische Implementierung angepasst werden
    // Dies ist nur ein Beispiel
    const assignedTo = [];
    const selectedPersons = document.querySelectorAll('#selectedAbbreviations .selected-person');
    selectedPersons.forEach(element => {
      assignedTo.push({
        name: element.textContent,
        color: element.style.backgroundColor
      });
    });
    
    return {
      header: titleInput ? titleInput.value : '',
      description: descInput ? descInput.value : '',
      dueDate: dateInput ? dateInput.value : '',
      priority: priority,
      category: categorySelect ? categorySelect.value : 'User Story',
      kanbanCategory: kanbanCategory,
      subtasks: subtasks,
      assignedTo: assignedTo
    };
  }
  
  /**
   * Encodes a string to HTML entities.
   * @param {string} str - The string to be encoded.
   * @returns {string} The encoded string.
   */
  function encodeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  /**
   * Submits the contact form data to Firestore.
   */
  async function submitContact() {
    try {
      const data = collectFormData();
      // console.log("Gesammelte Formulardaten:", data);
      
      // Formatiere die Daten für das Backend
      const taskData = {
        header: data.header,
        description: data.description,
        due_date: formatDateForBackend(data.dueDate), 
        priority: data.priority,
        category: data.category,
        kanban_category: data.kanbanCategory || 'Todo',
        assigned_to: formatAssignedToForBackend(data.assignedTo),
        subtasks: data.subtasks || []
      };
      
      // console.log("Formatierte Task-Daten für Backend:", taskData);
      
      // Verwende die createTask-Funktion aus tasks-api.js
      const newTask = await createTask(taskData);
      // console.log("Neue Task erstellt:", newTask);
      
      // Erfolg anzeigen
      showSuccessMessage();
      
      // Board aktualisieren (vorhandene Funktion wiederverwenden)
      addTaskToBoardWithoutLoadNew(newTask.id, formatTaskForFrontend(newTask));
      
      // Formular ausblenden
      hideAddTaskBg();
    } catch (error) {
      // console.error("Fehler beim Erstellen des Tasks:", error);
      alert("Fehler beim Erstellen des Tasks: " + error.message);
    }
  }

  function formatDateForBackend(dateStr) {
    if (!dateStr) return "";
    
    // Wenn das Datum bereits im Format DD/MM/YYYY ist
    if (dateStr.includes("/")) return dateStr;
    
    // Konvertierung von YYYY-MM-DD zu DD/MM/YYYY
    const [year, month, day] = dateStr.split("-");
    return `${year}-${month}-${day}`; // Das Backend erwartet YYYY-MM-DD
  }
  function formatAssignedToForBackend(assignedTo) {
    if (!Array.isArray(assignedTo)) return [];
    
    // Extrahiere nur die IDs der zugewiesenen Kontakte
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
   * Sets the task ID in the newly added contact document.
   * @param {firebase.firestore.CollectionReference} contactsCollection - The Firestore collection reference.
   * @param {string} taskId - The ID of the newly added contact document.
   * @param {Object} data - The data to add to the new contact document.
   */
  // function setTaskIdInDocument(contactsCollection, taskId, data) {
  //   contactsCollection.doc(taskId).set({ taskId: taskId }, { merge: true }).then(() => {
  //       showSuccessMessage();
  //       addTaskToBoardWithoutLoadNew(taskId, data);
  //       hideAddTaskBg();
  //     })
  //     .catch((error) => console.error("Fehler beim Aktualisieren der ID des Dokuments: ", error));
  // }
  
  
/**
 * Zeigt eine Erfolgsmeldung an
 */
function showSuccessMessage(message) {
  const successContainer = document.getElementById("contact-succesfully-created");
  if (successContainer) {
    successContainer.textContent = message || "Task erfolgreich aktualisiert";
    successContainer.style.display = "flex";
    
    // Nach 2 Sekunden ausblenden
    setTimeout(() => {
      successContainer.style.display = "none";
    }, 2000);
  }
}
  
  /**
   * This function used to refresh the boardTask Array needed for later use, cause the board.html will not
   * be reload. For better user experience this function only add the new TaskCard to the kanbanBoard,
   * and hide the addTask menu.
   * @param {string} id - the id of document in firebase wich was created before
   * @param {JSON} task - the current added task as a json
   */
/**
 * Fügt einen neuen Task zum Board hinzu, ohne die Seite neu zu laden
 * @param {string} id - die ID des erstellten Tasks
 * @param {Object} task - der erstellte Task
 */
function addTaskToBoardWithoutLoadNew(id, task) {
  // Stelle sicher, dass die taskId gesetzt ist
  if (!task.taskId) {
    task.taskId = id;
  }
  
  const taskConfig = returnConfigBoardCardHtml(task);
  const category = task.kanbanCategory;
  
  // Prüfe, ob eine "Keine Tasks"-Box existiert und verstecke sie ggf.
  try {
    const container = document.getElementById(`boardCardsContainer${category}`);
    const noTasksBox = container.querySelector('.board-no-tasks-toDo-box');
    if (noTasksBox) {
      noTasksBox.classList.add('d-none');
    }
  } catch (error) {
    console.warn("Konnte Keine-Tasks-Box nicht finden:", error);
  }
  
  // Generiere HTML für zugewiesene Kontakte
  let htmlAssignedTo = renderHtmlBoardPreviewCardProfileBadge(task);
  
  // Füge Task zum entsprechenden Container hinzu
  document.getElementById(`boardCardsContainer${category}`).innerHTML +=
    returnHtmlBoardTaskPreviewCard(task, taskConfig, htmlAssignedTo);
  
  // Füge Task zum boardTasks-Array hinzu für spätere Verwendung
  boardTasks.push(task);
}
  
  /**
   * This function used to hide the addTask window.
   */
  function hideAddTaskBg() {
    setTimeout(() => {
      document.getElementById("boardAddTaskMainBg").classList.add("d-none");
      document.getElementById("contact-succesfully-created").style.display =
        "none";
      resetForm();
    }, 2000);
  }
  
  /**
   * This function used to hide the 'no-task-card' if user add the first task to kanban category.
   * 
   * @param {string} category - current kanban category
   */
  function hideNoTasksToDoBox(category){
   let element =  document.getElementById(`boardCardsContainer${category}`);
   element.querySelector('.board-no-tasks-toDo-box').classList.add('d-none');
  }
  
  /**
   * Sets up event listeners for priority buttons.
   */
  function setupPriorityButtons() {
    let buttons = document.querySelectorAll(".prio-addTask button");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setButtonValues(button);
      });
    });
  }
  
  /**
   * Sets the values and active states for priority buttons.
   * @param {HTMLElement} clickedButton - The clicked button element.
   */
  function setButtonValues(clickedButton) {
    let buttons = document.querySelectorAll(".prio-addTask button");
    buttons.forEach((button) => {
      button.setAttribute("value", button === clickedButton ? "true" : "false");
      button.classList.toggle("active", button === clickedButton);
    });
    updateButtonColors();
  }
  
  
  /**
   * Updates the colors of the priority buttons.
   */
  function updateButtonColors() {
    let urgent = document.getElementById("urgent");
    let medium = document.getElementById("medium");
    let low = document.getElementById("low");
    updateButtonColor(
      urgent, "rgba(255, 61, 0, 1)", "prio-up-orange", "prio-up-white");
    updateButtonColor(medium, "rgba(255, 168,0, 1)", "prio-medium-ye", "prio-medium-white");
    updateButtonColor( low, "rgba(122, 226, 41, 1)","prio-down-green", "prio-down-white");
  }
  
  /**
   * Updates the color of a priority button based on its active state.
   * @param {HTMLElement} button - The button element.
   * @param {string} color - The color to apply when active.
   * @param {string} iconDefault - The default icon element ID.
   * @param {string} iconActive - The active icon element ID.
   */
  function updateButtonColor(button, color, iconDefault, iconActive) {
    let isActive = button.getAttribute("value") === "true";
    button.style.backgroundColor = isActive ? color : "";
    document.getElementById(iconDefault).classList.toggle("d-none", isActive);
    document.getElementById(iconActive).classList.toggle("d-none", !isActive);
    button.classList.toggle("btn-font", isActive);
  }
  
  /**
   * Sets up the assigned task button to toggle the options container.
   */
  function setupAssignedTaskButton() {
    let assignedAddTaskButton = document.getElementById("assigned-addTask");
    let optionsContainer = document.getElementById("optionsContainer");
    assignedAddTaskButton.addEventListener("click", (event) => {
      toggleOptionsContainer(event, optionsContainer);
    });
    document.addEventListener("click", (event) => {
      hideOptionsContainer(event, optionsContainer, assignedAddTaskButton);
    });
    optionsContainer.addEventListener("click", (event) =>
      event.stopPropagation()
    );
  }
  
  /**
   * Toggles the display of the options container.
   * @param {MouseEvent} event - The click event.
   * @param {HTMLElement} optionsContainer - The options container element.
   */
  function toggleOptionsContainer(event, optionsContainer) {
    event.stopPropagation();
    if (optionsContainer.style.display === "none") {
      optionsContainer.style.display = "flex";
      document.getElementById("selectedCategory").style.border = "1px solid #29ABE2";
      document.getElementById("selectedCategoryIcon").src = "assets/symbols/Property 1=Variant4.svg";
    } else {
      optionsContainer.style.display = "none";
      document.getElementById("selectedCategory").style.border = "1px solid #D1D1D1";
      document.getElementById("selectedCategoryIcon").src =  "assets/symbols/arrow_drop_downaa.svg";
    }
  }
  
  /**
   * Hides the options container if clicked outside.
   * @param {MouseEvent} event - The click event.
   * @param {HTMLElement} optionsContainer - The options container element.
   * @param {HTMLElement} assignedAddTaskButton - The assigned task button element.
   */
  function hideOptionsContainer(event, optionsContainer, assignedAddTaskButton) {
    if (
      optionsContainer.style.display !== "none" &&
      !optionsContainer.contains(event.target) &&
      event.target !== assignedAddTaskButton
    ) {
      document.getElementById("selectedCategory").style.border =
        "1px solid #D1D1D1";
      optionsContainer.style.display = "none";
    }
  }
  
  /**
   * Loads categories from Firestore and creates options in the container.
   */
  async function loadCategories() {
    const optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";
  
    // Kontakte vom Backend holen
    const contacts = await getContacts();
    // global vorhalten, damit assignContactsInEditForm sie nutzen kann
    window.allContacts = contacts;  // ← neu
  
    contacts.forEach(contact => {
      const contactData = {
        id        : contact.id,
        name      : contact.name,
        color     : contact.color,
        initials  : contact.initials
      };
      createCategoryOption(contactData, optionsContainer);
    });
  }
  
  function getInitialsFromName(fullName) {
    if (!fullName) return "??";
    
    const names = fullName.trim().split(/\s+/);
    if (names.length === 0) {
      return "??";
    }
    
    const firstNameInitial = names[0].charAt(0).toUpperCase();
    if (names.length === 1) {
      return firstNameInitial;
    }
    
    const lastNameInitial = names[names.length - 1].charAt(0).toUpperCase();
    return firstNameInitial + lastNameInitial;
  }
  
  /**
   * Erzeugt eine zufällige Farbe für Kontaktinitialen
   * @returns {string} Eine zufällige Farbe als HEX-Code
   */
  function getRandomColor() {
    const colors = [
      "#FF7A00", "#FF5EB3", "#9327FF", "#00BEE8", "#1FD7C1", 
      "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  /**
   * Creates a category option element and appends it to the container.
   * @param {Object} category - The category data.
   * @param {string} category.name - The name of the category.
   * @param {string} category.color - The color associated with the category.
   */
  function createCategoryOption(category, optionsContainer) {
    let optionDiv = document.createElement("div");
    optionDiv.id = category.id;
    optionDiv.className = "option";
    optionDiv.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 5px; box-sizing: border-box;`;
    optionDiv.innerHTML = createCategoryOptionHTML(category);
  
    optionDiv.addEventListener("click", (event) => {
      let checkbox = optionDiv.querySelector(".category-checkbox");
      if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateSelectedAbbreviations();
        optionDiv.classList.toggle("active", checkbox.checked);
      }
    });
    optionsContainer.appendChild(optionDiv);
  }