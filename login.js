const HOST = 'localhost';

//function to display the message
function showMessage(msgText, className) {
    const msg = document.getElementById('message');
    const div = document.createElement('div');
    const textNode = document.createTextNode(msgText);
    div.appendChild(textNode);
    msg.appendChild(div);
    msg.classList.add(className);

    setTimeout(() => {
        msg.classList.remove(className);
        msg.removeChild(div);
    }, 2000);
}

async function submitData(event) {
    event.preventDefault();
    console.log('inside submitData login');
    // Get values from the form
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;

    console.log('email = ' + email);
    console.log('password = ' + password);

    const obj = {
        email: email,
        password: password
    }

    try {
        const response = await axios.post(`http://${HOST}:3000/user/login`, obj);
        console.log('response data = ' + JSON.stringify(response.data));
        //this will give the data inside the array
        const dataUser = response.data.userDetails[0];
        console.log('email = ' + dataUser.email);
        console.log('password = ' + dataUser.password);
        console.log('token = ' + response.data.token);
        localStorage.setItem('token', response.data.token);

        showMessage('Email and Password verified', 'succesMessage');
        alert('Logged in successfully');
    }
    catch (error) {
        //to handle the output response errors
        if (error.response.status == 400) {
            console.log('Error object:', error.response.data.message);
            showMessage(error.response.data.message, 'failureMessage');
        } else {
            console.log('Unhandled error:', error);
            // Handle other errors here
        }
    }
    //to clear the fields
    document.getElementById('inputEmail').value = "";
    document.getElementById('inputPassword').value = "";
}//submitData