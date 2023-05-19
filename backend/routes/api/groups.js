const router = require("express").Router();
const { fn, col, Op } = require("sequelize");
const {
  Group,
  Membership,
  GroupImage,
  User,
  Venue,
  Event,
  Attendance,
  EventImage,
} = require("../../db/models");
const {
  handleValidationErrors,
  checkIfExist,
} = require("../../utils/validation");
const {
  requireAuth,
  requireAuthResponse,
  validGroup,
  validVenue,
  validEvent,
} = require("../../utils/auth");
const { validateGroupEdit } = require("../../utils/custom-validations");
const { LIMIT_ATTACHED } = require("sqlite3");
const event = require("../../db/models/event");

// GET ALL GROUPS//
router.get("/", async (req, res) => {
  const groups = await Group.findAll({
    raw: true,
  });
  for (let group of groups) {
    const numMembers = await Membership.count({
      where: {
        groupId: group.id,
        status: {
          [Op.not]: "pending",
        },
      },
    });
    const previewImage = await GroupImage.findOne({
      where: {
        groupId: group.id,
        preview: true,
      },
    });
    group.numMembers = numMembers;
    group.previewImage = previewImage ? previewImage.url : null;
  }
  res.json({
    Groups: groups,
  });
});
router.get("/current", requireAuth, async (req, res) => {
  const groups = await Group.findAll({
    where: { organizerId: req.user.id },
    raw: true,
  });
  for (let group of groups) {
    const numMembers = await Membership.count({
      where: {
        groupId: group.id,
        status: {
          [Op.not]: "pending",
        },
      },
    });
    const previewImage = await GroupImage.findOne({
      where: {
        groupId: group.id,
        preview: true,
      },
    });
    group.numMembers = numMembers;
    group.previewImage = previewImage ? previewImage.url : null;
  }
  res.json({
    Groups: groups,
  });
});

//GET GROUP DETAILS BY ID//
router.get("/:groupId", async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId, {
    include: [
      {
        model: GroupImage,
        attributes: ["id", "url", "preview"],
      },
      {
        model: User,
        as: "Organizer",
        attributes: {
          exclude: [
            "hashedPassword",
            "email",
            "createdAt",
            "updatedAt",
            "username",
          ],
        },
      },
      { model: Venue, attributes: { exclude: ["createdAt", "updatedAt"] } },
    ],
  });

  if (!group) {
    return res, "Group";
  }

  const groupPojo = group.toJSON();

  const numMembers = await Membership.count({ where: { groupId } });

  groupPojo.numMembers = numMembers;
  res.json(groupPojo);
});
// CREATE A GROUP//

router.post("/", requireAuth, async (req, res) => {
  const newGroup = await Group.create({
    organizerId: req.user.id,
    ...validGroup(req.body),
  });

  res.status(201);
  res.json(newGroup);
});

//ADD A GROUP IMAGE//
router.post("/:groupId/images", requireAuth, async (req, res, next) => {
  const { url, preview } = req.body;
  let { groupId } = req.params;

  const group = await Group.findByPk(groupId);

  checkIfExist(group);

  requireAuthResponse(group.organizerId === req.user.id);

  const newGroupImage = await GroupImage.create({
    groupId,
    url,
    preview,
  });

  const groupImgPojo = newGroupImage.toJSON();
  delete groupImgPojo.createdAt;
  delete groupImgPojo.updatedAt;
  delete groupImgPojo.groupId;

  return res.json(groupImgPojo);
});

//EDIT A GROUP//
router.put("/:groupId", requireAuth, validateGroupEdit, async (req, res) => {
  let { groupId } = req.params;
  const { id: currUserId } = req.user;
  const { name, about, type, private, city, state } = req.body;
  groupId = parseInt(groupId);

  const groupToEdit = await Group.findByPk(groupId);

  if (!groupToEdit) {
    return validGroup(res, "Group");
  }

  if (groupToEdit.organizerId !== currUserId) {
    return requireAuthResponse(res);
  }

  const updatedGroup = await groupToEdit.update({
    name: name ?? groupToEdit.name,
    about: about ?? groupToEdit.about,
    type: type ?? groupToEdit.type,
    private: private ?? groupToEdit.private,
    city: city ?? groupToEdit.city,
    state: state ?? groupToEdit.state,
  });

  updatedGroup.organizerId = currUserId;

  return res.json(updatedGroup);
});

//DELETE A GROUP//
router.delete("/:groupId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const group = await Group.findByPk(req.params.groupId);
  checkIfExist(group);
  requireAuthResponse(group.organizerId === userId);
  await group.destroy();
  res.json({
    message: "Successfully deleted",
  });
});

//GET A VENUE
router.get("/:groupId/venues", requireAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  const group = await Group.findByPk(groupId);

  checkIfExist(group);
  const isCoHost = await Membership.findOne({
    where: {
      status: "co-host",
      userId,
      groupId,
    },
  });

  const isOrganizer = group.organizerId === userId;
  requireAuthResponse(isOrganizer || isCoHost);
  const Venues = await Venue.findAll({
    where: {
      groupId,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });
  res.json({ Venues });
});

router.post("/:groupId/venues", requireAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  const group = await Group.findByPk(groupId);

  checkIfExist(group);
  const isCoHost = await Membership.findOne({
    where: {
      status: "co-host",
      userId,
      groupId,
    },
  });

  const isOrganizer = group.organizerId === userId;
  requireAuthResponse(isOrganizer || isCoHost);
  const newVenue = await Venue.create({
    groupId,
    ...validVenue(req.body),
  });

  res.json({
    id: newVenue.id,
    groupId: newVenue.groupId,
    address: newVenue.address,
    city: newVenue.city,
    state: newVenue.state,
    lat: newVenue.lat,
    lng: newVenue.lng,
  });
});

router.get("/:groupId/events", async (req, res) => {
  const events = await Event.findAll({
    where: {
      groupId: req.params.groupId,
    },
    include: [
      { model: Group, attributes: ["id", "name", "city", "state"] },
      {
        model: Venue,
        attributes: ["id", "city", "state"],
      },
    ],
    attributes: {
      exclude: ["capacity", "price", "createdAt", "updatedAt", "description"],
      include: ["groupId"],
    },
  });
  checkIfExist(events);
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
    eventObj.previewImage = eventImage.url;
    eventArr.push(eventObj);
  }

  res.json({ Events: eventArr });
});
// Create an Event for a group specif by its id////
router.post("/:groupId/events", requireAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  const group = await Group.findByPk(groupId);

  checkIfExist(group);

  const isCoHost = await Membership.findOne({
    where: {
      status: "co-host",
      userId,
      groupId,
    },
  });

  const isOrganizer = group.organizerId === userId;
  requireAuthResponse(isOrganizer || isCoHost);
  const event = await Event.create({
    groupId,
    ...validEvent(req.body),
  });
  res.json(event);
});
//MEMBERSHIP//

module.exports = router;
