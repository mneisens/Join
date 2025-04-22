

let boardDraggedElementId;
let boardTasks = [];
let boardDragIsStarted = false;

/**
 * Initialisiert das Board und lädt alle notwendigen Daten
 */
async function loadBoard() {
  try {
    await includeHTML();
    createUserInitials();
    activeLink(2, window.location.href);
    await boardLoadTasksFromBackend();
  } catch (error) {
    console.error("Fehler beim Laden des Boards:", error);
  }
}

/**
 * Lädt alle Tasks vom Backend und konvertiert sie ins Frontend-Format
 */
async function boardLoadTasksFromBackend() {
  let grouped = await getBoardTasks();
  let contacts = await getContacts();       // holt alle {id, name, color, initials}
  boardTasks = [];

  ["Todo","InProgress","AwaitFeedback","Done"].forEach(cat => {
    grouped[cat].forEach(task => {
      // mappe IDs auf Vollobjekte
      let fullAssigned = (task.assigned_to || []).map(id => 
        contacts.find(c => c.id === id)
      ).filter(Boolean);
      let formatted = formatTaskForFrontend({
        ...task,
        assigned_to: fullAssigned
      });
      boardTasks.push(formatted);
    });
  });

  loadBoardKanbanContainer(boardTasks);
}
/**
 * Konvertiert das Backend-Format in das Frontend-Format
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

/**
 * Formatiert zugewiesene Kontakte für das Frontend
 */
function formatAssignedToForFrontend(assignedTo) {
  if (!Array.isArray(assignedTo)) return [];
  
  return assignedTo.map(contact => {
    if (typeof contact === 'object' && contact !== null && contact.name) {
      return {
        id: contact.id,
        name: contact.name,
        color: contact.color || getRandomColor(),
        initials: contact.initials || getInitialsFromName(contact.name)
      };
    }
    

    if (typeof contact === 'object' && contact !== null && contact.id) {
      return {
        id: contact.id,
        name: `Kontakt ${contact.id}`,
        color: contact.color || getRandomColor(),
        initials: contact.initials || "test"
      };
    }
    
    // Nur ID
    let id = typeof contact === 'number' ? contact : 
               typeof contact === 'string' ? parseInt(contact, 10) : null;
    
    return {
      id: id,
      name: contact.name,
      color: contact.color,
      initials: contact.initials
    };
  });
}

/**
 * Konvertiert ein Datum vom Backend-Format ins Frontend-Format
 */
function formatDateFromBackend(dateStr) {
  if (!dateStr) return "";
  
  let [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Rendert alle Kanban-Kategorien
 */
function loadBoardKanbanContainer(taskArr) {
  let categories = ["Todo", "InProgress", "AwaitFeedback", "Done"];

  if (taskArr) {
    categories.forEach(category => renderHtmlBoardPreviewCards(category, taskArr));
  } else {
    categories.forEach(category => {
      let boardNoTaskStr = returnBoardNoTaskCardWording(category);
      document.getElementById(`boardCardsContainer${category}`).innerHTML =
        returnHtmlBoardNoTasksToDo(boardNoTaskStr);
    });
  }
}

/**
 * Rendert die Tasks in einer Kanban-Kategorie
 */
function renderHtmlBoardPreviewCards(category, taskArr) {
  let container = document.getElementById(`boardCardsContainer${category}`);
  let sortedTasks = taskArr.filter(task => task.kanbanCategory === category);
  
  container.innerHTML = "";
  
  if (sortedTasks.length === 0) {
    let boardNoTaskStr = returnBoardNoTaskCardWording(category);
    container.innerHTML = returnHtmlBoardNoTasksToDo(boardNoTaskStr);
  } else {
    sortedTasks.forEach(task => {
      let taskConfig = returnConfigBoardCardHtml(task);
      let htmlAssignedTo = renderHtmlBoardPreviewCardProfileBadge(task);
      container.innerHTML += returnHtmlBoardTaskPreviewCard(task, taskConfig, htmlAssignedTo);
    });
  }
}

/**
 * Rendert die Profilbilder der zugewiesenen Personen
 */
function renderHtmlBoardPreviewCardProfileBadge(task) {
  let htmlAssignedTo = "";
  if (Array.isArray(task.assignedTo)) {
    let maxBadges = 5;
    
    for (let i = 0; i < Math.min(task.assignedTo.length, maxBadges); i++) {
      let contact = task.assignedTo[i];
      if (contact && typeof contact === 'object') {
        let initials = contact.initials || boardGetInitials(contact.name || "");
        let color = contact.color ;
        htmlAssignedTo += `
          <div class="board-profile-badge" style="background-color: ${color};">${initials}</div>
        `;
      }
    }
    
    if (task.assignedTo.length > maxBadges) {
      let overflow = "+" + (task.assignedTo.length - maxBadges);
      htmlAssignedTo += `
        <div class="board-profile-badge" style="background-color: #2A3647;">${overflow}</div>
      `;
    }
  }
  return htmlAssignedTo;
}

/**
 * Erstellt die Konfiguration für eine Task-Karte
 */
function returnConfigBoardCardHtml(task) {
  let taskConfig = {
    catBg: task.category === "Technical Task" ? "bg-green" : "bg-blue",
    pathPrioSymbol: returnBoardCardPrio(task),
    subtaskProgress: returnBoardSubtaskProgress(task),
    taskPrioString: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
    shortDescription: task.description.substring(0, 25) + "..."
  };
  
  return taskConfig;
}

/**
 * Gibt den Pfad zum Prioritätssymbol zurück
 */
function returnBoardCardPrio(task) {
  let priorities = {
    "urgent": "/assets/symbols/Prio alta.svg",
    "medium": "/assets/symbols/Prio media.svg",
    "low": "/assets/symbols/Prio baja.svg"
  };
  
  return priorities[task.priority] || priorities.low;
}

/**
 * Berechnet den Fortschritt der Subtasks
 */
function returnBoardSubtaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return { amount: 0, done: 0, percent: 0, display: "none" };
  }
  
  let countDone = task.subtasks.filter(subtask => subtask.done === true).length;
  let percent = Math.round((countDone / task.subtasks.length) * 100);
  
  return {
    amount: task.subtasks.length,
    done: countDone,
    percent: percent,
    display: "flex"
  };
}

