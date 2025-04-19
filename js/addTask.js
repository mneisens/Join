

async function getContacts() {
    try {
        // console.log("API-Aufruf: Kontakte abrufen");
        const response = await fetch('http://localhost:8000/api/contacts/');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server-Antwort war nicht OK:", response.status, errorText);
            throw new Error(`Fehler beim Abrufen der Kontakte: Status ${response.status}`);
        }
        
        const data = await response.json();
        // console.log("API-Antwort Kontakte:", data);
        return data;
    } catch (error) {
        // console.error('API-Fehler bei getContacts:', error);
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

/**
 * Check logged in
 */
let checkCred = () => {
    if (!sessionStorage.getItem("user-creds")) {
     window.location.href = 'log_in.html';
    }
}
window.addEventListener("load", checkCred);

/**
 * Firebase configuration
 */
// const firebaseConfig = {
//     apiKey: "AIzaSyBrslTwOvrS4_tnF6uODjT1KQuWR4ttzFY",
//     authDomain: "join193-5ae20.firebaseapp.com",
//     databaseURL: "https://join193-5ae20-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "join193-5ae20",
//     storageBucket: "join193-5ae20.appspot.com",
//     messagingSenderId: "330884835484",
//     appId: "1:330884835484:web:20d71dc457ab9659d0a559"
// };

const firebaseConfig = {
    apiKey: "AIzaSyAeIBUm7q40H52uDOsl19A6ecvv-NH3cHs",
    authDomain: "join-62bad.firebaseapp.com",
    databaseURL: "https://join-62bad-default-rtdb.firebaseio.com",
    projectId: "join-62bad",
    storageBucket: "join-62bad.firebasestorage.app",
    messagingSenderId: "349761837323",
    appId: "1:349761837323:web:970c5ea99cf750318a2a0e"
  };

// const firebaseConfig = {
//     apiKey: "AIzaSyACpY02drGC1U6QjS5_u1gGVVajUYSXjbE",
//     authDomain: "join2-14807.firebaseapp.com",
//     projectId: "join2-14807",
//     storageBucket: "join2-14807.firebasestorage.app",
//     messagingSenderId: "344947370774",
//     appId: "1:344947370774:web:ec768c001a344583383e37"
//   };
firebase.initializeApp(firebaseConfig);

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
    
    // console.log("Gesammelte Checkboxen:", checkboxes);
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const contactId = checkbox.dataset.id;
            // console.log("Checkbox-Daten:", checkbox.dataset);
            
            // Stelle sicher, dass eine gültige ID vorhanden ist
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
    
    // console.log("Gesammelte Kontakte:", contactNamesAndColors);

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
      const data = collectFormData();
    //   console.log("Gesammelte Formulardaten:", data);
      
      // Filtere ungültige IDs heraus
      const validAssignedTo = data.assignedTo
        .filter(contact => contact && contact.id) // Entferne null, undefined und leere IDs
        .map(contact => {
          // Stelle sicher, dass die ID eine Zahl ist
          const id = parseInt(contact.id, 10);
          if (isNaN(id)) {
            console.warn("Ungültige Kontakt-ID gefunden:", contact.id);
            return null;
          }
          return id;
        })
        .filter(id => id !== null); // Entferne alle null-Werte
      
    //   console.log("Gültige Contact-IDs:", validAssignedTo);
      
      // Format für das Django-Backend anpassen
      const taskData = {
        header: data.header,
        description: data.description,
        due_date: formatDateForBackend(data.dueDate), 
        priority: data.priority,
        category: data.category,
        kanban_category: data.kanbanCategory || 'Todo',
        assigned_to: validAssignedTo,
        subtasks: data.subtasks
      };
      
    //   console.log("Formatierte Task-Daten für Backend:", taskData);
      
      // Prüfe, ob assigned_to Werte enthält
      if (taskData.assigned_to.length === 0) {
        // console.log("Keine gültigen Kontakte zugewiesen");
        
        // Optional: Leere assigned_to ist OK - entferne das Feld
        // delete taskData.assigned_to;
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

/**
 * Loads categories from Firestore and creates options in the container.
 */
async function loadCategories() {
    try {
        // console.log("Versuche Kontakte zu laden...");
        const contacts = await getContacts();
        // console.log("Geladene Kontakte:", contacts);
        
        let optionsContainer = document.getElementById('optionsContainer');
        if (!optionsContainer) {
            console.error("optionsContainer nicht gefunden!");
            return;
        }
        
        optionsContainer.innerHTML = '';
        
        if (!contacts || contacts.length === 0) {
            // console.log("Keine Kontakte gefunden.");
            optionsContainer.innerHTML = '<div class="option">Keine Kontakte verfügbar</div>';
            return;
        }
        
        contacts.forEach(contact => {
            // console.log("Verarbeite Kontakt:", contact);
            const formattedContact = {
                id: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                color: contact.color ,
                initials: contact.initials //|| getInitialsFromName(contact.name)
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
/**
 * Creates a category option element and appends it to the container.
 * @param {Object} category - The category data.
 * @param {string} category.name - The name of the category.
 * @param {string} category.color - The color associated with the category.
 */
function createCategoryOption(contact, optionsContainer) {
    let optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.style.cssText = `
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        padding: 8px 10px; 
        margin: 2px 0; 
        border-radius: 4px; 
        cursor: pointer;
    `;
    
    // Formatiertes HTML mit dem Kontakt-Initial und Namen
    optionDiv.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div style="
                background-color: ${contact.color}; 
                color: white; 
                width: 32px; 
                height: 32px; 
                border-radius: 50%; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                margin-right: 10px;
                font-weight: bold;
            ">
                ${contact.initials}
            </div>
            <div>${contact.name}</div>
        </div>
      <input type="checkbox" class="category-checkbox"
       data-id="{{ contact.id }}"
       data-name="{{ contact.name }}"
       data-color="{{ contact.color }}"
       data-initials="{{ contact.initials }}" />
    `;

    optionDiv.addEventListener('click', (event) => {
        let checkbox = optionDiv.querySelector('.category-checkbox');
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked; 
            updateSelectedAbbreviations(); 
            optionDiv.classList.toggle('active', checkbox.checked); 
        }
    });
    
    optionsContainer.appendChild(optionDiv);
}
/**
 * Updates the selected abbreviations based on checked checkboxes.
 */
// function updateSelectedAbbreviations() {
//     let checkboxes = document.querySelectorAll(".category-checkbox");
//     let abbreviationsContainer = document.getElementById("showName");
//     abbreviationsContainer.innerHTML = "";
  
//     // Speichern der ausgewählten Kontakte für spätere Verwendung
//     window.currentAssignedContacts = [];
  
//     checkboxes.forEach((checkbox) => {
//       let optionDiv = checkbox.closest(".option");
//       if (checkbox.checked) {
//         optionDiv.classList.add("active");
        
//         // Badge erstellen
//         let initialsDiv = document.createElement("div");
//         initialsDiv.className = "abbreviation-badge";
//         initialsDiv.textContent = checkbox.dataset.initials;
//         initialsDiv.style.cssText = `
//           background-color: ${checkbox.dataset.color}; 
//           color: white; 
//           padding: 5px 10px; 
//           border-radius: 50%;
//           margin-right: 5px;
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//         `;
//         abbreviationsContainer.appendChild(initialsDiv);
        
//         // Kontakt für spätere Verwendung speichern
//         window.currentAssignedContacts.push({
//           id: checkbox.dataset.id,
//           name: checkbox.dataset.name,
//           color: checkbox.dataset.color,
//           initials: checkbox.dataset.initials
//         });
//       } else {
//         optionDiv.classList.remove("active");
//       }
//     });
//   }

  function updateSelectedAbbreviations() {
    let checkboxes = document.querySelectorAll(".category-checkbox");
    let abbreviationsContainer = document.getElementById("showName");
    abbreviationsContainer.innerHTML = "";
  
    // Speichern der ausgewählten Kontakte für spätere Verwendung
    window.currentAssignedContacts = [];
  
    checkboxes.forEach((checkbox) => {
      let optionDiv = checkbox.closest(".option");
      if (checkbox.checked) {
        optionDiv.classList.add("active");
        
        // Badge erstellen
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
        
        // Kontakt für spätere Verwendung speichern
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
function filterOptions(searchText) {
    let optionsContainer = document.getElementById('optionsContainer');
    searchText = searchText.trim(); 

    if (searchText.length < 2) {
        loadAllOptions();
    } else {
        optionsContainer.style.display = 'flex';
        updateOptionDisplay(searchText.toLowerCase()); 
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
    // Konvertiere von DD/MM/YYYY zu YYYY-MM-DD
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
}

/**
 * Task erstellen
 * @param {Object} taskData - Die Task-Daten
 * @returns {Promise} - Der erstellte Task mit ID
 */
async function createTask(taskData) {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Fehler beim Erstellen des Tasks: ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API-Fehler:', error);
      throw error;
    }
  }