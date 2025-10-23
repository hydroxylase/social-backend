const Joi = require("joi");

exports.createReel = Joi.object({
  caption: Joi.string().allow("").required(),
});

exports.updateReel = Joi.object({
  caption: Joi.string().allow(""),
});

exports.reelId = Joi.object({
  id: Joi.string().uuid().required(),
});
