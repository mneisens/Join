

async function getContacts() {
  try {
      let response = await fetch('http://localhost:8000/api/contacts/');
      if (!response.ok) {
          let errorText = await response.text();
          console.error("Server-Antwort war nicht OK:", response.status, errorText);
          throw new Error(`Fehler beim Abrufen der Kontakte: Status ${response.status}`);
      }
      let data = await response.json();
      return data;
  } catch (error) {
      throw error;
  }
}

/**
* Include HTML
*/
async function loadAddTasks() {
  await includeHTML();
  createUserInitials();
  activeLink(3, window.location.href);
}

let currentContactId = null;
let kanbanCategory = 'Todo';


document.addEventListener("DOMContentLoaded", () => {
  setupFormListener();
  setupPriorityButtons();
  setMinDateForCalendar();
  loadCategories();
  updateSelectedAbbreviations();
});

/**
* Sets up the form listener for form submission.
*/
function setupFormListener() {
  let form = document.getElementById("myForm");
  form.addEventListener("submit", event => {
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
* Submits the contact form to Firestore, either updating an existing contact or adding a new one.
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
    if (taskData.assigned_to.length === 0) {
    }
    
    await createTask(taskData);
    showSuccessMessage();
  } catch (error) {
    console.error("Detaillierter Fehler beim Speichern des Tasks:", error);
    alert("Fehler beim Speichern des Tasks: " + error.message);
  }
}


/**
* Show button for succesfully created button
*/
function showSuccessMessage() {
  let successContainer = document.getElementById("contact-succesfully-created");
  successContainer.style.display = "flex"; 
  setTimeout(() => {
      resetForm();
      window.location.href = './board.html'; 
  }, 2000); 
}

/**
* Toggles the display of the options container.
* @param {MouseEvent} event - The click event.
* @param {HTMLElement} optionsContainer - The options container element.
*/
function toggleOptionsContainer(event, optionsContainer) {
  event.stopPropagation();
  optionsContainer.style.display = optionsContainer.style.display === 'none' ? 'flex' : 'none';
}
let allContacts = [];
/**
* Loads categories from Firestore and creates options in the container.
*/
async function loadCategories() {
  try {
      let contacts = await getContacts();
      allContacts = contacts;
      renderOptions(contacts);   
      
      let optionsContainer = document.getElementById('optionsContainer');
      if (!optionsContainer) {
          console.error("optionsContainer nicht gefunden!");
          return;
      }
      
      optionsContainer.innerHTML = '';
      
      if (!contacts || contacts.length === 0) {
          optionsContainer.innerHTML = '<div class="option">Keine Kontakte verfügbar</div>';
          return;
      }
      
      contacts.forEach(contact => {
          let formattedContact = {
              id: contact.id,
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              color: contact.color ,
              initials: contact.initials 
          };
          createCategoryOption(formattedContact, optionsContainer);
      });
  } catch (error) {
      console.error("Fehler beim Laden der Kontakte:", error);
      let optionsContainer = document.getElementById('optionsContainer');
      if (optionsContainer) {
          optionsContainer.innerHTML = '<div class="option">Fehler beim Laden der Kontakte</div>';
      }
  }
}

function renderOptions(contacts) {
  let container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  if (!contacts || contacts.length === 0) {
    container.innerHTML = '<div class="option">Keine Kontakte verfügbar</div>';
    return;
  }
  contacts.forEach(c => createCategoryOption({
    id:       c.id,
    name:     c.name,
    color:    c.color,
    initials: c.initials
  }, container));
}

/**
* Creates a category option element and appends it to the container.
* @param {Object} category - The category data.
* @param {string} category.name - The name of the category.
* @param {string} category.color - The color associated with the category.
*/
function createCategoryOption(contact, optionsContainer) {
  let optionDiv = document.createElement('div');
  optionDiv.className = 'option';
  optionDiv.style.cssText = `…`;

  optionDiv.innerHTML = `
    <div style="display:flex; align-items:center;">
      <div style="
         background-color: ${contact.color};
         color:white;
         width:32px; height:32px;
         border-radius:50%;
         display:flex;
         align-items:center;
         justify-content:center;
         margin-right:10px;
         font-weight:bold;
      ">
        ${contact.initials}
      </div>
      <div>${contact.name}</div>
    </div>
    <input
      type="checkbox"
      class="category-checkbox"
      data-id="${contact.id}"
      data-name="${contact.name}"
      data-color="${contact.color}"
      data-initials="${contact.initials}"
    />
  `;

  optionDiv.addEventListener('click', e => {
    let cb = optionDiv.querySelector('.category-checkbox');
    if (e.target !== cb) {
      cb.checked = !cb.checked;
      updateSelectedAbbreviations();
      optionDiv.classList.toggle('active', cb.checked);
    }
  });

  optionsContainer.appendChild(optionDiv);
}



function updateSelectedAbbreviations() {
  let checkboxes = document.querySelectorAll(".category-checkbox");
  let abbreviationsContainer = document.getElementById("showName");
  abbreviationsContainer.innerHTML = "";
  window.currentAssignedContacts = [];

  checkboxes.forEach((checkbox) => {
    let optionDiv = checkbox.closest(".option");
    if (checkbox.checked) {
      optionDiv.classList.add("active");
      let initialsDiv = document.createElement("div");
      initialsDiv.className = "abbreviation-badge";
      initialsDiv.textContent = checkbox.dataset.initials;
      initialsDiv.style.cssText = `
        background-color: ${checkbox.dataset.color}; 
        color: white; 
        padding: 5px 10px; 
        border-radius: 50%;
        margin-right: 5px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      `;
      abbreviationsContainer.appendChild(initialsDiv);
      
      window.currentAssignedContacts.push({
        id: checkbox.dataset.id,
        name: checkbox.dataset.name,
        color: checkbox.dataset.color,
        initials: checkbox.dataset.initials
      });
    } else {
      optionDiv.classList.remove("active");
    }
  });
}


function encodeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function submitEdit(element) {
  let input = element.closest('.one-subtask').querySelector('.edit-input');
  let li = input.closest('.one-subtask');
  let span = li.querySelector('.subtask-text');
  span.textContent = `• ${input.value.trim()}`;
  span.style.display = ''; 
  li.removeChild(input);
  li.removeChild(element.parentNode);
  li.querySelector('.subtask-icons').style.display = 'flex'; 
}

/**
* Resets the form by clearing all input fields.
*/
function resetForm() {
  document.getElementById('input-title-addTask').value = '';
  document.getElementById('textarea-addTask').value = '';
  document.getElementById('date-addTask').value = '';
  clearPriorityButtons();
  clearAbbreviations();
  clearSubtasks();
}

/**
* Clears all input fields in the form.
*/
function clearInput() {
  document.getElementById('input-title-addTask').value = '';
  document.getElementById('textarea-addTask').value = '';
  document.getElementById('date-addTask').value = '';
  document.getElementById('input-title-addTasks').value = '';
  clearPriorityButtons();
  clearAbbreviations();
  clearSubtasks();
  clearAssignedCategories();
}

function clearAssignedCategories() {
  let checkboxes = document.querySelectorAll('.category-checkbox');
  checkboxes.forEach(checkbox => {
      checkbox.checked = false;
  });
  updateSelectedAbbreviations(); // Update the display
}

/**
* Clears the state of priority buttons.
*/
function clearPriorityButtons() {
  let buttons = document.querySelectorAll('.prio-addTask button');
  buttons.forEach(button => {
      button.setAttribute('value', 'false');
      button.style.backgroundColor = '';
      button.classList.remove('btn-font', 'active');
  });
}

/**
* Clears the abbreviations display.
*/
function clearAbbreviations() {
  let abbreviationsContainer = document.getElementById('showName');
  abbreviationsContainer.innerHTML = '';
}

/**
* Clears the subtasks list.
*/
function clearSubtasks() {
  let tasksContainer = document.getElementById('addedTasks');
  tasksContainer.innerHTML = '';
}

/**
* Sets the minimum date for the date input field to today's date.
*/
function setMinDateForCalendar() {
  let today = new Date().toISOString().split('T')[0];
  document.getElementById("date-addTask").setAttribute("min", today);
}


/**
* Filters options based on the search text entered.
*
* @param {string} searchText - The text to search for in the options.
*/
document.addEventListener("DOMContentLoaded", () => {
loadCategories();  // füllt allContacts & rendert erstmal alle

let selectedInput = document.getElementById('selectedCategory');
let optionsContainer = document.getElementById('optionsContainer');
selectedInput.addEventListener('click', () => {
  optionsContainer.style.display = 'flex';
  renderOptions(allContacts);
});
selectedInput.addEventListener('focus', () => {
  optionsContainer.style.display = 'flex';
  renderOptions(allContacts);
});
selectedInput.addEventListener('input', (e) => {
  filterOptions(e.target.value);
});
document.addEventListener('click', (e) => {
  if (!optionsContainer.contains(e.target) && e.target !== selectedInput) {
    optionsContainer.style.display = 'none';
  }
});
});


/**
* Filtert bei >=2 Zeichen, sonst zeige alle
*/
function filterOptions(searchText) {
let container = document.getElementById('optionsContainer');
let query = searchText.trim().toLowerCase();
container.style.display = 'flex';
if (query.length < 2) {
  return renderOptions(allContacts);
}

let filtered = allContacts.filter(c =>
  c.name.toLowerCase().includes(query)
);

if (filtered.length) {
  renderOptions(filtered);
} else {
  container.innerHTML = '<div class="option">No results found</div>';
}
}

/**
* Updates the display of options based on the search text.
*
* @param {string} searchText - The text to search for in the options.
*/
function updateOptionDisplay(searchText) {
  let db = firebase.firestore();
  let optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = ''; 

  db.collection("UserAuthList").doc(userCreds.uid).collection('contacts')
    .orderBy('name')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
          if (doc.data().name.toLowerCase().includes(searchText)) { 
              createCategoryOption(doc.data(), optionsContainer);
          }
      });
      if (optionsContainer.innerHTML === '') {
          optionsContainer.innerHTML = '<div class="option">No results found</div>';
      }
    }).catch(error => {
        console.error("Error getting documents: ", error);
        optionsContainer.innerHTML = '<div class="option">Error loading options</div>';
    });
}

