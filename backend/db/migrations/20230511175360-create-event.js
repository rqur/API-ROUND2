"use strict";
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Events",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        venueId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          onDelete: "CASCADE",

          references: {
            model: "Venues",
            key: "id",
          },
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          onDelete: "CASCADE",

          references: {
            model: "Groups",
            key: "id",
          },
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM("online", "in person"),
          allowNull: false,
        },
        capacity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        price: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        startDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        endDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      options
    );
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Events";
    await queryInterface.dropTable(options);
  },
};
