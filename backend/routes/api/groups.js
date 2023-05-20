const router = require("express").Router();
const { Op } = require("sequelize");
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
const { checkIfExist } = require("../../utils/validation");
const {
  requireAuth,
  checkAuthorization,
  validGroup,
  validVenue,
  validEvent,
} = require("../../utils/auth");

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
      {
        model: Venue,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });

  checkIfExist(group);

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

  checkAuthorization(group.organizerId === req.user.id);

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
router.put("/:groupId", requireAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  const group = await Group.findByPk(groupId);
  checkIfExist(group);
  checkAuthorization(group.organizerId === userId);

  await group.update(validGroup(req.body));
  return res.json(group);
});

//DELETE A GROUP//
router.delete("/:groupId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const group = await Group.findByPk(req.params.groupId);
  checkIfExist(group);
  checkAuthorization(group.organizerId === userId);
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
  checkAuthorization(isOrganizer || isCoHost);
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
//CREATE A VENUE
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
  checkAuthorization(isOrganizer || isCoHost);

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
//GET ALL EVENTS BY GROUP ID
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
  checkIfExist(events.length);
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
    eventObj.previewImage = eventImage;
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
  checkAuthorization(isOrganizer || isCoHost);
  const event = await Event.create({
    groupId,
    ...validEvent(req.body),
  });
  res.json({
    id: event.id,
    groupId: event.groupId,
    venueId: event.venueId,
    name: event.name,
    capacity: event.capacity,
    price: event.price,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
  });
});

//MEMBERSHIP//
//Get all Members of a Group specified by its id
router.get("/:groupId/members", async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId);
  checkIfExist(group);
  let userId;
  if (req.user) {
    userId = req.user.id;
  }

  const isCoHost = await Membership.findOne({
    where: {
      status: "co-host",
      userId,
      groupId,
    },
  });
  const isOrganizer = group.organizerId === userId;
  let where;

  if (!(isCoHost && isOrganizer)) {
    where = { status: { [Op.not]: "pending" } };
  }

  const members = await Membership.findAll({
    groupId,
    attributes: ["userId", "status"],
    where,
  });
  const users = await User.findAll({
    attributes: ["id", "firstName", "lastName"],
  });
  const Members = members.map((member) => {
    const user = users.find((x) => x.id === member.userId);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      Membership: { status: member.status },
    };
  });
  res.json({ Members });
});

//Request a Membership for a Group based on the Group's id
router.post("/:groupId/membership", requireAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  const group = await Group.findByPk(groupId);
  checkIfExist(group);

  const membership = await Membership.findOne({
    where: {
      userId,
      groupId,
    },
  });
  const isOrganizer = await Group.findOne({
    where: { organizerId: userId, id: groupId },
  });
  if (membership) {
    res.status(400);
    if (
      membership.status === "member" ||
      membership.status === "co-host" ||
      isOrganizer
    ) {
      return res.json({
        message: "User is already a member of the group",
      });
    }
    if (membership.status === "pending") {
      return res.json({
        message: "Membership has already been requested",
      });
    }
  }

  const newRequest = await Membership.create({
    userId,
    groupId,
    status: "pending",
  });
  await newRequest.reload({
    attributes: { include: ["id"] },
  });

  res.json({ memberId: newRequest.userId, status: newRequest.status });
});

//Change the status of a membership for a group specified by id
router.put("/:groupId/membership", requireAuth, async (req, res) => {
  const { memberId, status } = req.body;
  if (!memberId || !status) {
    return res.status(400).json({ message: "provide a body nerd" });
  }
  if (status === "pending") {
    return res.status(400).json({
      message: "Validations Error",
      errors: {
        status: "Cannot change a membership status to pending",
      },
    });
  }

  const userExists = await User.findOne({
    where: { id: memberId },
  });
  if (!userExists) {
    return res.status(400).json({
      message: "Validation Error",
      errors: {
        memberId: "User couldn't be found",
      },
    });
  }

  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId);
  checkIfExist(group);

  const userId = req.user.id;

  const member = await Membership.findOne({
    where: {
      userId: memberId,
      groupId,
    },
  });
  checkIfExist(
    member,
    "Membership between the user and the group does not exist"
  );
  const isCoHost = await Membership.findOne({
    where: { userId, groupId, status: "co-host" },
  });
  const isOrganizer = group.organizerId === userId;
  checkAuthorization(isCoHost || isOrganizer);

  if (status === "co-host") {
    checkAuthorization(isOrganizer);
  }

  await member.update({ status });
  await member.reload({
    attributes: { include: ["id"] },
  });
  const memberObj = member.toJSON();
  delete memberObj.createdAt;
  delete memberObj.updatedAt;
  res.json({ id: member.id, ...memberObj });
});

//Delete membership to a group specified by id
router.delete("/:groupId/membership", requireAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  const { memberId } = req.body;

  if (!memberId) {
    return res.status(400).json({ message: "PROVIDE A MEMBERID!!!" });
  }

  const group = await Group.findByPk(groupId);
  checkIfExist(group, "Group couldn't be found");

  const isCoHost = await Membership.findOne({
    where: {
      userId,
      groupId,
      status: "co-host",
    },
  });
  const isOrganizer = group.organizerId === userId;
  checkAuthorization(isCoHost || isOrganizer);

  const member = await Membership.findOne({
    where: {
      userId: memberId,
      groupId,
    },
  });
  checkIfExist(member, "Membership does not exist for this User");

  await member.destroy();
  res.json({ message: "Successfully deleted membership from group" });
});
module.exports = router;