/**
* Loads and displays all options available.
*/
function loadAllOptions() {
  let db = firebase.firestore();
  let optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = ''; 

  db.collection("UserAuthList").doc(userCreds.uid).collection('contacts')
    .orderBy('name') 
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
          createCategoryOption(doc.data(), optionsContainer);
      });
      if (optionsContainer.innerHTML === '') {
          optionsContainer.innerHTML = '<div class="option">No results found</div>';
      }
    }).catch(error => {
        console.error("Error getting documents: ", error);
        optionsContainer.innerHTML = '<div class="option">Error loading options</div>';
    });
}






/**
* Sets up event listeners for the document after it is fully loaded.
*/
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('myForm');
  var subtaskInput = document.getElementById('input-title-addTasks');
  
  form.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
          event.preventDefault();
      }
  });

  subtaskInput.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
          event.preventDefault();
          addSubtask();
      }
  });
});

/**
* Sets up a double-click event listener for editing subtasks.
*/
document.getElementById('addedTasks').addEventListener('dblclick', function(event) {
  let li = event.target.closest('li.one-subtask');
  if (li && !event.target.classList.contains('edit-icon') && !event.target.classList.contains('delete-icon')) {
      editSubtask(li);
  }
});

/**
* Sets up a click event listener for deleting subtasks.
*/
document.getElementById('addedTasks').addEventListener('click', function(event) {
  let target = event.target;
  if (target.classList.contains('delete-icon')) {
      let li = target.closest('li.one-subtask');
      if (li) {
          li.remove();
      }
  }
});

function formatDateForBackend(dateStr) {
  let [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

/**
* create Task
* @param {Object} taskData - Die Task-Daten
* @returns {Promise} - Der erstellte Task mit ID
*/
async function createTask(taskData) {
  try {
    let token = sessionStorage.getItem('token') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('authToken') || 
                  localStorage.getItem('authToken');
                  
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    let response = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      let errorText = await response.text();
      console.error('Server response:', response.status, errorText);
      
      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.location.href = 'log_in.html';
        return;
      }
      
      try {
        let errorData = JSON.parse(errorText);
        throw new Error(`Fehler beim Erstellen des Tasks: ${JSON.stringify(errorData)}`);
      } catch (e) {
        throw new Error(`Fehler beim Erstellen des Tasks: ${errorText}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('API-Fehler:', error);
    throw error;
  }
}