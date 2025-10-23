const express = require("express");
const router = express.Router({ mergeParams: true });
const messageController = require("../controllers/messageController");
const { updateMessage } = require("../validators/message.js");
const { auth, validateBody } = require("../middlewares/");

router.patch("/messages/:id", auth, validateBody(updateMessage), messageController.updateMessage);
router.delete("/messages/:id/", auth, messageController.deleteMessage);

module.exports = router;
