const { Comment } = require("../models/");
const comment = {}

comment.updateComment = async(req, res) => {
	try {
		const { id, content } = req.body;
		const comment = await Comment.findByPk(id);
		if(!comment) throw new Error("Comment not Found!");
		if(comment.userId !== req.user.id) throw new Error("You cannot update other people's comment");
		await comment.update({content});
		res.json({success: true, error: false, data: comment});
	} catch(e) {
		console.error(e);
		res.status(400).json({
			success: false,
			error: true,
			data: e.message
		})
	}
}

comment.deleteComment= async(req, res) => {
	try {
		const { id } = req.body;
		const comment = await Comment.findByPk(id);
		if(!comment) throw new Error("Comment not Found!");
		if(comment.userId !== req.user.id) throw new Error("You cannot delete other people's comment");
		await comment.destroy();
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

module.exports = comment;