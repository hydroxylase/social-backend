const router = require("express").Router();
const postController = require("../controllers/postController.js");
const { auth, validateBody, validateParams, upload, validateCursor } = require("../middlewares/");
const { createPost } = require("../validators/post.js");
const { cursor } = require("../validators/cursor.js");
const { createComment } = require("../validators/comment.js");

router.get("/:id", auth, postController.getPost("post"));
router.post("/", auth, validateBody(createPost), postController.createPost("post"));
router.delete("/:id", auth, postController.deletePost("post"));
router.post("/:id/like", auth, postController.likePost("post"));
router.delete("/:id/like", auth, postController.unlikePost("post"));
router.post("/:id/save", auth, postController.savePost("post"));
router.delete("/:id/save", auth, postController.unsavePost("post"));
router.get("/:id/comments", auth, validateCursor(cursor),postController.getPostComments("post"));
router.post("/:id/comments", auth, validateBody(createComment), postController.addComment("post"));
router.post('/new', auth, upload.single('media'), validateBody(createPost),postController.newPost('post'));

module.exports = router;