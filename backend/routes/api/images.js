const router = require("express").Router();
const {
  EventImage,
  GroupImage,
  Group,
  Event,
  Membership,
} = require("../../db/models");
const { requireAuth, checkAuthorization } = require("../../utils/auth");
const { checkIfExist } = require("../../utils/validation");

//Delete an Image for a Group
router.delete("/group-images/:imageId", requireAuth, async (req, res) => {
  const imageId = req.params.imageId;
  const userId = req.user.id;
  const groupImage = await GroupImage.findByPk(imageId);
  checkIfExist(groupImage, "Group Image couldn't be found");
  const group = await Group.findByPk(groupImage.groupId);
  const isCoHost = await Membership.findOne({
    where: {
      groupId: group.id,
      userId,
      status: "co-host",
    },
  });
  checkAuthorization(group.organizerId === userId || isCoHost);
  await groupImage.destroy();
  res.json({
    message: "Successfully deleted",
  });
});

//Delete an Image for a Event
router.delete("/event-images/:imageId", requireAuth, async (req, res) => {
  const imageId = req.params.imageId;
  const userId = req.user.id;
  const eventImage = await EventImage.findByPk(imageId);
  checkIfExist(eventImage, "Event Image couldn't be found");
  const event = await Event.findByPk(eventImage.eventId);
  const isCoHost = await Membership.findOne({
    where: {
      groupId: event.groupId,
      userId,
      status: "co-host",
    },
  });
  const group = await Group.findByPk(event.groupId);
  checkAuthorization(group.organizerId === userId || isCoHost);
  await eventImage.destroy();
  res.json({
    message: "Successfully deleted",
  });
});
module.exports = router;
