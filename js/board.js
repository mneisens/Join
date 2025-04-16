let boardDraggedElementId;
let boardTasks = [];
let boardDragIsStarted= false;
let timer;

const longPressDuration = 1000;
let touchStartY;
let touchStartX;
let touchDropCategory;
let touchAllowDropEnoughtWaiting = false;
let touchAllowDrop = false;

// let checkCred = () => {
//   if (!sessionStorage.getItem("user-creds")) {
//     window.location.href = "log_in.html";
//   }
// };

// window.addEventListener("load", checkCred);

// ===== HILFSFUNKTIONEN FÜR DATENFORMAT-KONVERTIERUNG =====

/**
 * Konvertiert das Backend-Format in das Frontend-Format
 * @param {Object} task - Task aus dem Backend
 * @returns {Object} - Task im Frontend-Format
 */
function formatTaskForFrontend(task) {
  return {
    taskId: task.id,
    header: task.header || "",
    description: task.description || "",
    dueDate: formatDateFromBackend(task.due_date),
    priority: task.priority || "low",
    category: task.category || "User Story",
    kanbanCategory: task.kanban_category || "Todo",
    assignedTo: formatAssignedToForFrontend(task.assigned_to || []),
    subtasks: task.subtasks || []
  };
}


function formatSubtasksForFrontend(subtasks) {
  if (!Array.isArray(subtasks)) return [];
  
  return subtasks.map(subtask => {
    // Wenn subtask ein Objekt ist
    if (typeof subtask === 'object' && subtask !== null) {
      return {
        subtask: subtask.subtask || subtask.title || "Unbenannte Aufgabe",
        done: Boolean(subtask.done)
      };
    }
    // Wenn subtask ein String ist
    return {
      subtask: String(subtask),
      done: false
    };
  });
}

/**
 * Formatiert das assigned_to-Feld für das Frontend
 */
function formatAssignedToForFrontend(assignedTo) {
  if (!Array.isArray(assignedTo)) return [];
  
  return assignedTo.map(contact => {
    if (typeof contact === 'object' && contact !== null) {
      return {
        name: contact.name || "Unbekannt",
        color: contact.color || getRandomColor(),
        initials: contact.initials || getInitialsFromName(contact.name || "Unbekannt")
      };
    } 
    return {
      name: "Kontakt " + contact,
      color: getRandomColor(),
      initials: "?"
    };
  });
}
/**
 * Konvertiert ein Datum vom Backend-Format (YYYY-MM-DD) ins Frontend-Format (DD/MM/YYYY)
 */
