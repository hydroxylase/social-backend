const Joi = require("joi");

exports.createComment = Joi.object({
  content: Joi.string().required(),
});

exports.updateComment = Joi.object({
  content: Joi.string(),
});

exports.commentId = Joi.object({
  id: Joi.string().uuid().required(),
});
