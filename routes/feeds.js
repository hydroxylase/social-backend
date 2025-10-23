const router = require("express").Router();
const feedController = require("../controllers/feedController.js");
const { auth, validateCursor } = require("../middlewares/");
const { cursor } = require("../validators/cursor.js");

router.get("/posts/", auth, validateCursor(cursor), feedController.getFeeds("posts"));
router.get("/reels/", auth, validateCursor(cursor), feedController.getFeeds("reels"));

module.exports = router;