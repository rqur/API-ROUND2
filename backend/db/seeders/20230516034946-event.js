"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Events";
    return queryInterface.bulkInsert(options, [
      {
        venueId: 1,
        groupId: 1,
        name: "hiking",
        description: "hiking mountains",
        type: "in person",
        capacity: 50,
        price: 40,
        startDate: "2023-2-3",
        endDate: "2023-2-3",
      },
      {
        venueId: 2,
        groupId: 2,
        name: "cooking",
        description: "cooking meals",
        type: "in person",
        capacity: 50,
        price: 40,
        startDate: "2023-2-3",
        endDate: "2023-2-3",
      },
      {
        venueId: 3,
        groupId: 3,
        name: "painting",
        description: "painting faces",
        type: "in person",
        capacity: 50,
        price: 40,
        startDate: "2023-2-3",
        endDate: "2023-2-3",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Events";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: {
          [Op.in]: ["hiking", "cooking", "painting"],
        },
      },
      {}
    );
  },
};
