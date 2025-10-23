const { Op } = require("sequelize");
const { Post, User, Like, Comment, Save } = require("../models/");
const post = {};

// Get a single post/reel
post.getPost = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Post.findOne({
      where: { id, type },
      include: [
        { model: User, attributes: ["id", "name", "avatar"] },
        {
          model: Like,
          where: { userId: req.user.id },
          attributes: ["id"],
          required: false,
        },
        {
          model: Save,
          where: { userId: req.user.id },
          attributes: ["id"],
          required: false,
        },
        { model: Comment, include: [{ model: User, attributes: ["id", "name"] }] }
      ],
    });
    if (!found) throw new Error("Post not found");

    res.json({ success: true, error: false, data: found });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Create a post/reel
post.createPost = (type) => async (req, res) => {
  console.log("Creating", req.body);
  try {
    const { caption } = req.body;
    const created = await Post.create({
      caption,
      mediaUrl: "sample",
      type,
      userId: req.user.id,
    });

    res.json({ success: true, error: false, data: created });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Delete a post/reel
post.deletePost = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Post.findOne({ where: { id, type, userId: req.user.id } });
    if (!found) throw new Error("Post not found or not owned by user");
    console.log("leak");
    await found.destroy();
    res.json({ success: true, error: false, data: "Post deleted" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Like a post/reel
post.likePost = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const existingPost = await Post.findOne({where:{ id, type}});
    if(!existingPost) throw new Error("Post does not exists");

    const existing = await Like.findOne({ where: { postId: id, userId: req.user.id } });
    if (existing) throw new Error("Already liked");

    const like = await Like.create({ postId: id, userId: req.user.id });
    res.json({ success: true, error: false, data: like });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Unlike a post/reel
post.unlikePost = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const existingPost = await Post.findOne({where:{ id, type}});
    if(!existingPost) throw new Error("Post does not exists");
    console.log(existingPost);
    const existing = await Like.findOne({ where: { postId: id, userId: req.user.id } });
    console.log(existing);
    if (!existing) throw new Error("Like not found");

    await existing.destroy();
    res.json({ success: true, error: false, data: "Unliked" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Save a post/reel
post.savePost = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const existingPost = await Post.findOne({where:{ id, type}});
    if(!existingPost) throw new Error("Post does not exists");

    const existing = await Save.findOne({ where: { postId: id, userId: req.user.id } });
    if (existing) throw new Error("Already saved");

    const save = await Save.create({ postId: id, userId: req.user.id });
    res.json({ success: true, error: false, data: save });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Unsave a post/reel
post.unsavePost = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const existingPost = await Post.findOne({where:{ id, type}});
    if(!existingPost) throw new Error("Post does not exists");

    const existing = await Save.findOne({ where: { postId: id, userId: req.user.id } });
    if (!existing) throw new Error("Save not found");

    await existing.destroy();
    res.json({ success: true, error: false, data: "Unsaved" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

post.getPostComments = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const limit  = 12;
    const cursor = req.cursor;
    const cursorOptions = cursor !== null ? {
      [Op.or]: [
        { createdAt: { [Op.lte]: cursor.createdAt } },
        {
          [Op.and]: [
            { createdAt: cursor.createdAt },
            { id: { [Op.lt]: cursor.id } }
          ]
        }
      ]
    } : {};

    const found = await Post.findOne({where: { id, type }});

    if (!found) throw new Error("Post not found");
    const comments = await Comment.findAll({
      where: { postId: id, ...cursorOptions },
      include: [
        { model: User, attributes: ["id", "name", "avatar"]}
      ],
      limit: limit +1,
      order: [["createdAt", "DESC"], ["id", "DESC"]]
    });

    let nextCursor = null;
    let hasMore = null
    if (comments.length > limit){
      hasMore = true;
      const {id, createdAt} = comments.pop();
      const cursorString = JSON.stringify({id, createdAt});
      nextCursor = btoa(cursorString);
    }
comments
    res.json({ success: true, error: false, data: comments, hasMore, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Add a comment
post.addComment = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const existingPost = await Post.findOne({where:{ id, type}});
    if(!existingPost) throw new Error("Post does not exists");

    const comment = await Comment.create({
      postId: id,
      userId: req.user.id,
      content,
    });

    res.json({ success: true, error: false, data: comment });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

post.newPost = (type) => async (req, res) => {
  try {
    // req.file from multer, req.body has other fields (strings)
    const { caption } = req.body;
    const file = req.file;

    if(!file) throw new Error("Post cannot be empty without any media");
    const mediaUrl = file ? `/uploads/${file.filename}` : null;

    const created = await Post.create({
      caption,
      mediaUrl,
      type,
      userId: req.user.id,
    });

    return res.json({ success: true, error: false, data: created });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ success: false, error: true, data: e.message });
  }
};

module.exports = post;
