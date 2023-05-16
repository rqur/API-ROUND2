"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Memberships";
    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        userId: 1,
        groupId: 1,
        status: "member",
      },
      {
        id: 2,
        userId: 2,
        groupId: 2,
        status: "co-host",
      },
      {
        id: 3,
        userId: 3,
        groupId: 3,
        status: "pending",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Memberships";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        id: {
          [Op.in]: [1, 2, 3],
        },
      },
      {}
    );
  },
};
