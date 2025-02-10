/**
 * Generates the HTML for a category option.
 * @param {Object} category - The category data.
 * @param {string} category.name - The name of the category.
 * @param {string} category.color - The color associated with the category.
 * @returns {string} The HTML string for the category option.
 */
function createCategoryOptionHTML(category) {
    let initials = category.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
    let color = category.color || 'rgba(42, 54, 71, 1)';
    return `
        <span style="margin-right: 10px; background-color: ${color}; color: white; padding: 5px 10px; border-radius: 50%;">${initials}</span>
        <label style="flex-grow: 1;">${category.name}</label>
        <input type="checkbox" class="category-checkbox" data-initials="${initials}" data-color="${color}" data-name="${category.name}" data-id="${category.id}" onchange="updateSelectedAbbreviations()">
    `;
}


/**
 * Edits a subtask.
 * @param {HTMLElement} li - The subtask list item element.
 */
function editSubtask(li) {
    let span = li.querySelector('.subtask-text');
    if (li.querySelector('.edit-input')) return; 

    let input = createInputElement(span);
    let inputIcons = createInputIcons();

    appendElements(li, input, inputIcons);
    setupInputEventHandlers(li, span, input, inputIcons);

    span.style.display = 'none';
    li.querySelector('.subtask-icons').style.display = 'none';
    input.focus();
    input.select();
}

/**
 * Creates the input element for editing.
 * @param {HTMLElement} span - The span element containing the subtask text.
 * @returns {HTMLInputElement} The created input element.
 */
function createInputElement(span) {
    let input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent.replace(/^\•\s*/, '');
    input.className = 'edit-input';
    return input;
}

/**
 * Creates the input icons (delete and check).
 * @returns {HTMLDivElement} The created input icons container.
 */
function createInputIcons() {
    let inputIcons = document.createElement('div');
    inputIcons.className = 'input-icons';
    inputIcons.innerHTML = `
        <img src="/assets/img/contacts/delete.png" alt="Clear" class="delete-icon">
        <img src="/assets/img/addTask/check_grey.png" alt="Check" class="check-icon" onclick="submitEdit(this)">
    `;
    return inputIcons;
}

/**
 * Appends the input and icons to the list item.
 * @param {HTMLElement} li - The list item element.
 * @param {HTMLInputElement} input - The input element.
 * @param {HTMLDivElement} inputIcons - The input icons container.
 */
function appendElements(li, input, inputIcons) {
    li.appendChild(input);
    li.appendChild(inputIcons);
}

/**
 * Sets up event handlers for the input element.
 * @param {HTMLElement} li - The list item element.
 * @param {HTMLElement} span - The span element containing the subtask text.
 * @param {HTMLInputElement} input - The input element.
 * @param {HTMLDivElement} inputIcons - The input icons container.
 */
function setupInputEventHandlers(li, span, input, inputIcons) {
    input.addEventListener('blur', () => {
        if (input.value.trim() === "") {
            span.textContent = `• Placeholder Text`;
        } else {
            span.textContent = `• ${input.value.trim()}`;
            editTaskChangeSubtask(li.id, "change", `${input.value.trim()}`);
        }
        span.style.display = '';
        li.removeChild(input);
        li.removeChild(inputIcons);
        li.querySelector('.subtask-icons').style.display = 'flex';
    });
}


function closeAddTask(){
    document.getElementById('add-task-board').style.display = 'none';
}

function openAddTask(getKanbanCategy){
    document.getElementById('add-task-board').style.display = 'block';
   kanbanCategory = getKanbanCategy;
}

/**
 * Hides the options container if clicked outside.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} optionsContainer - The options container element.
 * @param {HTMLElement} assignedAddTaskButton - The assigned task button element.
 */
function hideOptionsContainer(event, optionsContainer, assignedAddTaskButton) {
    if (optionsContainer.style.display !== 'none' && !optionsContainer.contains(event.target) && event.target !== assignedAddTaskButton) {
        optionsContainer.style.display = 'none';
    }
}

/**
 * Sets up the assigned task button to toggle the options container.
 */
function setupAssignedTaskButton() {
    let assignedAddTaskButton = document.getElementById('assigned-addTask');
    let optionsContainer = document.getElementById('optionsContainer');
    assignedAddTaskButton.addEventListener('click', event => toggleOptionsContainer(event, optionsContainer));
    document.addEventListener('click', event => hideOptionsContainer(event, optionsContainer, assignedAddTaskButton));
    optionsContainer.addEventListener('click', event => event.stopPropagation());
}

/**
 * Sets up the assigned task button to toggle the options container.
 */
