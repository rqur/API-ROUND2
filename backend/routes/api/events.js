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
  requireAuthResponse,
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
      exclude: ["capacity", "price", "createdAt", "updatedAt"],
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
// Add an Image to a Event based on the Event's id
router.post("/:eventId/images", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;
  const { url, preview } = req.body;

  const event = await Event.findByPk(eventId);

  checkIfExist(event, "Event couldn't be found");

  const user = await Membership.findOne({
    where: {
      userId,
      groupId: event.groupId,
    },
  });
  // const isCoHost = await Event.findByPk({
  //   where: {
  //     url,
  //       eventId,
  //       preview,
  //   }
  // })
  if (user.status === "co-host" || userId === event.organizerId) {
    const createdImg = await EventImage.create({
      url,
      eventId,
      preview,
    });

    const newImg = await EventImage.scope("newImage").findByPk(createdImg.id);
    if (newImg.id) {
      return res.status(200).json(newImg);
    }
  } else {
    returnMsg.message = "Forbidden";
    returnMsg.statusCode = 403;
    return res.status(403).json(returnMsg);
  }
});

// Delete an Event//
router.delete("/:eventId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;
  const event = await Event.findByPk(req.params.eventId);
  if (!event) {
    returnMsg.message = "Event couldn't be found";
    return res.status(404).json(returnMsg);
  }

  const group = await Group.findByPk(event.groupId);

  const user = await Membership.findOne({
    where: {
      userId,
      groupId: event.groupId,
    },
  });

  if ((user && user.status === "co-host") || userId === group.organizerId) {
    const deleted = await event.destroy();
    returnMsg.message = "Successfully deleted";
    returnMsg.statusCode = 200;
    return res.status(200).json(returnMsg);
  } else {
    returnMsg.message = "Forbidden";
    returnMsg.statusCode = 403;
    return res.status(403).json(returnMsg);
  }
});

//ATTENDEES//
//Get all Attendees of an Event specified by its id
router.get(
  "/:eventId/attendees",
  restoreUser,
  requireAuth,
  async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId);

    if (!event) {
      returnMsg.message = "Event couldn't be found";
      returnMsg.statusCode = 404;
      return res.status(404).json(returnMsg);
    }

    const group = await Group.findByPk(event.groupId);

    const user = await Membership.findOne({
      where: {
        userId,
        groupId: event.groupId,
      },
    });

    if ((user && user.status === "co-host") || group.organizerId === userId) {
      const attendanceList = await Attendance.findAll({
        where: {
          eventId,
        },
      });
      return res.status(200).json({ Attendees: attendanceList });
    } else if (user) {
      const memberList = await User.findAll({
        include: {
          model: Attendance,
          where: { groupId: eventId },
          attributes: ["status"],
        },
      });
      return res.status(200).json({ Members: memberList });
    } else {
      returnMsg.message = "Forbidden";
      returnMsg.statusCode = 403;
      return res.status(403).json(returnMsg);
    }
  }
);
//Request to Attend an Event based on the Event's id
router.post("/:eventId/attendance", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.body.userId;
  const event = await Event.findByPk(eventId);

  if (!event) {
    returnMsg.message = "Event couldn't be found";
    return res.status(404).json(returnMsg);
  }

  const currentMembership = await Membership.findOne({
    where: {
      userId,
      groupId: event.groupId,
      status: { [Op.not]: "pending" },
    },
  });

  if (!currentMembership) {
    returnMsg.message = "Forbidden";
    returnMsg.statusCode = 403;
    return res.status(403).json(returnMsg);
  }

  const currentAttendance = await Attendance.findOne({
    where: {
      userId,
      eventId,
      status: "pending",
    },
  });
  console.log(currentAttendance);
  if (!currentAttendance) {
    const createdAttendance = await Attendance.create({
      status: "pending",
      userId,
      eventId,
    });

    return res.status(200).json(createdAttendance);
  } else if (currentAttendance.status === "pending") {
    returnMsg.message = "Attendance has already been requested";
    returnMsg.statusCode = 400;
    return res.status(403).json(returnMsg);
  } else if (currentAttendance.status === "attending") {
    returnMsg.message = "User is already an attendee of the event";
    returnMsg.statusCode = 400;
    return res.status(403).json(returnMsg);
  }
});
//Change the status of an attendance for an event specified by id
router.put("/:eventId/attendance", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const currUser = req.user.id;
  const { userId, status } = req.body;
  const event = await Event.findByPk(eventId);
  if (!event) {
    returnMsg.message = "Event couldn't be found";
    returnMsg.statusCode = 404;
    return res.status(404).json(returnMsg);
  }

  const group = await Group.findByPk(event.groupId);

  const user = await Membership.findOne({
    where: {
      userId: currUser,
      groupId: event.groupId,
    },
  });
  const member = await Attendance.findOne({
    where: {
      userId,
      eventId,
    },
  });

  if (!member) {
    returnMsg.message =
      "Attendance between the user and the event does not exist";
    returnMsg.statusCode = 404;
    return res.status(403).json(returnMsg);
  }
  if (status === "pending") {
    returnMsg.message = "Cannot change an attendance status to pending";
    returnMsg.statusCode = 400;
    return res.status(400).json(returnMsg);
  }

  if ((user && user.status !== "co-host") || currUser !== group.organizerId) {
    returnMsg.message = "Forbidden";
    returnMsg.statusCode = 403;
    return res.status(403).json(returnMsg);
  }
  await Attendance.update({ status }, { where: { userId, eventId } });
  return res.status(200).json(member);
});

//Delete attendance to an event specified by id//
router.delete("/:eventId/attendance", requireAuth, async (req, res) => {
  const eventId = req.params.eventId;
  const currUserId = req.user.id;
  const { userId } = req.body;

  const event = await Event.findOne({
    where: { id: eventId },
    include: [{ model: Group }],
  });
  checkIfExist(event, "Event couldn't be found");
  const isValidUser =
    currUserId === userId || currUserId === event.Group.organizerId;
  requireAuthResponse(
    isValidUser,
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
