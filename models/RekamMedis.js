const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RekamMedis = sequelize.define('RekamMedis', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pasienId: { type: DataTypes.INTEGER, field: 'pasien_id', allowNull: false },
    dokterId: { type: DataTypes.INTEGER, field: 'dokter_id', allowNull: false },
    keluhan: { type: DataTypes.TEXT, allowNull: false },
    diagnosa: { type: DataTypes.TEXT, allowNull: false }, // RAHASIA
    terapiObat: { type: DataTypes.TEXT, field: 'terapi_obat' }
}, { tableName: 'rekam_medis' });

module.exports = RekamMedis;