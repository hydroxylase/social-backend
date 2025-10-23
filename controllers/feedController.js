const { Post, Like, Save, Follow } = require("../models/");
const feeds = {}

feeds.getFeeds = (type) => async(req, res) => {
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

    const following = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ["followingId"]
    });

    const followingIds = following.map(f => f.followingId);
    if (followingIds.length === 0) {
      return res.json({
        success: true,
        error: false,
        data: [],
        nextCursor: null,
        hasMore: false
      });
    }

    const feeds = await Post.findAll({
      where: {
        userId: { [Op.in]: followingIds },
        type,
        ...cursorWhere
      },
      include: [
        { model: User, attributes: ["id", "name", "avatar"] },
        {
          model: Like,
          attributes: ["id"],
          required: false,
          where: { userId: req.user.id }
        },
        {
          model: Save,
          attributes: ["id"],
          required: false,
          where: { userId: req.user.id }
        }
      ],
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"]
      ],
      limit: limit + 1
    });
    
    let nextCursor = null;
    let hasMore = null
    if (feeds.length > limit){
      hasMore = true;
      const {id, createdAt} = feeds.pop();
      const cursorString = JSON.stringify({id, createdAt});
      nextCursor = btoa(cursorString);
    }
    res.status(400).json({
		success: true,
		error: false,
		data: feeds,
		hasMore,
		nextCursor,

	})
	} catch(e) {
		console.error(e);
		res.status(400).json({
			success: false,
			error: true,
			data: e.message
		})
	}
}

module.exports = feeds;