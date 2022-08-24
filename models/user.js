'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Post, {
        foreignKey: "channel",
        sourceKey: "channel",
      });
      this.hasMany(models.Post, {
        foreignKey: "userimage",
        sourceKey: "userimage",
      });
      this.hasMany(models.Comment, {
        foreignKey: "channel",
        sourceKey: "channel",
      });
      this.hasMany(models.Comment, {
        foreignKey: "userimage",
        sourceKey: "userimage",
      });
      this.hasMany(models.like, {
        foreignKey: "channel",
        sourceKey: "channel",
      });
      this.hasMany(models.Subs, {
        foreignKey: "channel",
        sourceKey: "channel",
      });
      this.hasMany(models.Subs, {
        foreignKey: "userId",
        sourceKey: "userId",
      });
    }
  }
  User.init({
    userId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    channel:
    {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },

    email: DataTypes.STRING,
    password: DataTypes.STRING,
    userimage: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};