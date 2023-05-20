const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Event,
  Attendance,
  EventImage,
  Group,
  Venue,
  User,
  Membership,
} = require("../../db/models");
const {
  restoreUser,
  requireAuth,
  checkAutorization,
  validEvent,
} = require("../../utils/auth");
const { checkIfExist, validQuery } = require("../../utils/validation");
const returnMsg = {};

router.get("/", async (req, res) => {
  const options = validQuery(req.body);
  const events = await Event.findAll({
    include: [
      { model: Group, attributes: ["id", "name", "city", "state"] },
      {
        model: Venue,
        attributes: ["id", "city", "state"],
      },
    ],
    attributes: {
      exclude: [
        "capacity",
        "price",
        "createdAt",
        "updatedAt",
        "description",
      ],
    },
    ...options,
  });
  const eventArr = [];
  for (const event of events) {
    const eventObj = event.toJSON();
    const attendance = await Attendance.count({
      where: {
        eventId: event.id,
        status: "attending",
      },
    });
    const eventImage = await EventImage.findOne({
      where: {
        eventId: event.id,
      },
    });
    eventObj.numAttending = attendance;
    eventObj.previewImage = eventImage ? eventImage.url : "no image";
    eventArr.push(eventObj);
  }

  res.json({ Events: eventArr });
});
//GET EVENT BY ID
router.get("/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  const event = await Event.findOne({
    where: { id: eventId },
    include: [{ model: EventImage, attributes: ["id", "url", "preview"] }],
  });
  checkIfExist(event, "Event couldn't be found");
  const group = await Group.findOne({
    where: { id: event.groupId },
    attributes: ["id", "name", "private", "city", "state"],
  });
  const venue = await Venue.findOne({
    where: { id: event.venueId },
    attributes: { exclude: ["updatedAt", "createdAt", "groupId"] },
  });
  const attendance = await Attendance.count({
    where: { eventId, status: { [Op.not]: "pending" } },
  });

  const eventObj = event.toJSON();
  eventObj.numAttending = attendance;
  eventObj.Group = group;
  eventObj.Venue = venue;

  res.json(eventObj);
});
// Add an Image to a Event based on the Event's id
router.post("/:eventId/images", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;
  const { url, preview } = req.body;

  const event = await Event.findByPk(eventId);
  checkIfExist(event, "Event couldn't be found");

  const isCoHost = await Membership.findOne({
    where: {
      status: "co-host",
      userId,
      groupId: event.groupId,
    },
  });
  const isOrganizer = await Group.findOne({
    where: { id: event.groupId, organizerId: userId },
  });
  checkAutorization(isCoHost || isOrganizer);

  const createdImg = await EventImage.create({
    url,
    eventId,
    preview,
  });

  res.json(createdImg);
});

// Delete an Event//
router.delete("/:eventId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const event = await Event.findByPk(req.params.eventId);
  checkIfExist(event, "Event couldn't be found");
  const group = await Group.findByPk(event.groupId);

  const isCoHost = await Membership.findOne({
    where: {
      userId,
      groupId: event.groupId,
      status: "co-host",
    },
  });
  const isOrganizer = userId === group.organizerId;
  checkAutorization(isOrganizer || isCoHost);

  await event.destroy();
  return res.json({ message: "Successfully deleted" });
});
//EDIT AN EVENT
router.put("/:eventId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const venue = await Venue.findByPk(req.body.venueId);
  checkIfExist(venue, "Venue couldn't be found");

  const event = await Event.findByPk(req.params.eventId);
  checkIfExist(event, "Event couldn't be found");

  const isCoHost = await Membership.findOne({
    where: {
      userId,
      status: "co-host",
      groupId: event.groupId,
    },
  });
  const isOrganizer = await Group.findOne({
    where: { organizerId: userId, id: event.groupId },
  });
  console.log({ isOrganizer, isCoHost });
  checkAutorization(isOrganizer || isCoHost);

  event.update(validEvent(req.body));
  res.json(event);
});

