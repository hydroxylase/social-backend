const Joi = require("joi");

exports.createPost = Joi.object({
  caption: Joi.string().required(),
});

// exports.updatePost = Joi.object({
//   content: Joi.string(),
//   mediaUrl: Joi.string().uri(),
// });

exports.postId = Joi.object({
  id: Joi.string().uuid().required(),
});
