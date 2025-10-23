const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const { auth, validateCursor } = require("../middlewares/");
const { cursor } = require("../validators/cursor.js");


router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/:id", auth, userController.getUser);
router.get("/:id/posts", auth, validateCursor(cursor), userController.getUserPosts);
router.patch("/:id", auth, userController.updateUser);
router.delete("/:id", auth, userController.deleteUser);
router.post("/:id/follow", auth, userController.follow);
router.delete("/:id/unfollow", auth, userController.unfollow);
router.get("/:id/followers", auth, validateCursor(cursor), userController.getFollowers);
router.get("/:id/following", auth, validateCursor(cursor), userController.getFollowing);
router.get("/:id/profile", auth, userController.getProfile);

module.exports = router;
