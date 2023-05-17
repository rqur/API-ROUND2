"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "EventImages";
    return queryInterface.bulkInsert(options, [
      {
        eventId: 1,
        url: "www.google1.com",
        preview: true,
      },
      {
        eventId: 2,
        url: "www.google2.com",
        preview: true,
      },
      {
        eventId: 3,
        url: "www.google3.com",
        preview: false,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "EventImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        url: {
          [Op.in]: ["www.google.com", "www.google1.com", "www.google2.com"],
        },
      },
      {}
    );
  },
};
