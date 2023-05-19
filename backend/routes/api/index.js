const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const { restoreUser } = require("../../utils/auth.js");
const groupsRouter = require("./groups.js");
const venuesRouter = require("./venues.js");
const eventsRouter = require("./events.js");
const imagesRouter = require("./images.js");
router.use(restoreUser);

router.use("/session", sessionRouter);
router.use("/groups", groupsRouter);
router.use("/users", usersRouter);
router.use("/venues", venuesRouter);
router.use("/events", eventsRouter);
router.use(imagesRouter);

router.post("/test", (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