//ATTENDEES//
//Get all Attendees of an Event specified by its id
router.get("/:eventId/attendees", async (req, res) => {
  const eventId = req.params.eventId;
  let userId;
  if (req.user) {
    userId = req.user.id;
  }
  const event = await Event.findByPk(eventId);
  checkIfExist(event, "Event couldn't be found");

  const group = await Group.findByPk(event.groupId);

  const isCoHost = await Membership.findOne({
    where: {
      userId,
      groupId: event.groupId,
      status: "co-host",
    },
  });
  const isOrganizer = group.organizerId === userId;
  let where = { eventId };
  if (!(isOrganizer || isCoHost)) {
    where = { status: { [Op.not]: "pending" }, eventId };
  }

  const attendees = await Attendance.findAll({
    where,
    attributes: ["status", "userId"],
  });
  const users = await User.findAll({
    attributes: ["id", "firstName", "lastName"],
    raw: true,
  });

  const Attendees = attendees.map((attendance) => {
    const user = users.find((x) => x.id === attendance.userId);

    return { ...user, Attendance: { status: attendance.status } };
  });
  return res.status(200).json({ Attendees });
});
//Request to Attend an Event based on the Event's id
router.post("/:eventId/attendance", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;
  const event = await Event.findByPk(eventId);
  checkIfExist(event, "Event couldn't be found");

  const isMember = await Membership.findOne({
    where: {
      userId,
      groupId: event.groupId,
      status: { [Op.not]: "pending" },
    },
  });
  checkAutorization(isMember);

  const attendanceExists = await Attendance.findOne({
    where: {
      userId,
      eventId,
    },
  });

  if (attendanceExists && attendanceExists.status === "pending") {
    return res
      .status(400)
      .json({ message: "Attendance has already been requested" });
  }

  if (attendanceExists && attendanceExists.status === "attending") {
    return res
      .status(400)
      .json({ message: "User is already an attendee of the event" });
  }

  const createdAttendance = await Attendance.create({
    status: "pending",
    userId,
    eventId,
  });

  return res.json({
    userId: createdAttendance.userId,
    status: createdAttendance.status,
  });
});
//Change the status of an attendance for an event specified by id
router.put("/:eventId/attendance", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const currUserId = req.user.id;
  const { userId, status } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ message: "provide userId and status" });
  }
  if (status === "pending") {
    return res
      .status(400)
      .json({ message: "Cannot change an attendance status to pending" });
  }

  const event = await Event.findByPk(eventId);
  checkIfExist(event, "Event couldn't be found");

  const group = await Group.findByPk(event.groupId);

  const isCoHost = await Membership.findOne({
    where: {
      userId: currUserId,
      groupId: event.groupId,
      status: "co-host",
    },
  });
  const isOrganizer = currUserId === group.organizerId;
  checkAutorization(isCoHost || isOrganizer);

  const attendance = await Attendance.findOne({
    where: {
      userId,
      eventId,
    },
    attributes: ["id", "eventId", "userId", "status"],
  });
  checkIfExist(
    attendance,
    "Attendance between the user and the event does not exist"
  );

  await attendance.update({ status }, { where: { userId, eventId } });
  res.json({
    id: attendance.id,
    eventId: attendance.eventId,
    userId: attendance.userId,
    status: attendance.status,
  });
});

//Delete attendance to an event specified by id//
router.delete("/:eventId/attendance", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const currUserId = req.user.id;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "send userId nerd" });
  }

  const event = await Event.findOne({
    where: { id: eventId },
  });
  checkIfExist(event, "Event couldn't be found");

  const group = await Group.findOne({
    where: { organizerId: currUserId, id: event.groupId },
  });

  const isOrganizer = group ? currUserId === group.organizerId : null;
  const isAuthorized = currUserId === userId || isOrganizer;
  checkAutorization(
    isAuthorized,
    "Only the User or organizer may delete an Attendance"
  );

  const attendance = await Attendance.findOne({
    where: { userId, eventId },
  });
  checkIfExist(attendance, "Attendance does not exist for this User");

  await attendance.destroy();
  res.json({
    message: "Successfully deleted attendance from event",
  });
});

module.exports = router;
