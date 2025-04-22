/**
 * Logs out the guest user by signing them out and clearing session storage.
 * @function logOutGuest
 */
let logOutGuest = () => {
    signOut(auth).then(() => {
        sessionStorage.removeItem("user-creds");
        sessionStorage.removeItem("user-info");
        sessionStorage.removeItem("start-Animation");
        window.location.href = 'log_in.html';
    })
}

/**
 * Starts the process of deleting the current guest user's data.
 * @async
 * @function startDeleteCurrentGuest
 * @returns {Promise<void>}
 */
async function startDeleteCurrentGuest() {
    await startDeleteDummyContacts();
    await startDeleteDummyTasks();
    await deleteGuestData();
    deleteGuestUser();
}

/**
 * Starts the process of deleting dummy contacts.
 * @async
 * @function startDeleteDummyContacts
 * @returns {Promise<void>}
 */
async function startDeleteDummyContacts() {
    await getDummyContacts();
    startDeleteGuestContacts();
}

/**
 * Starts the process of deleting dummy tasks.
 * @async
 * @function startDeleteDummyTasks
 * @returns {Promise<void>}
 */
async function startDeleteDummyTasks() {
    await getDummyTasks();
    startDeleteGuestTasks();
}

/**
 * Adds a dummy contact to the database.
 * @async
 * @function addDummyContacts
 * @param {Object} dummyContact - The dummy contact object.
 * @returns {Promise<void>}
 */
async function addDummyContacts(dummyContact) {
    try {
        let contactRef = collection(db, 'UserAuthList', userCreds.uid, 'contacts');
        let newDocRef = doc(contactRef);
        let docID = newDocRef.id;
        let contactData = {
            name: dummyContact.name,
            email: dummyContact.email,
            phone: dummyContact.phone,
            id: docID,
            color: dummyContact.color,
            initials: dummyContact.initials
        };
        await setDoc(newDocRef, contactData);
    } catch (error) {

    }
}

/**
 * Adds a dummy task to the database.
 * @async
 * @function addDummyTasks
 * @param {Object} dummyTask - The dummy task object.
 * @param {Array<Object>} assignedContacts - Array of assigned contacts.
 * @returns {Promise<void>}
 */
async function addDummyTasks(dummyTask, assignedContacts) {
    try {
        let contactRef = collection(db, 'UserAuthList', userCreds.uid, 'addTasks');
        let newDocRef = doc(contactRef);
        let docID = newDocRef.id;
        let taskData = {
            header: dummyTask.header,
            description: dummyTask.description,
            dueDate: dummyTask.dueDate,
            priority: dummyTask.priority,
            category: dummyTask.category,
            subtasks: dummyTask.subtasks,
            categoryAbbreviations: dummyTask.categoryAbbreviations,
            assignedTo: assignedContacts,
            kanbanCategory: dummyTask.kanbanCategory,
            taskId: docID
        };
        await setDoc(newDocRef, taskData);
    } catch (error) {

    }
}

/**
 * Retrieves dummy contacts from the database.
 * @async
 * @function getDummyContacts
 * @returns {Promise<void>}
 */
async function getDummyContacts() {
    try {
        let contactRef = collection(db, 'UserAuthList', userCreds.uid, 'contacts');
        let querySnapshot = await getDocs(contactRef);
        if (!querySnapshot.empty) {
            let pushedDummyContacts = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                pushedDummyContacts.push(data);
            });
            getDummyContactsId(pushedDummyContacts);
        } else {
        }
    } catch (error) {

    }
}

/**
 * Retrieves dummy contacts and prepares them to be pushed.
 * @async
 * @function getDummyToPushContacts
 * @returns {Promise<void>}
 */
async function getDummyToPushContacts() {
    try {
        let contactRef = collection(db, 'UserAuthList', userCreds.uid, 'contacts');
        let querySnapshot = await getDocs(contactRef);
        if (!querySnapshot.empty) {
            let xy = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                xy.push(data);
            });
            createPushedContactsArray(xy);
        } else {
        }
    } catch (error) {

    }
}

/**
 * Retrieves dummy tasks from the database.
 * @async
 * @function getDummyTasks
 * @returns {Promise<void>}
 */
async function getDummyTasks() {
    try {
        let contactRef = collection(db, 'UserAuthList', userCreds.uid, 'addTasks');
        let querySnapshot = await getDocs(contactRef);
        if (!querySnapshot.empty) {
            let pushedDummyTasks = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                pushedDummyTasks.push(data);
            });
            getDummyTasksId(pushedDummyTasks);
        } else {
        }
    } catch (error) {

    }
}

/**
 * Deletes a guest contact from the database.
 * @async
 * @function deleteGuestContacts
 * @param {string} contactID - The ID of the contact to be deleted.
 * @returns {Promise<void>}
 */
async function deleteGuestContacts(contactID) {
    try {
        let docRef = doc(db, 'UserAuthList', userCreds.uid, 'contacts', contactID);
        await deleteDoc(docRef);
    } catch (error) {

    }
}

/**
 * Deletes a guest task from the database.
 * @async
 * @function deleteGuestTasks
 * @param {string} taskId - The ID of the task to be deleted.
 * @returns {Promise<void>}
 */
async function deleteGuestTasks(taskId) {
    try {
        let docRef = doc(db, 'UserAuthList', userCreds.uid, 'addTasks', taskId);
        await deleteDoc(docRef);
    } catch (error) {

    }
}

/**
 * Deletes the guest user's data from the database.
 * @async
 * @function deleteGuestData
 * @returns {Promise<void>}
 */
async function deleteGuestData() {
    try {
        let docRef = doc(db, 'UserAuthList', userCreds.uid);
        await deleteDoc(docRef);
    } catch (error) {
    }
}

/**
 * Deletes the guest user from authentication and logs them out.
 * @async
 * @function deleteGuestUser
 * @returns {Promise<void>}
 */
async function deleteGuestUser() {
    let user = auth.currentUser;
    await deleteUser(user)
    .then(() => {
        logOutGuest();
    }).catch(error => {

    })
}



window.addDummyContacts = addDummyContacts;
window.addDummyTasks = addDummyTasks;
window.getDummyToPushContacts = getDummyToPushContacts;
window.startDeleteCurrentGuest = startDeleteCurrentGuest;
window.getDummyTasks = getDummyTasks;
window.getDummyContacts = getDummyContacts;
window.deleteGuestTasks = deleteGuestTasks;
window.deleteGuestContacts = deleteGuestContacts;
window.deleteGuestUser = deleteGuestUser;