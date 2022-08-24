'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      this.belongsTo(models.User,{
        foreignKey: "userId",
        targetKey: "userId",
      });
      this.belongsTo(models.User,{
        foreignKey: "channel",
        targetKey: "channel",
      });
    }
  }
  Subs.init({
      subscribeId: {     
      allowNull : false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Subs',
  });
  return Subs;
};