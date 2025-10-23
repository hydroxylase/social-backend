const express = require("express");
const router = express.Router({ mergeParams: true });
const commentController = require("../controllers/commentController");
const { updateComment } = require("../validators/comment.js")l
const { auth, validateBody } = require("../middlewares/");

router.patch("/comments/:id", auth, validateBody(updateComment), commentsController.updateComment);
router.delete("/comments/:id/", auth, commentController.deleteComment);

module.exports = router;
