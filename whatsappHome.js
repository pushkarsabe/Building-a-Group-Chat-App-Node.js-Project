const contactList = document.getElementById('contactList');
document.getElementById('chatForm').addEventListener('submit', submitChat)
let chatData = 0;
let lastChatID = 0;

async function loadCreateGroupPopupAndGetData() {
    document.getElementById('groupPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    console.log('inside loadCreateGroupPopupAndGetData...');
    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    try {
        const response = await axios.get(`http://localhost:3000/user/user-data`, {
            headers: {
                "Authorization": token
            }
        });
        chatData = response.data.allUserData;
        // console.log("chatData  = " + JSON.stringify(chatData));
        for (let i = 0; i < chatData.length; i++) {
            console.log("id  = " + chatData[i].id + " phone number : " + chatData[i].phoneNumber + " name = " + chatData[i].name);


            // Create a container for each contact
            const div = document.createElement('div');
            div.classList.add('contact-item');

            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = chatData[i].id;

            // Create label for the checkbox
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = `${chatData[i].name}, Phone Number: ${chatData[i].phoneNumber}`;

            // Append checkbox and label to container
            div.appendChild(checkbox);
            div.appendChild(label);

            // Append container to the contact list
            contactList.appendChild(div);
        }
    }
    catch (err) {
        console.log("loadCreateGroupPopupAndGetData error = " + err);
    }

}//loadCreateGroupPopupAndGetData

function closePopup() {
    document.getElementById('groupPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function createGroup() {
    console.log('inside createGroup...');
    const groupName = document.getElementById('groupName').value;
    const groupList = document.getElementById('groupList');
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

    if (groupName && selectedContacts.length > 0) {
        //this will take the data of users and create a the group on backend
        //    data = [{ "id": 1, "name": "pushkar", "phoneNumber": "5463459" }, { "id": 2, "name": "b", "phoneNumber": "38947" }]
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
            console.log("Token not found. Please log in.");
            return;
        }
        try {
            const res = await axios.post(`http://localhost:3000/groups/save-data`, obj, {
                headers: {
                    "Authorization": token
                }
            });
            console.log("res  = " + JSON.stringify(res));
            // res  = {"data":{"message":"success","submittedGroupData":{"id":2,"groupName":"group 2","groupUserNames":"c,d","groupUserIDS":"3,4","groupPhoneNumbers":"38476,483756","userid":3,"updatedAt":"2024-09-04T06:06:23.087Z","createdAt":"2024-09-04T06:06:23.087Z"}}

            const li = document.createElement('li');
            li.appendChild(document.createTextNode(`${groupName} : ${res.data.submittedGroupData.groupUserNames}`));
            groupList.appendChild(li);
            closePopup();

        } catch (err) {
            console.log("createGroupInBackend error = " + err);
        }

    } else {
        alert("Please enter a group name.");
    }

}//createGroup

window.document.addEventListener('DOMContentLoaded', async () => {
    console.log('inside DOMContentLoaded...');
    let token = localStorage.getItem('token');

    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    try {
        const res = await axios.get(`http://localhost:3000/groups/get-data`, {
            headers: {
                "Authorization": token
            }
        });
        // console.log("res  = " + JSON.stringify(res));
        for (let i = 0; i < res.data.allGroupData.length; i++) {
            printallGroupDataOnFrontend(res.data.allGroupData[i]);
        }

        // Check if there's a previously selected group in localStorage
        const savedGroupId = localStorage.getItem('groupId');
        const savedGroupUserID = localStorage.getItem('groupUserID');
        console.log('savedGroupId:', savedGroupId);
        console.log('savedGroupUserID:', savedGroupUserID);

        //this will reload the old chat and group when user refreshes the page
        if (savedGroupId && savedGroupUserID) {
            await loadChatPage(savedGroupId, savedGroupUserID);
        }

    } catch (err) {
        console.log("createGroupInBackend error = " + err);
    }

})//DOMContentLoaded

function printallGroupDataOnFrontend(data) {
    console.log('inside printallGroupDataOnFrontend...');
    // console.log("data  = " + JSON.stringify(data));

    const li = document.createElement('li');
    li.appendChild(document.createTextNode(`${data.groupName} : ${data.groupUserNames}`));
    li.id = data.groupUserIDS;
    li.style.cursor = "pointer";
    li.addEventListener('click', () => {
        loadChatPage(data.id, data.groupUserIDS);
    })

    groupList.appendChild(li);
}//printallGroupDataOnFrontend

async function loadChatPage(groupId, groupUserID) {
    const chatArea = document.getElementById('chatArea');
    const chatContent = document.getElementById('chatContent');
    localStorage.setItem('groupId', groupId);
    localStorage.setItem('groupUserID', groupUserID);

    chatContent.innerHTML = '';

    chatArea.querySelector('h3').textContent = `Chat for GroupID : ${groupId}`;

    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    try {
        const response = await axios.get(`http://localhost:3000/userLogin/chat?groupId=${groupId}`, {
            headers: {
                "Authorization": token
            }
        });
        console.log('Chat data response:', response.data.allChatData);

        response.data.allChatData.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.textContent = chat.chatName;
            chatContent.appendChild(chatItem);
        });
    } catch (err) {
        console.log("Error fetching chat data:", err);
        chatContent.textContent = "Failed to load chat data.";
    }
}


async function submitChat(event) {
    event.preventDefault();
    const chatContent = document.getElementById('chatContent');
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

                const response = await axios.post(`http://localhost:3000/userLogin/chat`, obj, {
                    headers: {
                        "Authorization": token
                    },
                    timeout: 5000 // Set timeout to 5 seconds
                });
                // Log the response for debugging
                console.log('response = ' + JSON.stringify(response.data.chatData));
                // response = {"id":8,"chatName":"hi","groupId":"5","signupId":3,"updatedAt":"2024-09-05T16:10:51.704Z","createdAt":"2024-09-05T16:10:51.704Z"}

                const chatitem = document.createElement('div');
                chatitem.textContent = response.data.chatData.chatName;
                chatContent.appendChild(chatitem);
                //update the id 
                lastChatID = response.data.chatData.id;

                appendRealTimeChatFrontend();
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

async function appendRealTimeChatFrontend() {
    console.log('inside appendRealTimeChatFrontend...');
    let token = localStorage.getItem('token');
    let groupId = localStorage.getItem('groupId');
    console.log('groupId = ' + groupId);
    console.log('lastChatID = ' + lastChatID);
    const chatContent = document.getElementById('chatContent');

    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    const response = await axios.get(`http://localhost:3000/userLogin/chat?groupId=${groupId}`, {
        headers: {
            "Authorization": token
        }
    });
    console.log("response  = " + JSON.stringify(response));

    // const chatitem = document.createElement('div');
    // chatitem.textContent = response.data.chatData.chatName;
    // chatContent.appendChild(chatitem);
}