const router = require("express").Router();
const { fn, col } = require("sequelize");
const { Group, Membership, GroupImage } = require("../../db/models");

router.get("/", async (req, res) => {
  const groups = await Group.findAll({
    raw: true,
  });
  for (let group of groups) {
    const numMembers = await Membership.count({
      where: {
        groupId: group.id,
      },
    });
    const previewImage = await GroupImage.findOne({
      where: {
        groupId: group.id,
        preview: true,
      },
    });
    group.numMembers = numMembers;
    group.previewImage = previewImage.url;
  }
  res.json({
    Groups: groups,
  });
});

module.exports = router;
