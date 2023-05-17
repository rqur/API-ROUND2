"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "GroupImages";
    return queryInterface.bulkInsert(options, [
      {
        groupId: 1,
        url: "www.google.com",
        preview: true,
      },

      {
        groupId: 2,
        url: "www.google1.com",
        preview: true,
      },
      {
        groupId: 3,
        url: "www.google2.com",
        preview: true,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "GroupImages";
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
