const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config");
const { User } = require("../db/models");

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
  // Create the token.
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(
    { data: safeUser },
    secret,
    { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the token cookie
  res.cookie("token", token, {
    maxAge: expiresIn * 1000, // maxAge in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax",
  });

  return token;
};

const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const { token } = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      return next();
    }

    try {
      const { id } = jwtPayload.data;
      req.user = await User.findByPk(id, {
        attributes: {
          include: ["email", "createdAt", "updatedAt"],
        },
      });
    } catch (e) {
      res.clearCookie("token");
      return next();
    }

    if (!req.user) res.clearCookie("token");

    return next();
  });
};

// If there is no current user, return an error
const requireAuth = function (req, _res, next) {
  if (req.user) return next();

  const err = new Error("Authentication required");
  err.title = "Authentication required";
  err.errors = { message: "Authentication required" };
  err.status = 401;
  return next(err);
};

const requireAuthResponse = (condition, message = "Forbidden") => {
  if (!condition) {
    throw {
      status: 403,
      message,
    };
  }
};
const validGroup = ({ name, about, type, private, city, state }) => {
  const errRes = {
    status: 400,
    message: "Bad Request",
    errors: {},
  };

  if (!state) {
    errRes.errors.state = "State is required";
  }
  if (!name) {
    errRes.errors.name = "Name must be 60 characters or less";
  }
  if (!about) {
    errRes.errors.about = "About must be 50 characters or more";
  }
  if (!type) {
    errRes.errors.type = "Type must be 'Online' or 'In persons";
  }
  if (!private) {
    errRes.errors.private = "Private must be a boolean";
  }

  if (!city) {
    errRes.errors.city = "City is required";
  }
  if (Object.keys(errRes.errors).length > 0) {
    throw errRes;
  }
  return {
    name,
    about,
    private,
    city,
    state,
  };
};
const validVenue = ({ address, city, state, lat, lng }) => {
  const errRes = {
    status: 400,
    message: "Bad Request",
    errors: {},
  };

  if (!address) {
    errRes.errors.address = "Street is required";
  }
  if (!city) {
    errRes.errors.city = "City address is required";
  }
  if (!state) {
    errRes.errors.state = "State address is required";
  }
  if (!lat || Number.isNaN(Number(lat))) {
    errRes.errors.lat = "Latitude is not valids";
  }
  if (!lng || Number.isNaN(Number(lng))) {
    errRes.errors.lng = "Longitude is not valid";
  }

  if (Object.keys(errRes.errors).length > 0) {
    throw errRes;
  }
  return {
    address,
    city,
    state,
    lng,
    lat,
  };
};
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const validEvent = ({
  venueId,
  name,
  type,
  capacity,
  price,
  description,
  startDate,
  endDate,
}) => {
  const errRes = {
    status: 400,
    message: "Bad Request",
    errors: {},
  };

  if (!venueId) {
    errRes.errors.venueId = "Venue does not exist";
  }
  if (!name || name.length <= 5) {
    errRes.errors.name = "Name must be at least 5 characters";
  }
  if (type.toLowerCase() !== "online" && type.toLowerCase() !== "in person") {
    errRes.errors.type = "Type must be Online or In person";
  }
  if (!capacity || Number.isNaN(Number(capacity))) {
    errRes.errors.capacity = "Capacity must be an integer";
  }
  if (!price || Number.isNaN(Number(price)) || price <= 0) {
    errRes.errors.price = "Price is invalid";
  }
  if (!description) {
    errRes.errors.description = "Description is required";
  }
  if (!startDate || startDate <= today()) {
    errRes.errors.startDate = "Start date must be in the future";
  }
  if (!endDate || endDate < startDate) {
    errRes.errors.endDate = "End date is less than start date";
  }

  if (Object.keys(errRes.errors).length > 0) {
    throw errRes;
  }
  return {
    venueId,
    name,
    type: type.toLowerCase(),
    capacity,
    price,
    description,
    startDate,
    endDate,
  };
};

module.exports = {
  setTokenCookie,
  restoreUser,
  requireAuth,
  requireAuthResponse,
  validGroup,
  validVenue,
  validEvent,
};
