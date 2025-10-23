module.exports = (schema) => async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ errors: ["Request body cannot be empty"] });
  }

  try {
    const value = await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.body = value;
    next();
  } catch (err) {
    return res.status(400).json({
      errors: err.details.map((d) => d.message),
    });
  }
};
