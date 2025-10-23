const Joi = require("joi");

exports.createMessage = Joi.object({
  conversationId: Joi.string().uuid().required(),
  content: Joi.string().required(),
});

exports.updateMessage = Joi.object({
  content: Joi.string(),
});

exports.messageId = Joi.object({
  id: Joi.string().uuid().required(),
});
