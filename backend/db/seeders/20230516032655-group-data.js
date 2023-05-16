"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Groups";
    return queryInterface.bulkInsert(options, [
      {
        organizerId: 1,
        name: "fashion group",
        about: "we like fashion",
        type: "in person",
        private: true,
        city: "chicago",
        state: "illinois",
      },

      {
        organizerId: 1,
        name: "cooking group",
        about: "we like cooking",
        type: "in person",
        private: true,
        city: "chicago",
        state: "illinois",
      },

      {
        organizerId: 1,
        name: "hiking group",
        about: "we like hiking",
        type: "in person",
        private: true,
        city: "chicago",
        state: "illinois",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Groups";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: {
          [Op.in]: ["fashion group", "cooking group", "hiking group"],
        },
      },
      {}
    );
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
