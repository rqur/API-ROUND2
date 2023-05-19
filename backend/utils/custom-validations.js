const { handleValidationErrors } = require("./validation");
const { check } = require("express-validator");

const validateGroupEdit = [
  check("name")
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be 60 characters or less"),
  check("about")
    .isLength({ min: 50 })
    .withMessage("About must be 50 characters or more"),
  check("type")
    .isIn(["online", "in person"])
    .withMessage("Type must be 'online' or 'in person'"),
  check("private").isBoolean().withMessage("Private must be a boolean"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  handleValidationErrors,
];

module.exports = { validateGroupEdit };