function formatDateFromBackend(dateStr) {
  if (!dateStr) return "";
  
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
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
 * This function iniciate the board and all neede settings.
 */
async function loadBoard() {
  try {
    console.log("Board wird geladen...");
    await includeHTML();
    createUserInitials();
    activeLink(2, window.location.href);
    
    // Hier statt Firebase die Backend-API verwenden
    await boardLoadTasksFromBackend();
    
    boardKanbanAddEventListener();
    console.log("Board erfolgreich geladen");
  } catch (error) {
    console.error("Fehler beim Laden des Boards:", error);
  }
}
/**
 * This function will render all kanban categories.
 *
 * @param {Array} taskArr - The give Array is either the main 'boardTasks' Array or could be the filterd Array in search function.
 */
function loadBoardKanbanContainer(taskArr) {
  let categorys = ["Todo", "InProgress", "AwaitFeedback", "Done"];

  if (taskArr) {
    for (r = 0; r < categorys.length; r++) {
      renderHtmlBoardPreviewCards(categorys[r], taskArr);
    }
  } else {
    for (i = 0; i < categorys.length; i++) {
      let boardNoTaskStr = returnBoardNoTaskCardWording(categorys[i]);
      document.getElementById(`boardCardsContainer${categorys[i]}`).innerHTML =
        returnHtmlBoardNoTasksToDo(boardNoTaskStr);
    }
  }
}

/**
 * This function will render all tasks to the kanbanboard in the choosen kanban category. If there is no card in the choosed category,
 * it will render a special card wich calls something like 'No tasks found'.
 *
 * @param {string} category - Its the choosed category like 'Todo' or 'Done'.
 * @param {Array} taskArr - The task Array will be the given Array with used to be filterd by the given kanban category.
 */
function renderHtmlBoardPreviewCards(category, taskArr) {
  let sortetTasks = taskArr.filter((b) => b["kanbanCategory"] == category);
  document.getElementById(`boardCardsContainer${category}`).innerHTML = "";
  if (sortetTasks.length == 0) {
    let boardNoTaskStr = returnBoardNoTaskCardWording(category);
    document.getElementById(`boardCardsContainer${category}`).innerHTML =
      returnHtmlBoardNoTasksToDo(boardNoTaskStr);
  } else {
    for (i = 0; i < sortetTasks.length; i++) {
      const task = sortetTasks[i];
      const taskConfig = returnConfigBoardCardHtml(task);
      let htmlAssignedTo = renderHtmlBoardPreviewCardProfileBadge(task);
      document.getElementById(`boardCardsContainer${category}`).innerHTML +=
        returnHtmlBoardTaskPreviewCard(task, taskConfig, htmlAssignedTo);
    }
  }
}

/**
 * The render function is used to return a html snipped wich contains the
 * profile badges of the assigned to people in the given task.
 *
 * @param {JSON} task - The given task, wich is called.
 * @returns - html snipped of profile badges
 */
function renderHtmlBoardPreviewCardProfileBadge(task) {
  let initials, htmlAssignedTo;
  htmlAssignedTo = "";

  for (e = 0; e < task.assignedTo.length; e++) {
    if (e >= 5) {
      initials = "+" + (task.assignedTo.length - 5);
      htmlAssignedTo += returnHtmlBoardProfileBadgeOverflow(initials);
      return htmlAssignedTo;
    } else {
      initials = boardGetInitials(task.assignedTo[e].name);
      htmlAssignedTo += returnHtmlBoardProfileBadge(
        task.assignedTo[e],
        initials
      );
    }
  }
  return htmlAssignedTo;
}

/**
 * It returns the used configuartion data for given task. There you will get
 * the background class as a string, the priority symbol path and some subtask specs.
 *
 * @param {JSON} task
 * @returns - JSON with the configuartion data
 */
function returnConfigBoardCardHtml(task) {
  let taskConfig = {
    catBg: "bg-blue",
    pathPrioSymbol: "assets/symbols/Prio alta.svg",
    subtaskProgress: {
      amount: 0,
      done: 0,
      percent: 0,
    },
    taskPrioString: "",
    shortDescription: "",
  };
  if (task.category == "Technical Task") {
    taskConfig.catBg = "bg-green";
  }
  taskConfig.pathPrioSymbol = returnBoardCardPrio(task);
  taskConfig.subtaskProgress = returnBoardSubtaskProgress(task);
  let prioStr = task.priority;
  taskConfig.taskPrioString =
    prioStr.charAt(0).toUpperCase() + prioStr.slice(1);
  taskConfig.shortDescription = task.description.substring(0, 25) + "...";
  return taskConfig;
}

/**
 * The function used to get the needed svg path of the current
 * tasks priority symbol.
 *
 * @param {JSON} task - The current task as a JSON.
 * @returns - The symbol path as a string.
 */
function returnBoardCardPrio(task) {
  if (task.priority == "urgent") {
    return "/assets/symbols/Prio alta.svg";
  } else if (task.priority == "medium") {
    return "/assets/symbols/Prio media.svg";
  } else if (task.priority == "low") {
    return "/assets/symbols/Prio baja.svg";
  }
}

/**
 * This function used to return the configuartion for the current tasks progress bar.
 * E.g. if 4 of 8 subtasks are done it contains the number '50' under .percent
 * as the percent of done subtasks. If there no subtasks to do, also it will return the display
 * status as 'none' for CSS usability.
 *
 * @param {JSON} task - The current task.
 * @returns - JSON including amount, done amount and percent of the done subtasks
 */
function returnBoardSubtaskProgress(task) {
  let countDone = 0;
  let display = "flex";

  if (task.subtasks.length == 0) {
    display = "none";
  } else {
    for (y = 0; y < task.subtasks.length; y++) {
      if (task.subtasks[y].done == true) {
        countDone++;
      }
    }
  }
  return {
    amount: task.subtasks.length,
    done: countDone,
    percent: Math.round((countDone / task.subtasks.length) * 100),
    display: display,
  };
}

/**
 * It initialize the search process.
 */
function boardSearchTasks() {
  const searchTerm = document.getElementById("boardInputBox").value;
  const foundTasks = boardReturnSearchTasks(searchTerm);
  if (foundTasks.length === 0) {
    document
      .getElementById("boardSearchNoTasksFound")
      .classList.remove("d-none");
    document.getElementById("boardInputBoxMain").style.border = "1px solid red";
  } else {
    document.getElementById("boardSearchNoTasksFound").classList.add("d-none");
    document.getElementById("boardInputBoxMain").style.border =
      "1px solid #a8a8a8";
  }
  loadBoardKanbanContainer(foundTasks);
}

/**
 * This function is the search function for the kanban board. Its just searches for the
 * task titles (header) and the description.
 *
 * @param {string} searchTerm - It is the given search value, the user is looking for.
 * @returns - Array with fond tasks.
 */
function boardReturnSearchTasks(searchTerm) {
  const searchTermLower = searchTerm.toLowerCase();
  return boardTasks.filter((task) => {
    return (
      task.header.toLowerCase().includes(searchTermLower) ||
      task.description.toLowerCase().includes(searchTermLower)
    );
  });
}

/**
 * This function return the needed string for the placeholder card, if there no tasks in kanban category.
 *
 * @param {string} category - the current category
 * @returns - string with placeholder card text
 */
function returnBoardNoTaskCardWording(category) {
  const messages = {
    Todo: "No tasks To do",
    InProgress: "No tasks In progress",
    AwaitFeedback: "No tasks awaiting",
    Done: "No tasks Done",
  };
  return messages[category] || "";
}

/**
 * This function is used to load the data out of the firebase database, and render it
 * to the board html.
 */
async function boardLoadTasksFromFirestore() {
  boardTasks = await loadTasks();
  loadBoardKanbanContainer(boardTasks);
}

/**
 * This function generate th initials. It takes the first letter of the lastname and firstname. If there
 * is only one name, it returns only one letter. If there more then two names, the first and the lastname
 * are used.
 *
 * @param {string} fullName - The full name of contact.
 * @returns - string with initials
 */
function boardGetInitials(fullName) {
  const names = fullName.trim().split(/\s+/);
  if (names.length === 0) {
    return "";
  }
  const firstNameInitial = names[0][0].toUpperCase();
  if (names.length === 1) {
    return firstNameInitial;
  }
  const lastNameInitial = names[names.length - 1][0].toUpperCase();
  return firstNameInitial + lastNameInitial;
}

function handleError(error) {
  console.error("Error: ", error);
}

function boardGetTaskById(id) {
  console.log("Suche Task mit ID:", id, "Typ:", typeof id);
  console.log("Verfügbare Tasks:", boardTasks);
  
  // Fallback für alte Implementierung (numerische IDs)
  if (!id && id !== 0) {
    console.error("Ungültige Task-ID:", id);
    return null;
  }
  
  // ID in String umwandeln für sicheren Vergleich
  const searchId = String(id);
  
  // Suche in boardTasks
  for (let i = 0; i < boardTasks.length; i++) {
    const task = boardTasks[i];
    // Vergleiche die ID als String
    if (String(task.taskId) === searchId || String(task.id) === searchId) {
      console.log("Task gefunden:", task);
      return task;
    }
  }
  
  console.error(`Task mit ID ${id} konnte nicht gefunden werden!`);
  console.log("Verfügbare Task-IDs:", boardTasks.map(t => `${t.taskId || t.id} (${typeof (t.taskId || t.id)})`));
  return null;
}

function debugTaskStructure() {
  console.log("=== Task-Struktur Debugging ===");
  console.log(`Anzahl Tasks: ${boardTasks.length}`);
  
  if (boardTasks.length > 0) {
    const sampleTask = boardTasks[0];
    console.log("Beispiel-Task Struktur:", JSON.stringify(sampleTask, null, 2));
    console.log("ID-Typ:", typeof sampleTask.taskId || typeof sampleTask.id);
    console.log("ID-Wert:", sampleTask.taskId || sampleTask.id);
  }
  
  // Liste aller verfügbaren Task-IDs
  const taskIds = boardTasks.map(task => {
    return {
      id: task.taskId || task.id,
      type: typeof (task.taskId || task.id)
    };
  });
  
  console.log("Alle Task-IDs:", taskIds);
  console.log("=== Ende Task-Struktur Debugging ===");
}

/**
 * The function will return the canban category, that stays at fist and after the
 * given category.
 *
 * @param {string} kanbanCategory - kanban category
 * @returns - Array containing the categorys called for.
 */
function getBoardKanCategoryBeforeAfter(kanbanCategory) {
  let returnCategories = [];

  switch (kanbanCategory) {
    case "Done":
      returnCategories = ["Todo", "InProgress", "AwaitFeedback"];
      break;
    case "AwaitFeedback":
      returnCategories = ["Todo", "InProgress", "Done"];
      break;
    case "InProgress":
      returnCategories = ["Todo", "AwaitFeedback", "Done"];
      break;
    case "Todo":
      returnCategories = ["Done", "InProgress", "AwaitFeedback"];
      break;
    default:
      returnCategories = [];
      break;
  }
  return returnCategories;
}


function getRandomColor() {
  const colors = [
    "#FF7A00", "#FF5EB3", "#9327FF", "#00BEE8", "#1FD7C1", 
    "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
