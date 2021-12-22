const Sequelize = require("sequelize");
const db = require("../db");

const Group = db.define("group", {
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  photoUrl: {
    type: Sequelize.STRING,
  },
});

module.exports = Group;
