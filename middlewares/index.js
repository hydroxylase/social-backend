const validateBody = require("./validateBody.js");
const validateParams = require("./validateParams.js");
const validateCursor = require("./validateCursor.js");
const auth = require("./auth.js");
const upload = require("./upload.js");
module.exports = {
	auth,
	validateBody,
	validateParams,
	upload,
	validateCursor
}