"use strict";
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Users";
    return queryInterface.bulkInsert(
      options,
      [
        {
          email: "danie.buva@gmail.com",
          username: "dani",
          hashedPassword: bcrypt.hashSync("password"),
          firstName: "dani",
          lastName: "buva",
        },
        {
          email: "lillykay@aim.com",
          username: "FakeUser1",
          hashedPassword: bcrypt.hashSync("password2"),
          firstName: "lilliana",
          lastName: "kay",
        },
        {
          email: "omarels@yahoo,com",
          username: "FakeUser2",
          hashedPassword: bcrypt.hashSync("password3"),
          firstName: "omar",
          lastName: "Omar El Sahlah",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Users";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        username: { [Op.in]: ["Demo-lition", "FakeUser1", "FakeUser2"] },
      },
      {}
    );
  },
};
