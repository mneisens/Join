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
    let ulTasks = document.getElementById("addedTasks");
    let lisTasks = ulTasks.querySelectorAll("li");
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
    let checkboxes = document.querySelectorAll(".category-checkbox");
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
    let { header, description } = getHeaderAndDescription();
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
    let ulTasks = document.getElementById('addedTasks');
    let lisTasks = ulTasks.querySelectorAll('li');
    let abbreviationsContainer = document.getElementById('showName');
    let badges = abbreviationsContainer.querySelectorAll('.abbreviation-badge');
    let contactNamesAndColors = [];
    let checkboxes = document.querySelectorAll('.category-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            let contactId = checkbox.dataset.id;
            if (contactId && contactId !== "undefined" && contactId !== "null") {
                contactNamesAndColors.push({
                    name: checkbox.dataset.name,
                    color: checkbox.dataset.color,
                    initials: checkbox.dataset.initials,
                    id: contactId
                });
            } else {
                console.warn("Ungültige Kontakt-ID in Checkbox:", contactId);
            }
        }
    });

    let data = {
        header: encodeHTML(document.getElementById("input-title-addTask").value),
        description: encodeHTML(document.getElementById("textarea-addTask").value),
        dueDate: formatDate(document.getElementById("date-addTask").value),
        priority: document.querySelector(".prio-addTask button.active")?.id || "low",
        category: document.getElementById("category").value,
        subtasks: Array.from(lisTasks).map(li => ({
            subtask: encodeHTML(li.querySelector('.subtask-text').textContent.replace(/^\•\s*/, '').trim()),
            done: false
        })),
        categoryAbbreviations: Array.from(badges).map(badge => badge.textContent),
        assignedTo: contactNamesAndColors,
        kanbanCategory: 'Todo'  // Standard-Wert
    };
    return data;
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
      let data = collectFormData();
      let validAssignedTo = data.assignedTo
        .filter(contact => contact && contact.id)
        .map(contact => {
          let id = parseInt(contact.id, 10);
          if (isNaN(id)) {
            console.warn("Ungültige Kontakt-ID gefunden:", contact.id);
            return null;
          }
          return id;
        })
        .filter(id => id !== null); // Entferne alle null-Werte
      let taskData = {
        header: data.header,
        description: data.description,
        due_date: formatDateForBackend(data.dueDate), 
        priority: data.priority,
        category: data.category,
        kanban_category: data.kanbanCategory || 'Todo',
        assigned_to: validAssignedTo,
        subtasks: data.subtasks
      };
      
      await createTask(taskData);
      showSuccessMessage();
    } catch (error) {
      console.error("Detaillierter Fehler beim Speichern des Tasks:", error);
      alert("Fehler beim Speichern des Tasks: " + error.message);
    }
}
  
/**
 * Zeigt eine Erfolgsmeldung an
 */
function showSuccessMessage(message) {
  let successContainer = document.getElementById("contact-succesfully-created");
  if (successContainer) {
    successContainer.textContent = message || "Task erfolgreich aktualisiert";
    successContainer.style.display = "flex";
    
    setTimeout(() => {
      successContainer.style.display = "none";
      closeAddTask();
      boardLoadTasksFromBackend().then(() => {

    }).catch(error => {
 
    });
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
  
  let taskConfig = returnConfigBoardCardHtml(task);
  let category = task.kanbanCategory;
  
  // Prüfe, ob eine "Keine Tasks"-Box existiert und verstecke sie ggf.
  try {
    let container = document.getElementById(`boardCardsContainer${category}`);
    let noTasksBox = container.querySelector('.board-no-tasks-toDo-box');
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
    let optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";
  
    // Kontakte vom Backend holen
    let contacts = await getContacts();
    // global vorhalten, damit assignContactsInEditForm sie nutzen kann
    window.allContacts = contacts;  // ← neu
  
    contacts.forEach(contact => {
      let contactData = {
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
    
    let names = fullName.trim().split(/\s+/);
    if (names.length === 0) {
      return "??";
    }
    
    let firstNameInitial = names[0].charAt(0).toUpperCase();
    if (names.length === 1) {
      return firstNameInitial;
    }
    
    let lastNameInitial = names[names.length - 1].charAt(0).toUpperCase();
    return firstNameInitial + lastNameInitial;
  }
  
  /**
   * Erzeugt eine zufällige Farbe für Kontaktinitialen
   * @returns {string} Eine zufällige Farbe als HEX-Code
   */
  function getRandomColor() {
    let colors = [
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