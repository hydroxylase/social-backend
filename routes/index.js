const express = require("express");
const router = express.Router();

const userRoutes = require("./users");
const postRoutes = require("./posts");
const reelRoutes = require("./reels");
const conversationRoutes = require("./conversations");
const feedsRoutes = require("./feeds");

router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/reels", reelRoutes);
router.use("/conversations", conversationRoutes)
router.use("/feeds", feedsRoutes)

module.exports = router;
