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
        name: "BEACH PARTYY!!!",
        description: "18+ Bring Your Own Beverages",
        type: "in person",
        capacity: 50,
        price: 40,
        startDate: "2023-21-05",
        endDate: "2023-21-05",
      },
      {
        venueId: 2,
        groupId: 2,
        name: "Yacht Party",
        description: "50+ People on an all inclusive trip",
        type: "in person",
        capacity: 50,
        price: 40,
        startDate: "2023-10-25",
        endDate: "2023-10-25",
      },
      {
        venueId: 3,
        groupId: 3,
        name: "GET LIT OR GET LET OUT",
        description:
          "Live Music, Games, Dancing till the sun comes out. Join us on calm beach starting at 8PM",
        type: "in person",
        capacity: 50,
        price: 40,
        startDate: "2023-07-06",
        endDate: "2023-07-06",
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
          [Op.in]: ["BEACH PARTYY!!!", "Yacht Party", "GET LIT OR GET LET OUT"],
        },
      },
      {}
    );
  },
};
