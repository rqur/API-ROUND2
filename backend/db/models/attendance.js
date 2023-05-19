"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Event);
      Attendance.belongsTo(models.User);
    }
  }
  Attendance.init(
    {
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["pending", "attending", "waitlist"],
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Attendance",
    }
  );
  return Attendance;
};
