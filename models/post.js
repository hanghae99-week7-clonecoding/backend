'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "channel",
        targetKey: "channel",
      });
      this.belongsTo(models.User, {
        foreignKey: "userimage",
        targetKey: "userimage",
      });
      this.hasMany(models.Comment, {
        foreignKey: "postId",
        sourceKey: "postId",
      });
      this.hasMany(models.like, {
        foreignKey: "postId",
        sourceKey: "postId",
      });      
    }
  }
  Post.init({
    postId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: DataTypes.STRING,
    discription: DataTypes.STRING,
    url: DataTypes.STRING,
    like: { type: DataTypes.INTEGER, defaultValue: 0 },
    category:DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};