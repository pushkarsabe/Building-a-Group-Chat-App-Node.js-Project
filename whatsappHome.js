const contactList = document.getElementById('contactList');
const singleUserList = document.getElementById('singleUserList');
document.getElementById('chatForm').addEventListener('submit', submitChat);
let lastChatID = 0;
const HOST = 'localhost';
// const HOST = '16.16.201.152';

//load create new popup and close popup
document.getElementById('loadPopupbutton').addEventListener('click', loadCreateGroupPopupAndGetData);
document.getElementById('closeGroupPopup').addEventListener('click', closePopup);
document.getElementById('createGroup').addEventListener('click', createGroup);

//load create single user popup and close popup
document.getElementById('loadSingleUserPopupbutton').addEventListener('click', loadSingleUserPopup);
document.getElementById('closeSingleUserPopup').addEventListener('click', closeSingleUserPopup);
document.getElementById('createSingleUserGroup').addEventListener('click', createSingleUserGroup);

//load remove contact popup and close popup
document.getElementById('removeContactBtn').addEventListener('click', loadRemoveContactPopup);
document.getElementById('closeRemoveContactPopup').addEventListener('click', closeRemoveContactPopup);
document.getElementById('removeSelectedContacts').addEventListener('click', removeSelectedContacts);

//load add contact popup and close popup
document.getElementById('addContactBtn').addEventListener('click', loadAddContactPopup);
document.getElementById('closeAddContactPopup').addEventListener('click', closeAddContactPopup);
document.getElementById('addSelectedContacts').addEventListener('click', addSelectedContacts);

//load promote to admin popup and close popup
document.getElementById('addAdminBtn').addEventListener('click', loadAddAdminPopup);
document.getElementById('closeaddAdminPopup').addEventListener('click', closeaddAdminPopup);
document.getElementById('promoteToAdmin').addEventListener('click', promoteToAdmin);

//delete group or chat
document.getElementById('deleteGroup').addEventListener('click', deleteGroup);

function decodeJwt(token) {
    console.log('inside decodeJwt...');
    console.log("token  = " + token);

    const parts = token.split(".");

    if (parts.length != 3) {
        console.log("invalid token");
        return;
    }
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    // console.log('Header:', header);
    // console.log('Payload:', payload);

    return { header, payload };
}//decodeJwt

function filterContacts(contactList, searchValue, appendContactContainer) {
    console.log('inside filterContacts:');
    console.log("contactList  = " + JSON.stringify(contactList));

    const filteredContacts = contactList.filter(contact =>
        contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.phoneNumber.includes(searchValue)
    );
    // Display filtered contacts
    displayContacts(filteredContacts, appendContactContainer);
}//filterContacts

