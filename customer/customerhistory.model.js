const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const CustomerHistory = sequelize.define('customerHistory', {
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] }
    },
    scopes: {
      withHash: { attributes: {} }
    },
    freezeTableName: true
  });

  // exclude circular reference to Customer model in CustomerHistory model's toJSON() method
  CustomerHistory.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.customerId;
    return values;
  };

  return CustomerHistory;
}
