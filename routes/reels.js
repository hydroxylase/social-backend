const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { createReel } = require("../validators/reel.js")
const { createComment } = require("../validators/comment.js")
const  { auth, validateParam, validateBody, upload } = require("../middlewares/");

router.post("/", auth, validateBody(createReel), postController.createPost("reel"));
router.get("/", auth, postController.getPost("reel"));
router.get("/:id", auth, postController.getPost("reel"));
router.delete("/:id", auth, postController.deletePost("reel"));
router.post("/:id/like", auth, postController.likePost("reel"));
router.delete("/:id/like", auth, postController.unlikePost("reel"));
router.post(":id/save", auth, postController.savePost("reel"));
router.delete(":id/save", auth, postController.unsavePost("reel"));
router.post(":id/comment", auth, validateBody(createComment), postController.addComment);
router.post('/new', auth, upload.single('media'), validateBody(createReel),postController.newPost('reel'));

module.exports = router;
