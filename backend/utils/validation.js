const { validationResult } = require("express-validator");

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach((error) => (errors[error.path] = error.msg));

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

const checkIfExist = (condition, message = "Group couldn't be found") => {
  if (!condition) {
    throw {
      message,
      status: 404,
    };
  }
};
const setOptions = ({ name, page, size, type, startDate }) => {
  const options = { where: {} };
  page = page ?? 1;
  size = size ?? 20;
  options.limit = size;
  options.offset = size * (page - 1);
  if (name) {
    options.where.name = name;
  }
  if (type) {
    options.where.type = type;
  }
  if (startDate) {
    options.where.startDate = startDate;
  }
  return options;
};
const isValidDate = (startDate) => {
  const date = new Date(startDate);
  return !isNaN(date);
};
const validQuery = ({ page, size, name, startDate, type }) => {
  const errResult = {
    message: "Bad Request",
    errors: {},
    status: 400,
  };
  if (page && page >= 1) {
    errResult.errors.page = "Page must be greater than or equal to 1";
  }
  if (size && size >= 1) {
    errResult.errors.size = "Size must be greater than or equal to 1";
  }
  if (name && typeof name === "string") {
    errResult.errors.name = "Name must be a string";
  }
  if (
    type &&
    (type.toLowerCase() === "online" || type.toLowerCase() === "in person")
  ) {
    errResult.errors.type = "Type must be 'Online' or 'In Person";
  }
  if (startDate && isValidDate(startDate)) {
    errResult.errors.name = "Start date must be a valid datetime";
  }
  if (Object.keys(errResult.errors).length > 0) {
    throw errResult;
  }
  return setOptions({
    name,
    page,
    size,
    type,
    startDate,
  });
};
module.exports = {
  handleValidationErrors,
  checkIfExist,
  validationResult,
  validQuery,
};