//this will create a div with checkbx and list of users 
function displayContacts(contactList, displayContainer) {
    displayContainer.innerHTML = ''; // Clear any existing list

    contactList.forEach(contact => {
        const div = document.createElement('div');
        div.classList.add('contact-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = contact.id;

        const label = document.createElement('label');
        label.htmlFor = contact.name;
        label.textContent = `${contact.name}, Phone: ${contact.phoneNumber}`;

        div.appendChild(checkbox);
        div.appendChild(label);
        displayContainer.appendChild(div);
    });
}//displayContacts

async function loadCreateGroupPopupAndGetData() {
    document.getElementById('groupPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    console.log('inside loadCreateGroupPopupAndGetData...');
    //call the method to get all user data and append the user inside list
    getAllUserData(contactList);
}//loadCreateGroupPopupAndGetData

function closePopup() {
    document.getElementById('groupPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function getAllUserData(ListContainer) {
    console.log('inside getAllUserData...');
    let userid = localStorage.getItem('userid');
    console.log('userid =' + userid);

    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    try {
        const response = await axios.get(`http://${HOST}:3000/user/user-data`, {
            headers: {
                "Authorization": token
            }
        });
        let chatData = response.data.allUserData;
        localStorage.setItem('chatData', JSON.stringify(chatData));
        console.log("chatData  = " + JSON.stringify(chatData));

        // displayContacts(chatData, ListContainer);


        // we will filter the search only for single user chat and not for group popup
        if (ListContainer === singleUserContactList) {
            console.log(" single User Contact List");
            let filteredSingleUsers = chatData.filter(chat => chat.id != userid);
            console.log("filteredSingleUsers  = " + JSON.stringify(filteredSingleUsers));

            displayContacts(filteredSingleUsers, ListContainer);

            // Add event listener to the search input to filter contacts in real-time
            document.getElementById('searchInputSingleUser').addEventListener('input', function () {
                console.log("this.value = " + this.value);
                filterContacts(chatData, this.value, singleUserContactList);
            });
        }
        else {
            //display the data on popup for group
            console.log(" contact List group");
            displayContacts(chatData, ListContainer);
        }

    }
    catch (err) {
        console.log("loadCreateGroupPopupAndGetData error = " + err);
    }
}//getAllUserData

async function loadSingleUserPopup() {
    document.getElementById('singleUserPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    console.log('inside loadSingleUserPopup...');
    //call the method to get all user data and append the user inside list
    const singleUserContactList = document.getElementById('singleUserContactList');
    getAllUserData(singleUserContactList);
}
function closeSingleUserPopup() {
    document.getElementById('singleUserPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function createSingleUserGroup() {
    console.log('inside createSingleUserGroup...');
    const chatData = JSON.parse(localStorage.getItem('chatData'));
    let userid = localStorage.getItem('userid');
    console.log("userid  = " + userid);
    console.log("chatData  = " + JSON.stringify(chatData));

    const selectedContacts = [];
    const checkboxes = document.querySelectorAll("#singleUserContactList input[type ='checkbox']:checked");
    console.log("checkboxes  = " + JSON.stringify(checkboxes));

    checkboxes.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId  = " + contactId);
        const contact = chatData.find(c => c.id === Number(contactId)); // Assuming chatData is available

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts  = " + JSON.stringify(selectedContacts));

    if (selectedContacts.length > 0) {
        //only one contact is needed for single user chat
        if (selectedContacts.length == 1) {
            console.log("selectedContacts  = " + JSON.stringify(selectedContacts));
            let groupName = 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH';
            let groupUserNames = selectedContacts[0].name;
            let groupUserIDS = selectedContacts[0].id;
            let groupPhoneNumbers = selectedContacts[0].phoneNumber;
            console.log("groupName  = " + groupName);
            console.log("groupUserNames  = " + groupUserNames);
            console.log("groupUserIDS  = " + groupUserIDS);
            console.log("groupPhoneNumbers  = " + groupPhoneNumbers);
            const obj = {
                groupName: groupName,
                groupUserNames: groupUserNames,
                groupUserIDS: groupUserIDS,
                groupPhoneNumbers: groupPhoneNumbers,
            };

            let token = localStorage.getItem('token');
            if (!token) {
                alert("Token not found. Please log in.");
                return;
            }
            try {
                const res = await axios.post(`http://${HOST}:3000/groups/save-data`, obj, {
                    headers: {
                        "Authorization": token
                    }
                });
                console.log("res  = " + JSON.stringify(res));
                console.log('userId = ' + res.data.submittedGroupData.userId);
                const data = res.data.submittedGroupData;
                console.log("data  = " + JSON.stringify(data));

                const li = document.createElement('li');
                li.appendChild(document.createTextNode(`${res.data.submittedGroupData.groupUserNames}`));
                li.style.cursor = "pointer";
                li.addEventListener('click', () => {
                    loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
                })
                singleUserList.appendChild(li);

                //save the data of the user as admin 
                saveAdminData(res.data.submittedGroupData.userId, res.data.submittedGroupData.id);

                closeSingleUserPopup();
            } catch (err) {
                console.log("createSingleUserGroup error = " + err);
                if (err.response) {
                    console.log("Server responded with an error: ", err.response.data);
                    alert(`Error: ${err.response.data.message}`);
                }
                else if (err.request) {
                    console.log("No response received: ", err.request);
                    alert('No response from the server. Please check your network connection.');
                }
                else {
                    console.log("Error in setting up request: ", err.message);
                }
            }
        }
        else {
            alert('Multiple contact selected,only select one contact');
        }
    }
    else {
        alert('No contact selected');
    }

}//createSingleUserGroup   

async function createGroup() {
    console.log('inside createGroup...');
    const groupName = document.getElementById('groupName').value;
    const groupList = document.getElementById('groupList');
    const chatData = JSON.parse(localStorage.getItem('chatData'));
    localStorage.setItem('chatData', JSON.stringify(chatData));
    const selectedContacts = [];
    const checkboxes = document.querySelectorAll("#contactList input[type ='checkbox']:checked");
    console.log("checkboxes  = " + JSON.stringify(checkboxes));

    checkboxes.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId  = " + contactId);
        const contact = chatData.find(c => c.id === Number(contactId)); // Assuming chatData is available

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts  = " + JSON.stringify(selectedContacts));

    //to check if the user altleast selected one user
    if (groupName && selectedContacts.length > 0) {

        let groupUserNames = "", groupUserIDS = "", groupPhoneNumbers = "";

        for (let i = 0; i < selectedContacts.length; i++) {
            groupUserNames += selectedContacts[i].name + ",";
            groupUserIDS += selectedContacts[i].id + ",";
            groupPhoneNumbers += selectedContacts[i].phoneNumber + ",";
        }
        console.log('before trailing...');
        console.log("groupName  = " + groupName);
        console.log("groupUserNames  = " + groupUserNames);
        console.log("groupUserIDS  = " + groupUserIDS);
        console.log("groupPhoneNumbers  = " + groupPhoneNumbers);
        groupUserNames = groupUserNames.slice(0, -1);
        groupUserIDS = groupUserIDS.slice(0, -1);
        groupPhoneNumbers = groupPhoneNumbers.slice(0, -1);
        console.log('after trailing...');
        console.log("groupUserNames  = " + groupUserNames);
        console.log("groupUserIDS  = " + groupUserIDS);
        console.log("groupPhoneNumbers  = " + groupPhoneNumbers);

        const obj = {
            groupName: groupName,
            groupUserNames: groupUserNames,
            groupUserIDS: groupUserIDS,
            groupPhoneNumbers: groupPhoneNumbers,
        };

        let token = localStorage.getItem('token');
        if (!token) {
            alert("Token not found. Please log in.");
            return;
        }
        try {
            const res = await axios.post(`http://${HOST}:3000/groups/save-data`, obj, {
                headers: {
                    "Authorization": token
                }
            });
            console.log("res  = " + JSON.stringify(res));
            console.log('userid = ' + res.data.submittedGroupData.userid);

            const li = document.createElement('li');
            li.appendChild(document.createTextNode(`${groupName} : ${res.data.submittedGroupData.groupUserNames}`));
            li.style.cursor = "pointer";
            li.addEventListener('click', () => {
                loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
            })
            groupList.appendChild(li);

            saveAdminData(res.data.submittedGroupData.userId, res.data.submittedGroupData.id);

            document.getElementById('groupName').value = "";

            closePopup();
        } catch (err) {
            console.log("createGrou pInBackend error = " + err);
        }

    } else {
        alert("Please enter a group name.");
    }
}//createGroup

async function saveAdminData(groupAdminIDS, groupId) {
    console.log('inside saveAdminData...');
    console.log("groupAdminIDS  = " + groupAdminIDS);
    console.log("groupId  = " + groupId);
    let obj = {
        groupAdminIDS: groupAdminIDS,
        groupId: groupId
    }
    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    try {
        const res = await axios.post(`http://${HOST}:3000/admin/save-admin`, obj, {
            headers: {
                "Authorization": token
            }
        });
        console.log("res  = " + JSON.stringify(res));
        // console.log('userid = ' + res.data.submittedGroupData.userid);

    } catch (err) {
        console.log("saveAdminData error = " + err);
    }


}//saveAdminData

window.document.addEventListener('DOMContentLoaded', async () => {
    console.log('inside DOMContentLoaded...');
    let token = localStorage.getItem('token');
    console.log('token:', token);
    const { payload } = decodeJwt(token);
    console.log('Payload:', payload);
    console.log('userid = ', payload.userid);

    //save the userid of the user who is currently logged-in
    if (!payload.userid) {
        console.log("No userid found, Please log in.");
    }
    else
        localStorage.setItem('userid', payload.userid);

    if (!token) {
        alert("Token not found. Please log in.");
        return;
    }
    try {
        const res = await axios.get(`http://${HOST}:3000/groups/get-data`, {
            headers: {
                "Authorization": token
            }
        });
        // console.log("res  = " + JSON.stringify(res));
        for (let i = 0; i < res.data.allGroupData.length; i++) {
            printallGroupDataOnFrontend(res.data.allGroupData[i]);
        }
        //inside printing the group data the functin is storing the values and you can use it here
        // Check if there's a previously selected group in localStorage
        const savedGroupId = localStorage.getItem('groupId');
        const savedGroupUserID = localStorage.getItem('groupUserID');
        const savedGroupName = localStorage.getItem('groupName');
        console.log('savedGroupId:', savedGroupId);
        console.log('savedGroupUserID:', savedGroupUserID);
        console.log('savedGroupName:', savedGroupName);


        //this will reload the old chat and group when user refreshes the page
        if (savedGroupId && savedGroupUserID) {
            await loadChatPage(savedGroupId, savedGroupUserID, savedGroupName);
        }

    } catch (err) {
        console.log("createGroupInBackend error = " + err);
    }

})//DOMContentLoaded

function printallGroupDataOnFrontend(data) {
    console.log('inside printallGroupDataOnFrontend...');
    // console.log("data  = " + JSON.stringify(data));

    //only undeleted data is shown on frontend
    if (data.isDeleted == false) {
        // before appending to frontend check if the data is for group or single user
        if (data.groupName === 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(`${data.groupUserNames}`));
            li.id = data.groupUserIDS;
            li.style.cursor = "pointer";
            li.addEventListener('click', () => {
                loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
            })

            singleUserList.appendChild(li);
        }
        else {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(`${data.groupName} : ${data.groupUserNames}`));
            li.id = data.groupUserIDS;
            li.style.cursor = "pointer";
            li.addEventListener('click', () => {
                loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
            })
            groupList.appendChild(li);
        }
    }
}//printallGroupDataOnFrontend

async function loadRemoveContactPopup() {
    console.log('inside loadRemoveContactPopup:');
    // Show the remove contact popup
    document.getElementById('removeContactPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    let ADMIN = localStorage.getItem("ADMIN");
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    //get ADMIN value from LS, if the user is admin or not
    console.log("ADMIN  = " + ADMIN);
    if (ADMIN == 'true') {
        console.log("ADMIN is true");

        console.log("groupId  = " + groupId);
        console.log("groupUserID  = " + groupUserID);
        //when the user clicks on delete button without selecting any groups
        if (groupId == null && groupUserID == null) {
            alert('Please select a group first to remove contact from group');
        }
        else {

            let arrayGroupUserID = groupUserID.split(",").map(num => parseInt(num));
            console.log("arrayGroupUserID  = " + arrayGroupUserID);
            let token = localStorage.getItem('token');

            if (!token && !groupId) {
                console.log("Token not found. Please log in.");
                return;
            }
            else {
                try {
                    const res = await axios.get(`http://${HOST}:3000/user/user-data`, {
                        headers: {
                            "Authorization": token
                        }
                    });
                    // console.log("res  = " + JSON.stringify(res));
                    let allUserData = res.data.allUserData;
                    // console.log("allUserData  = " + JSON.stringify(allUserData));
                    //get only the usesr which are in the group
                    let filteredUsersToRemove = allUserData.filter(user => arrayGroupUserID.includes(user.id));
                    console.log("filteredUsersToRemove  = " + JSON.stringify(filteredUsersToRemove));
                    // Store filtered users in localStorage
                    localStorage.setItem('filteredUsersToRemove', JSON.stringify(filteredUsersToRemove));

                    // Populate the removeContactList with group members
                    const contactList = document.getElementById('removeContactList');
                    // Display the full contact list initially
                    displayContacts(filteredUsersToRemove, contactList);

                } catch (err) {
                    console.log("Error loading contacts:", err);
                }
            }
        }

    } else {
        console.log("ADMIN is false");
        alert('User is not a Admin in this group');
        closeRemoveContactPopup();
    }

}//loadRemoveContactPopup

function closeRemoveContactPopup() {
    document.getElementById('removeContactPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}//closeRemoveContactPopup

async function removeSelectedContacts() {
    console.log('inside removeSelectedContacts...');
    let groupId = localStorage.getItem('groupId');
    let filteredUsersToRemove = JSON.parse(localStorage.getItem('filteredUsersToRemove'));
    console.log("groupId  = " + groupId);
    console.log("filteredUsersToRemove  = " + JSON.stringify(filteredUsersToRemove));
    const selectedContacts = [];
    const checkboxes = document.querySelectorAll("#removeContactList input[type ='checkbox']:checked");
    console.log("checkboxes  = " + JSON.stringify(checkboxes));

    checkboxes.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId  = " + contactId);
        const contact = filteredUsersToRemove.find(c => c.id === Number(contactId));

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts  = " + JSON.stringify(selectedContacts));
    //check if the user has seletcted one contact
    if (selectedContacts.length == 0 && checkboxes.length == 0) {
        alert('Atleast select one user to remove');
    } else {

        let token = localStorage.getItem('token');

        if (!token && !groupId) {
            alert("Token and groupId not found. Please log in.");
            return;
        } else {

            try {
                //Send selectedContacts in the request body
                const res = await axios.post(`http://${HOST}:3000/groups/delete-data`,
                    {
                        groupId: groupId,
                        selectedContacts: selectedContacts
                    },
                    {
                        headers: {
                            "Authorization": token
                        }
                    });
                console.log(res.data);
                console.log("res  = " + res.data.message);

                closeRemoveContactPopup();
            } catch (err) {
                console.log("Error removing contacts:", err);
            }//try -catch block
        }

    }
}//removeSelectedContacts      

async function loadAddContactPopup() {
    console.log('inside loadAddContactPopup:');
    // Show the remove contact popup
    document.getElementById('addContactPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    let ADMIN = localStorage.getItem("ADMIN");
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    console.log("groupId  = " + groupId);
    console.log("groupUserID  = " + groupUserID);

    //if user is not a admin of the group then he should not be able to add members inside group
    if (ADMIN == 'true') {
        console.log("ADMIN  = " + ADMIN);
        console.log("ADMIN is true");

        //when the user clicks on delete button without selecting any groups
        if (groupId == null && groupUserID == null) {
            alert('Please select a group first to remove contact from group');
        }
        else {
            let arrayGroupUserID = groupUserID.split(",").map(num => parseInt(num));
            console.log("arrayGroupUserID  = " + arrayGroupUserID);
            let token = localStorage.getItem('token');

            if (!token && !groupId) {
                console.log("Token not found. Please log in.");
                return;
            } else {
                try {
                    const res = await axios.get(`http://${HOST}:3000/user/user-data`, {
                        headers: {
                            "Authorization": token
                        }
                    });
                    // console.log("res  = " + JSON.stringify(res));
                    let allUserData = res.data.allUserData;
                    // console.log("allUserData  = " + JSON.stringify(allUserData));   
                    //get only the usesr which are in the group
                    let filteredUsersToAdd = allUserData.filter(user => !arrayGroupUserID.includes(user.id));
                    // console.log("filteredUsersToAdd  = " + JSON.stringify(filteredUsersToAdd));
                    //aa it to the localstorage
                    localStorage.setItem('filteredUsersToAdd', JSON.stringify(filteredUsersToAdd));

                    const addContactList = document.getElementById('addContactList');

                    // Display the full contact list initially
                    displayContacts(filteredUsersToAdd, addContactList);

                    // Add event listener to the search input to filter contacts in real-time
                    document.getElementById('searchInputAddContact').addEventListener('input', function () {
                        filterContacts(filteredUsersToAdd, this.value, addContactList);
                    });

                } catch (err) {
                    console.log("Error loading contacts:", err);
                }
            }
        }
    } else {
        console.log("ADMIN is false");
        alert('User is not a Admin in this group');
        closeAddContactPopup();
    }


}//loadAddContactPopup

async function addSelectedContacts() {
    console.log('inside addSelectedContacts...');
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    console.log("groupId  = " + groupId);
    console.log("groupUserID  = " + groupUserID);
    let filteredUsersToAdd = JSON.parse(localStorage.getItem('filteredUsersToAdd'));
    // console.log("filteredUsersToAdd  = " + JSON.stringify(filteredUsersToAdd));
    const selectedContacts = [];
    let checkbox = document.querySelectorAll("#addContactList input[type ='checkbox']:checked");

    console.log("checkbox  = " + JSON.stringify(checkbox));

    checkbox.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId  = " + contactId);
        const contact = filteredUsersToAdd.find(c => c.id === Number(contactId));
        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts  = " + JSON.stringify(selectedContacts));

    //when the user clicks on delete button without selecting any groups
    if (groupId == null && groupUserID == null) {
        alert('Please select a group first to remove contact from group');
    }
    else {
        let token = localStorage.getItem('token');

        if (!token && !groupId) {
            console.log("Token not found. Please log in.");
            return;
        } else {
            try {
                const res = await axios.post(`http://${HOST}:3000/groups/update-data`,
                    {
                        groupId: groupId,
                        selectedContacts: selectedContacts
                    },
                    {
                        headers: {
                            "Authorization": token
                        }
                    });
                console.log("res  = " + JSON.stringify(res));
                console.log("res  = " + res.data.message);

                closeAddContactPopup();
            } catch (err) {
                console.log("Error loading contacts:", err);
            }
        }
    }

}//addSelectedContacts

function closeAddContactPopup() {
    document.getElementById('addContactPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}//closeRemoveContactPopup

async function loadAddAdminPopup() {
    console.log('inside loadAddAdminPopup');
    // Show the remove contact popup
    document.getElementById('addAdminPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    let ADMIN = localStorage.getItem("ADMIN");
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    let userid = localStorage.getItem('userid');
    console.log("userid  = " + userid);
    console.log("groupId  = " + groupId);
    console.log("groupUserID  = " + groupUserID);

    //if the user is admin of the group then only he can promote to admin
    if (ADMIN == 'true') {
        console.log("ADMIN  = " + ADMIN);

        //when the user clicks on delete button without selecting any groups
        if (groupId == null && groupUserID == null) {
            alert('Please select a group first to remove contact from group');
        } else {

            //remove the admins contact from popup, cause admin of the group can not prmote himself
            let arrayGroupUserID = groupUserID.split(",").map(num => parseInt(num));
            console.log("arrayGroupUserID  = " + arrayGroupUserID);
            integerUserId = Number(userid);
            console.log("integerUserId  = " + typeof (integerUserId));
            arrayGroupUserID = arrayGroupUserID.filter(id => id !== integerUserId);
            console.log("arrayGroupUserID  = " + arrayGroupUserID);

            let token = localStorage.getItem('token');

            if (!token && !groupId) {
                console.log("Token not found. Please log in.");
                return;
            }
            else {
                try {

                    const res = await axios.get(`http://${HOST}:3000/user/user-data`, {
                        headers: {
                            "Authorization": token
                        }
                    });
                    // console.log("res  = " + JSON.stringify(res));
                    let allUserData = res.data.allUserData;
                    //get only the usesr which are in the group
                    let filteredUsersTopromote = allUserData.filter(user => arrayGroupUserID.includes(user.id));
                    console.log("filteredUsersTopromote  = " + JSON.stringify(filteredUsersTopromote));
                    // Store filtered users in localStorage
                    localStorage.setItem('filteredUsersTopromote', JSON.stringify(filteredUsersTopromote));

                    // // Populate the removeContactList with group members
                    const contactList = document.getElementById('addAdminList');
                    displayContacts(filteredUsersTopromote, contactList);

                } catch (err) {
                    console.log("Error loading contacts:", err);
                }
            }
        }
    }
    else {
        console.log("ADMIN  = " + ADMIN);
        alert('User is not a Admin in this group');
        closeaddAdminPopup();
    }

}//loadAddAdminPopup

function closeaddAdminPopup() {
    document.getElementById('addAdminPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}//closeRemoveContactPopup

async function promoteToAdmin() {
    console.log('inside promoteToAdmin...');
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    console.log("groupId  = " + groupId);
    console.log("groupUserID  = " + groupUserID);
    let filteredUsersTopromote = JSON.parse(localStorage.getItem('filteredUsersTopromote'));
    console.log("filteredUsersTopromote  = " + JSON.stringify(filteredUsersTopromote));
    const selectedContacts = [];
    let checkbox = document.querySelectorAll("#addAdminList input[type ='checkbox']:checked");

    console.log("checkbox  = " + JSON.stringify(checkbox));

    checkbox.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId  = " + contactId);
        const contact = filteredUsersTopromote.find(c => c.id === Number(contactId));

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts  = " + JSON.stringify(selectedContacts));

    //when the user clicks on delete button without selecting any groups
    if (groupId == null && groupUserID == null) {
        alert('Please select a group first to promote to admin');
    }
    else {

        let token = localStorage.getItem('token');

        if (!token && !groupId) {
            alert("Token not found. Please log in.");
            return;
        } else {
            try {
                const res = await axios.post(`http://${HOST}:3000/admin/add-admin`,
                    {
                        groupId: groupId,
                        selectedContacts: selectedContacts
                    },
                    {
                        headers: {
                            "Authorization": token
                        }
                    });
                console.log("res  = " + JSON.stringify(res));
                console.log("message  = " + res.data.message);
                console.log("addedAdminData  = " + res.data.addedAdminData);

                closeaddAdminPopup();
            } catch (err) {
                console.log("Error loading contacts:", err);
            }
        }
    }
}//promoteToAdmin

async function loadChatPage(groupId, groupUserID, groupName, groupUserNames) {
    const chatArea = document.getElementById('chatArea');
    const chatContent = document.getElementById('chatContent');
    console.log('inside loadChatPage...');

    localStorage.setItem('groupId', groupId);
    localStorage.setItem('groupUserID', groupUserID);
    localStorage.setItem('groupName', groupName);
    localStorage.setItem('groupUserNames', groupUserNames);
    console.log('groupId = ' + groupId);
    console.log('groupUserID = ' + groupUserID);
    console.log('groupName = ' + groupName);
    console.log('groupUserNames = ' + groupUserNames);

    chatContent.innerHTML = '';

    const h3Element = chatArea.querySelector('h3');
    if (groupName == 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
        h3Element.textContent = `User : ${groupUserNames}`;
    }
    else {
        h3Element.textContent = `Group : ${groupName}`;
    }

    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    if (!groupId) {
        alert("Please select a group first");
    }
    try {

        const response = await axios.get(`http://${HOST}:3000/chat/get-chat?groupId=${groupId}`, {
            headers: {
                "Authorization": token
            }
        });
        // console.log('Chat data response:', response.data.allChatData);

        response.data.allChatData.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chatDIV');
            chatItem.textContent = chat.chatName;
            chatContent.appendChild(chatItem);
        });

        const res = await axios.get(`http://${HOST}:3000/admin/get-admin?groupId=${groupId}`, {
            headers: {
                "Authorization": token
            }
        });
        console.log('admin data response:', res.data.allAdminData);
        const adminDataObj = res.data.allAdminData[0];

        // Check if there is no data in the allAdminData array
        if (!res.data.allAdminData || res.data.allAdminData.length === 0) {
            console.log("No admin data received");
        }
        else {

            let groupAdminIDS = adminDataObj.groupAdminIDS;
            console.log('groupAdminIDS = ' + groupAdminIDS);
            let userid = localStorage.getItem('userid');
            console.log('userid = ' + userid);

            let groupAdminIDSArray = groupAdminIDS.split(",");
            console.log('groupAdminIDSArray = ' + groupAdminIDSArray);

            if (groupAdminIDSArray.includes(userid)) {
                console.log("User is Admin inside this group, userId exists in groupAdminIDs");
                localStorage.setItem("ADMIN", true);
            } else {
                console.log("User is not a Admin inside this group, userId does not exist in groupAdminIDs");
                localStorage.setItem("ADMIN", false);
            }
        }

    } catch (err) {
        console.log("Error fetching chat data:", err);
        chatContent.textContent = "Failed to load chat data.";
    }
}

async function deleteGroup() {
    console.log('inside deleteGroup...');
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    let ADMIN = localStorage.getItem("ADMIN");
    console.log("groupId  = " + groupId);
    console.log("ADMIN  = " + ADMIN);

    if (ADMIN === 'true') {
        let token = localStorage.getItem('token');
        if (!token) {
            console.log("Token not found. Please log in.");
            return;
        }
        if (!groupId) {
            alert("Please select a group first");
        }
        let userInput = confirm("Are you sure you want to remove this gruop ?");
        if (userInput) {
            try {
                const response = await axios.put(`http://${HOST}:3000/groups/update-group`,
                    {
                        groupId: groupId
                    }
                    , {
                        headers: {
                            "Authorization": token
                        },

                    });
                console.log('delete response:', JSON.stringify(response));

                if (response.data.message === "Data removed") {
                    alert('Group removed Successfully');
                }
                else
                    console.log("Group not deleted");

            } catch (err) {
                console.log("Error deleting group data:", err);
            }

        }
    }
    else {
        console.log("ADMIN  = " + ADMIN);
        alert('User is not a Admin in this group');
    }

}//deleteGroup

async function submitChat(event) {
    event.preventDefault();
    console.log('inside submitChat');
    let userChat = document.getElementById('userChat');
    console.log('userChat = ' + userChat.value);
    let token = localStorage.getItem('token');
    console.log('token = ' + token);
    let groupId = localStorage.getItem('groupId');
    console.log('groupId = ' + groupId);

    if (userChat.value == "" || groupId == null) {
        console.log("User fields and select any group or chat ");
    }
    else {
        try {
            const obj = {
                chat: userChat.value,
                groupId: groupId
            }
            if (groupId != NaN) {

                const response = await axios.post(`http://${HOST}:3000/chat/add-chat`, obj, {
                    headers: {
                        "Authorization": token
                    }
                });
                // Log the response for debugging
                console.log('response = ' + JSON.stringify(response.data.chatData));
                // response = {"id":8,"chatName":"hi","groupId":"5","signupId":3,"updatedAt":"2024-09-05T16:10:51.704Z","createdAt":"2024-09-05T16:10:51.704Z"}

                displayMessage(response.data.chatData.chatName);
                //send the chat to backend socket
                socket.emit('send-message', response.data.chatData.chatName);
                //update the id 
                lastChatID = response.data.chatData.id;
            }
        }
        catch (error) {
            if (error.response) {
                // Server responded with a status other than
                console.error('Server Error:', error.response.data);
                console.error('Status code:', error.response.status);
            } else if (error.request) {
                // Request was made but no response received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Error:', error.message);
            }
        }
    }
    userChat.value = "";
}//submitChat

function displayMessage(chat) {
    const chatContent = document.getElementById('chatContent');
    console.log('inside displayMessage');
    console.log('chat = ' + chat);
    const chatitem = document.createElement('div');
    chatitem.classList.add('chatDIV');
    chatitem.textContent = chat;
    chatContent.appendChild(chatitem);
}//displayMessage

const socket = io(`http://localhost:3000`);

// When a new message is received from the server
socket.on('newMessage', function (message) {
    console.log('Received message:', message);
    displayMessage(message.chatName);
});
