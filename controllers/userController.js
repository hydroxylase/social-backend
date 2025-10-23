require("dotenv").config();
const { User, Post, Follow } = require("../models/");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { literal, Op } = require("sequelize");
const JWT_SECRET = process.env.JWT_SECRET

const user = {};

user.register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist) throw new Error("Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, avatar, password: passwordHash });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      error: false,
      data: {
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

user.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const found = await User.findOne({ where: { email } });
    if (!found) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(password, found.password);
    if (!ok) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: found.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      error: false,
      data: {
        token,
        user: { id: found.id, name: found.name, email: found.email, avatar: found.avatar },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

user.getUser = async (req, res) => {
  try {
    const user = await User.findOne({where: {id: req.params.id}});
    res.json(user);
  } catch(e) {
    console.error(e);
    res.status(400).json({
      success: false,
      error: true,
      data: e.message
    })
  }
}

user.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if(req.user.id !== id) throw new Error("Can not Update other User's Account");
    const user = await User.findByPk(id);
    if(!user) throw new Error("User not found");
    await User.update({ name }, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "avatar"],
    });

    res.json({ success: true, error: false, data: updated });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

user.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if(req.user.id !== id) throw new Error("Can not delete other User's Account");
    const user = await User.findByPk(id);
    if(!user) throw new Error("User not found");
    await user.destroy();
    res.status(204).json({ success: true, error: false, data: null });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

user.getUserPosts = async (req, res) => {
  try {
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

    const posts = await Post.findAll({
      where: {userId: req.params.id, ...cursorOptions},
      limit: limit +1,
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      include: [{
        model : User,
        attributes: ["id", "name", "avatar"]
      }]
    });
    
    let nextCursor = null;
    let hasMore = null
    if (posts.length > limit){
      hasMore = true;
      const {id, createdAt} = posts.pop();
      const cursorString = JSON.stringify({id, createdAt});
      nextCursor = btoa(cursorString);
    }

    res.json({ success: true, error: false, data: posts, hasMore, nextCursor });   
  } catch(e) {
    console.error(e);
    res.status(400).json({
      success: false,
      error: true,
      data: e.message
    })
  }
}

// Follow a user
user.follow = async (req, res) => {
  try {
    const { id: targetId } = req.params; 
    const userId = req.user.id;

    if (userId === targetId) throw new Error("Cannot follow yourself");

    const targetUser = await User.findByPk(targetId);
    if (!targetUser) throw new Error("User to follow does not exist");

    const existingFollow = await Follow.findOne({ where: { followerId: userId, followingId: targetId } });
    if (existingFollow) throw new Error("Already following this user");

    const follow = await Follow.create({ followerId: userId, followingId: targetId });
    res.json({ success: true, error: false, data: follow });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Unfollow a user
user.unfollow = async (req, res) => {
  try {
    const { id: targetId } = req.params; 
    const userId = req.user.id;
    
    if (userId === targetId) throw new Error("Cannot unfollow yourself");

    const existingFollow = await Follow.findOne({ where: { followerId: userId, followingId: targetId } });
    if (!existingFollow) throw new Error("Follow relationship does not exist");

    await existingFollow.destroy();
    res.json({ success: true, error: false, data: "Unfollowed successfully" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Get followers
user.getFollowers = async (req, res) => {
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

    // check user exists
    const userExists = await User.findByPk(id, { attributes: ["id"] });
    if (!userExists) throw new Error("User not found");

    // query Follow table directly
    const followers = await Follow.findAll({
      where: { followerId: id, ...cursorOptions },
      include: [
        {
          model: User,
          as: "follower", // must match alias in Follow.belongsTo(User, { as: "Following" })
          attributes: ["id", "name", "avatar"]
        }
      ],
      limit: limit +1,
      order: [["createdAt", "DESC"], ["id", "DESC"]]
    });

    // flatten to just the user objects
    const data = followers.map(f => f.follower);

    let nextCursor = null;
    let hasMore = null
    if (data.length > limit){
      hasMore = true;
      const {id, createdAt} = data.pop();
      const cursorString = JSON.stringify({id, createdAt});
      nextCursor = btoa(cursorString);
    }

    res.json({ success: true, error: false, data: data, hasMore, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

// Get following
user.getFollowing = async (req, res) => {
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

    // check user exists
    const userExists = await User.findByPk(id, { attributes: ["id"] });
    if (!userExists) throw new Error("User not found");

    // query Follow table directly
    const followings = await Follow.findAll({
      where: { followerId: id, ...cursorOptions },
      include: [
        {
          model: User,
          as: "following", // must match alias in Follow.belongsTo(User, { as: "Following" })
          attributes: ["id", "name", "avatar"]
        }
      ],
      limit: limit +1,
      order: [["createdAt", "DESC"], ["id", "DESC"]]
    });

    // flatten to just the user objects
    const data = followings.map(f => f.following);


    let nextCursor = null;
    let hasMore = null
    if (data.length > limit){
      hasMore = true;
      const {id, createdAt} = data.pop();
      const cursorString = JSON.stringify({id, createdAt});
      nextCursor = btoa(cursorString);
    }

    res.json({ success: true, error: false, data: data, hasMore, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};


user.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const userWithCounts = await User.findOne({
      where: { id },
      attributes: [
        "id",
        "name",
        "avatar",
        // Subqueries for counts
        [
          literal(`(SELECT COUNT(*) FROM "Posts" WHERE "Posts"."userId" = "User"."id")`),
          "postCount",
        ],
        [
          literal(`(SELECT COUNT(*) FROM "Follows" WHERE "Follows"."followingId" = "User"."id")`),
          "followerCount",
        ],
        [
          literal(`(SELECT COUNT(*) FROM "Follows" WHERE "Follows"."followerId" = "User"."id")`),
          "followingCount",
        ],
      ],
      raw: true,
    });

    if (!userWithCounts) throw new Error("User not found");

    res.json({ success: true, error: false, data: userWithCounts });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
};

module.exports = user;