/**
 * Initiiert die Suche nach Tasks
 */
function boardSearchTasks() {
  let searchTerm = document.getElementById("boardInputBox").value;
  let foundTasks = boardReturnSearchTasks(searchTerm);
  
  document.getElementById("boardSearchNoTasksFound").classList.toggle("d-none", foundTasks.length > 0);
  document.getElementById("boardInputBoxMain").style.border = foundTasks.length > 0 ? 
    "1px solid #a8a8a8" : "1px solid red";
  
  loadBoardKanbanContainer(foundTasks);
}

/**
 * Filtert Tasks basierend auf dem Suchbegriff
 */
function boardReturnSearchTasks(searchTerm) {
  let searchTermLower = searchTerm.toLowerCase();
  return boardTasks.filter(task => 
    task.header.toLowerCase().includes(searchTermLower) || 
    task.description.toLowerCase().includes(searchTermLower)
  );
}

/**
 * Gibt den Text für leere Kategorien zurück
 */
function returnBoardNoTaskCardWording(category) {
  let messages = {
    Todo: "No tasks To do",
    InProgress: "No tasks In progress",
    AwaitFeedback: "No tasks awaiting",
    Done: "No tasks Done"
  };
  
  return messages[category] || "";
}

/**
 * Generiert die Initialen aus einem Namen
 */
function boardGetInitials(fullName) {
  if (!fullName) return "";
  
  let names = fullName.trim().split(/\s+/);
  if (names.length === 0) return "";
  
  let firstInitial = names[0][0].toUpperCase();
  if (names.length === 1) return firstInitial;
  
  let lastInitial = names[names.length - 1][0].toUpperCase();
  return firstInitial + lastInitial;
}

/**
 * Findet eine Task anhand ihrer ID
 */
function boardGetTaskById(id) {
  if (!id && id !== 0) return null;
  
  let searchId = String(id);
  
  return boardTasks.find(task => 
    String(task.taskId) === searchId || String(task.id) === searchId
  ) || null;
}

/**
 * Generiert eine zufällige Farbe
 */
function getRandomColor() {
  let colors = [
    "#FF7A00", "#FF5EB3", "#9327FF", "#00BEE8", "#1FD7C1", 
    "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF"
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Erzeugt Initialen aus einem vollständigen Namen
 */
function getInitialsFromName(fullName) {
  if (!fullName) return "??";
  
  let names = fullName.trim().split(/\s+/);
  if (names.length === 0) return "??";
  
  let firstInitial = names[0].charAt(0).toUpperCase();
  if (names.length === 1) return firstInitial;
  
  let lastInitial = names[names.length - 1].charAt(0).toUpperCase();
  return firstInitial + lastInitial;
}


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