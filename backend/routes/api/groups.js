const router = require("express").Router();
const { Group } = require("../../db/models");

router.get("/", async (req, res) => {
  const groups = await Group.findAll();
  res.json(groups);
});

module.exports = router;
