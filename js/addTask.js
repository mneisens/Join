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
const firebaseConfig = {
    apiKey: "AIzaSyBrslTwOvrS4_tnF6uODjT1KQuWR4ttzFY",
    authDomain: "join193-5ae20.firebaseapp.com",
    databaseURL: "https://join193-5ae20-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join193-5ae20",
    storageBucket: "join193-5ae20.appspot.com",
    messagingSenderId: "330884835484",
    appId: "1:330884835484:web:20d71dc457ab9659d0a559"
};

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
    let checkboxes = document.querySelectorAll('.category-checkbox');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            contactNamesAndColors.push({
                name: checkbox.dataset.name,
                color: checkbox.dataset.color,
                initials: checkbox.dataset.initials,
                id: checkbox.dataset.id
            });
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
        kanbanCategory: kanbanCategory
    };
    return data;
}


/**
 * Submits the contact form to Firestore, either updating an existing contact or adding a new one.
 */
function submitContact() {
    let db = firebase.firestore();
    let data = collectFormData();
    let contactsCollection = db.collection("UserAuthList").doc(userCreds.uid).collection("addTasks");

    if (currentContactId) {
        contactsCollection.doc(currentContactId).set(data, { merge: true }).then(() => {
            showSuccessMessage();
        }).catch(error => console.error("Fehler beim Aktualisieren des Dokuments: ", error));
    } else {        
        contactsCollection.add(data).then(docRef => {
            contactsCollection.doc(docRef.id).set({ taskId: docRef.id }, { merge: true }).then(() => {
                showSuccessMessage();
            }).catch(error => console.error("Fehler beim Aktualisieren der ID des Dokuments: ", error));
        }).catch(error => console.error("Fehler beim Hinzufügen des Dokuments: ", error));
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
function loadCategories() {
    let db = firebase.firestore();
    let optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    db.collection("UserAuthList").doc(userCreds.uid).collection('contacts').orderBy('name').get().then(querySnapshot => {
        querySnapshot.forEach(doc => createCategoryOption(doc.data(), optionsContainer));
    }).catch(error => console.error("Error getting documents: ", error));
}

/**
 * Creates a category option element and appends it to the container.
 * @param {Object} category - The category data.
 * @param {string} category.name - The name of the category.
 * @param {string} category.color - The color associated with the category.
 */
function createCategoryOption(category, optionsContainer) {
    let optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 5px; box-sizing: border-box;`;
    optionDiv.innerHTML = createCategoryOptionHTML(category);

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
function updateSelectedAbbreviations() {
    let checkboxes = document.querySelectorAll('.category-checkbox');
    let abbreviationsContainer = document.getElementById('showName');
    abbreviationsContainer.innerHTML = '';
    checkboxes.forEach(checkbox => {
        let optionDiv = checkbox.closest('.option');
        if (checkbox.checked) {
            optionDiv.classList.add('active');
            let initialsDiv = document.createElement('div');
            initialsDiv.className = 'abbreviation-badge';
            initialsDiv.textContent = checkbox.dataset.initials;
            initialsDiv.style.cssText = `background-color: ${checkbox.dataset.color}; color: white; padding: 5px 10px; border-radius: 50%;`;
            abbreviationsContainer.appendChild(initialsDiv);
        } else {
            optionDiv.classList.remove('active');
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

