const {
  requireAuth,
  validVenue,
  checkAutorization,
} = require("../../utils/auth");
const { Venue, Group, Membership } = require("../../db/models");
const { checkIfExist } = require("../../utils/validation");
const router = require("express").Router();

router.put("/:venueId", requireAuth, async (req, res) => {
  const venueId = req.params.venueId;
  const userId = req.user.id;

  const venue = await Venue.findByPk(venueId);
  checkIfExist(venue, "Venue couldn't be found");

  const isOrganizer = await Group.findOne({
    where: { id: venue.groupId, organizerId: userId },
  });
  const isCoHost = await Membership.findOne({
    where: {
      status: "co-host",
      userId,
      groupId: venue.groupId,
    },
  });
  checkAutorization(isOrganizer || isCoHost);

  await venue.update(validVenue(req.body));
  const venueObj = venue.toJSON();
  delete venueObj.createdAt, delete venueObj.updatedAt;
  res.json(venueObj);
});

module.exports = router;
