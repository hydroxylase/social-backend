const router = require("express").Router();
const conversationController = require("../controllers/conversationController.js");
const { auth, validateBody, validateParams, upload, validateCursor } = require("../middlewares/");
const { createPost, deletePost,} = require("../validators/post.js");
const { cursor } = require("../validators/cursor.js");

router.get("/", auth, conversationController.getInbox);
router.get("/search", auth, conversationController.getConversationForUser);
router.get("/:id/messages", auth, validateCursor(cursor), conversationController.getConversationMessages);

module.exports = router;