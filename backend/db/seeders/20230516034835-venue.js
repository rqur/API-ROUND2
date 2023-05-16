"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Venues";
    return queryInterface.bulkInsert(options, [
      {
        groupId: 1,
        address: "20w rock street",
        city: "oakBrook",
        state: "illinois",
        lat: 33.333,
        lng: 33.333,
      },
      {
        groupId: 2,
        address: "20w23 rock street",
        city: "oakBrook",
        state: "illinois",
        lat: 32.333,
        lng: 32.333,
      },
      {
        groupId: 3,
        address: "20w40 rock street",
        city: "oakBrook",
        state: "illinois",
        lat: 31.333,
        lng: 31.333,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Venues";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        address: {
          [Op.in]: [
            "20w rock street",
            "20w23 rock street",
            "20w40 rock street",
          ],
        },
      },
      {}
    );
  },
};
