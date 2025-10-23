const Joi = require("joi");

exports.cursor = Joi.object({
  id: Joi.string().uuid().required(),
  createdAt: Joi.date().required(),
});