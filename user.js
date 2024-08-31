const Signup = require('../model/user');
const bcrypt = require('bcrypt');

exports.postAddSignup = async (req, res, next) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const phoneNumber = req.body.phoneNumber;
        console.log('name = ' + name);
        console.log('email = ' + email);
        console.log('phoneNumber = ' + phoneNumber);
        console.log('password = ' + password);

        //to see if the user already exists
        const dataOfoneUser = await Signup.findOne({ where: { email: email } });
        console.log('dataOfoneUser = ' + JSON.stringify(dataOfoneUser));
        if (dataOfoneUser) {
            return res.status(400).json({ message: 'Email already exists' });
        } else {
            const saltrounds = 10;
            bcrypt.hash(password, saltrounds, async (err, hash) => {
                console.log('err = ' + err);
                console.log('hash = ' + hash);

                const newUser = await Signup.create({
                    name: name,
                    email: email,
                    phoneNumber: phoneNumber,
                    password: hash
                });
                console.log('newUser = ' + JSON.stringify(newUser));

                res.status(201).json({ newUserData: newUser });
            })
        }

    } catch (err) {
        console.log("post user error = " + JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}

// exports.getTodo = async (req, res) => {
//     try {
//         const id = req.params.id;
//         console.log('getTodo id = ' + id);

//         const particularTodo = await Todo.findOne({ where: { id: id } });
//         console.log('particularTodo = ' + JSON.stringify(particularTodo));

//         if (!particularTodo) {
//             return res.status(400).json({ message: 'Todo not found' });
//         }
//         res.status(200).json({ particularTodoData: particularTodo });

//     } catch (err) {
//         console.log("error = " + JSON.stringify(err));
//         res.status(500).json({ message: 'Failed to get todo' })
//     }
// }

// exports.deleteTodo = async (req, res) => {
//     try {
//         const id = req.params.id;
//         console.log('deleteTodo id = ' + id);

//         const particularTodo = await Todo.findAll({ where: { id: id } });
//         console.log('particularTodo = ' + JSON.stringify(particularTodo));
//         if (!particularTodo) {
//             return res.status(400).json({ message: 'Todo not found' });
//         }

//         //delete todo
//         await Todo.destroy({ where: { id: id } });
//         res.status(200).json({ message: 'Todo deleted successfully' });

//     } catch (err) {
//         console.log("error = " + JSON.stringify(err));
//         res.status(500).json({ message: 'Failed to delete todo' });
//     }
// }