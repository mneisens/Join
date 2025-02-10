let dummyContacts;
let dummyTasks;

/**
 * Loads dummy contacts JSON data from a file.
 * @async
 * @function loadDummyContactJson
 * @returns {Promise<void>}
 */
async function loadDummyContactJson() {
    let src = '../json/dummyContacts.json';
    let response = await fetch(src);
    dummyContacts = await response.json();
}

/**
 * Loads dummy tasks JSON data from a file.
 * @async
 * @function loadDummyTasksJson
 * @returns {Promise<void>}
 */
async function loadDummyTasksJson() {
    let src = '../json/dummyTasks.json';
    let response = await fetch(src);
    dummyTasks = await response.json();
}

/**
 * Loads both dummy contacts and dummy tasks JSON data, then processes them.
 * @async
 * @function loadDummyJsons
 * @returns {Promise<void>}
 */
async function loadDummyJsons() {
    await loadDummyContactJson();
    await loadDummyTasksJson();
    await startToAddDummyContacts();
    await getDummyToPushContacts();
    await startToAddDummyTasks();
    setTimeout(function(){
        sumFinalLoadDataFromDatabase();
      }, 1000)
}

/**
 * Iterates through the dummy contacts and adds each one.
 * @async
 * @function startToAddDummyContacts
 * @returns {Promise<void>}
 */
async function startToAddDummyContacts() {
    for (let i = 0; i < dummyContacts.length; i++) {
        const dummyContact = dummyContacts[i];
        addDummyContacts(dummyContact);
    }
}

/**
 * Iterates through the dummy tasks and processes each one.
 * @async
 * @function startToAddDummyTasks
 * @returns {Promise<void>}
 */
async function startToAddDummyTasks() {
    for (let i = 0; i < dummyTasks.length; i++) {
        const dummyTask = dummyTasks[i];
        await takeTheRightUser(dummyTask);
    }
}

let pushedContactsIds = [];
let pushedTasksIds = [];

/**
 * Extracts the IDs from pushed dummy contacts and stores them.
 * @function getDummyContactsId
 * @param {Array<Object>} pushedDummyContacts - Array of pushed dummy contact objects.
 */
function getDummyContactsId(pushedDummyContacts) {
    for (let i = 0; i < pushedDummyContacts.length; i++) {
        const pushedDummyContact = pushedDummyContacts[i];
        pushedContactsIds.push(pushedDummyContact.id);
    }
}

/**
 * Extracts the IDs from pushed dummy tasks and stores them.
 * @function getDummyTasksId
 * @param {Array<Object>} pushedDummyTasks - Array of pushed dummy task objects.
 */
function getDummyTasksId(pushedDummyTasks) {
    for (let i = 0; i < pushedDummyTasks.length; i++) {
        const pushedDummyTask = pushedDummyTasks[i];
        pushedTasksIds.push(pushedDummyTask.taskId);
    }
}

/**
 * Deletes guest contacts based on stored IDs.
 * @async
 * @function startDeleteGuestContacts
 * @returns {Promise<void>}
 */
async function startDeleteGuestContacts() {
    for (let i = 0; i < pushedContactsIds.length; i++) {
        const pushedContactsId = pushedContactsIds[i];
        deleteGuestContacts(pushedContactsId);
    }
}

/**
 * Deletes guest tasks based on stored IDs.
 * @async
 * @function startDeleteGuestTasks
 * @returns {Promise<void>}
 */
async function startDeleteGuestTasks() {
    for (let i = 0; i < pushedTasksIds.length; i++) {
        const pushedTasksId = pushedTasksIds[i];
        deleteGuestTasks(pushedTasksId);
    }
}

let assignedContacts = [];
let pushedContacts = [];

/**
 * Sets the pushed contacts array.
 * @function createPushedContactsArray
 * @param {Array<Object>} contactDatas - Array of contact data objects.
 */

function createPushedContactsArray(contactDatas) {
    pushedContacts = contactDatas;
}

/**
 * Processes a dummy task and assigns the correct users to it.
 * @async
 * @function takeTheRightUser
 * @param {Object} dummyTask - The dummy task object.
 * @returns {Promise<void>}
 */
async function takeTheRightUser(dummyTask) {
    assignedContacts = [];
    let dummyTaskAssignedToContacts = dummyTask.assignedTo;
    for (let i = 0; i < dummyTaskAssignedToContacts.length; i++) {
        const dummyTaskAssignedToContact = dummyTaskAssignedToContacts[i];
        const dummyTaskAssignedToContactName = dummyTaskAssignedToContact.name;
        createAssignedToArray(dummyTaskAssignedToContactName);
    }
    addDummyTasks(dummyTask, assignedContacts);
}

/**
 * Creates an array of contacts assigned to a task.
 * @function createAssignedToArray
 * @param {string} taskAssignedToContactName - The name of the contact assigned to the task.
 */
function createAssignedToArray(taskAssignedToContactName) {
    for (let p = 0; p < pushedContacts.length; p++) {
        const pushedContact = pushedContacts[p];
        const pushedContactName = pushedContact.name;
        if (pushedContactName === taskAssignedToContactName) {
            assignedContacts.push(pushedContact);
        }
    }
}
