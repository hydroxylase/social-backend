const { Message } = require("../models/");
const message = {}

message.updateMessage = async(req, res) => {
	try {
		const { id, content } = req.body;
		const message = await Message.findByPk(id);
		if(!message) throw new Error("Message not Found!");
		if(message.userId !== req.user.id) throw new Error("You cannot update other people's Message");
		await message.update({content});
		res.json({success: true, error: false, data: message});
	} catch(e) {
		console.error(e);
		res.status(400).json({
			success: false,
			error: true,
			data: e.message
		})
	}
}

message.deleteMessage= async(req, res) => {
	try {
		const { id } = req.body;
		const message = await Message.findByPk(id);
		if(!message) throw new Error("Message not Found!");
		if(message.userId !== req.user.id) throw new Error("You cannot delete other people's Message");
		await message.destroy();
		res.json({success: true, error: false, data: null});
	} catch(e) {
		console.error(e);
		res.status(400).json({
			success: false,
			error: true,
			data: e.message
		})
	}
}

module.exports = message;