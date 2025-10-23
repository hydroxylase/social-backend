
module.exports = (schema) => async (req, res, next) => {
  if (!req.params) {
    return res.status(400).json({ errors: ["Request prameter cannot be empty"] });
  }

  try {
    const value = await schema.validateAsync(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.params = value;
    next();
  } catch (err) {
    return res.status(400).json({
      errors: err.details.map((d) => d.message),
    });
  }
};
