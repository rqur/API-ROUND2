"use strict";
const { Model } = require("sequelize");
const eventimage = require("./eventimage");
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: "eventId",
        otherKey: "userId",
      });
      Event.hasMany(models.EventImage, {
        foreignKey: "eventId",
      });
      Event.belongsTo(models.Group, {
        foreignKey: "eventId",
      });
      Event.belongsTo(models.Venue, {
        foreignKey: "eventId",
      });
    }
  }
  Event.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM,
        values: ["in person", "online"],
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: "Event",
    }
  );
  return Event;
};