function setupAssignedTaskButton() {
    let assignedAddTaskButton = document.getElementById('assigned-addTask');
    let optionsContainer = document.getElementById('optionsContainer');
    assignedAddTaskButton.addEventListener('click', event => toggleOptionsContainer(event, optionsContainer));
    document.addEventListener('click', event => hideOptionsContainer(event, optionsContainer, assignedAddTaskButton));
    optionsContainer.addEventListener('click', event => event.stopPropagation());
}



/**
 * Updates the colors of the priority buttons.
 */
function updateButtonColors() {
    let urgent = document.getElementById("urgent");
    let medium = document.getElementById("medium");
    let low = document.getElementById("low");
    updateButtonColor(urgent, 'rgba(255, 61, 0, 1)', 'prio-up-orange', 'prio-up-white');
    updateButtonColor(medium, 'rgba(255, 168,0, 1)', 'prio-medium-ye', 'prio-medium-white');
    updateButtonColor(low, 'rgba(122, 226, 41, 1)', 'prio-down-green', 'prio-down-white');
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
    document.getElementById(iconDefault).classList.toggle('d-none', isActive);
    document.getElementById(iconActive).classList.toggle('d-none', !isActive);
    button.classList.toggle('btn-font', isActive);
}

/**
 * Sets the values and active states for priority buttons.
 * @param {HTMLElement} clickedButton - The clicked button element.
 */
function setButtonValues(clickedButton) {
    let buttons = document.querySelectorAll(".prio-addTask button");
    buttons.forEach(button => {
        button.setAttribute("value", button === clickedButton ? "true" : "false");
        button.classList.toggle("active", button === clickedButton);
    });
    updateButtonColors();
}

/**
 * Sets up event listeners for priority buttons.
 */
function setupPriorityButtons() {
    let buttons = document.querySelectorAll(".prio-addTask button");
    let mediumButton = document.getElementById("medium");
    buttons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            setButtonValues(button);
        });
    });
    setButtonValues(mediumButton);
}

//Subtask
/**
 * Adds a subtask to the list.
 */
function addSubtask() {
    let inputField = document.getElementById('input-title-addTasks');
    let subtask = inputField.value.trim();
    if (subtask === "") return;
    let ul = document.getElementById('addedTasks');
    ul.appendChild(createSubtaskElement(subtask));
    inputField.value = '';
}

function escapeHTML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function createSubtaskElement(subtask) {
    subtask = escapeHTML(subtask); // Sicherstellen, dass der Subtask-Text sicher für HTML ist
    let li = document.createElement('li');
    li.className = "one-subtask";
    li.innerHTML = `        
        <span class="subtask-text">• ${subtask}</span>
        <div class="subtask-icons">
            <img src="/assets/img/contacts/edit.png" alt="Bearbeiten" class="edit-icon">
            <img src="/assets/img/contacts/delete.png" alt="Löschen" class="delete-icon">
        </div>
    `;
    return li;
}

document.getElementById('addedTasks').addEventListener('click', event => handleSubtaskActions(event));

/**
 * Handles subtask edit and delete actions.
 * @param {MouseEvent} event - The click event.
 */
function handleSubtaskActions(event) {
    let li = event.target.closest('li');
    if (event.target.classList.contains('delete-icon') || event.target.classList.contains('clear-icon')) {
        li.remove();
    } else if (event.target.classList.contains('edit-icon')) {
        editSubtask(li);
    }
}

/**
 * Edits a subtask.
 * @param {HTMLElement} li - The subtask list item element.
 */
function editSubtask(li) {
    let span = li.querySelector('.subtask-text');
    let existingInput = li.querySelector('.edit-input');
    if (existingInput) {
        return; 
    }

    let input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent.replace(/^\•\s*/, '');
    input.className = 'edit-input';

    let inputIcons = document.createElement('div');
    inputIcons.className = 'input-icons';
    inputIcons.innerHTML = `
        <img src="/assets/img/contacts/delete.png" alt="Clear" class="delete-icon">
        <img src="/assets/img/addTask/check_grey.png" alt="Check" class="check-icon" onclick="submitEdit(this)">
    `;

    li.appendChild(input);
    li.appendChild(inputIcons);

    input.addEventListener('blur', () => {
        if (input.value.trim() === "") {
            span.textContent = `• Placeholder Text`; 
        } else {
            span.textContent = `• ${input.value.trim()}`;
        }
        span.style.display = ''; 
        li.removeChild(input);
        li.removeChild(inputIcons);
        li.querySelector('.subtask-icons').style.display = 'flex'; 
    });

    span.style.display = 'none'; 
    li.querySelector('.subtask-icons').style.display = 'none'; 
    input.focus();
    input.select(); 
}