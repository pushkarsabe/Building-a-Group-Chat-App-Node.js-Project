const Chat = require('../model/chat');

exports.postLoginAddChat = async (req, res) => {
    console.log("req.user.id = " + req.user.id);

    try {
        const chat = req.body.chat;
        console.log('user chat = ' + chat);

        let chatResponse = await Chat.create({
            chatName: chat,
            signupid : req.user.id
        })

        res.status(200).json({ success: true, chatData: chatResponse, message:'Chat Added' })

    } catch (err) {
        console.log("post chat error = " + JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}

