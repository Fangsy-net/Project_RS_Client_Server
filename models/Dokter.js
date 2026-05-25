const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Dokter = sequelize.define('Dokter', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
    namaDokter: { type: DataTypes.STRING, allowNull: false, field: 'nama_dokter' },
    spesialisasi: { type: DataTypes.STRING, allowNull: false },
    noIzinPraktek: { type: DataTypes.STRING, allowNull: true, unique: true, field: 'no_izin_praktek' },
    noTelp: { type: DataTypes.STRING, allowNull: true, field: 'no_telp' }
}, { tableName: 'dokter' });

// Relasi 1:1 antara User dan Dokter
User.hasOne(Dokter, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Dokter.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Dokter;