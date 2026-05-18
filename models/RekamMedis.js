const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pasien = require('./Pasien');
const Dokter = require('./Dokter');

const RekamMedis = sequelize.define('RekamMedis', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pasienId: { type: DataTypes.INTEGER, allowNull: false, field: 'pasien_id' },
    dokterId: { type: DataTypes.INTEGER, allowNull: false, field: 'dokter_id' },
    tanggalPeriksa: { type: DataTypes.DATEONLY, allowNull: false, field: 'tanggal_periksa' },
    keluhan: { type: DataTypes.TEXT },
    diagnosa: { type: DataTypes.TEXT, allowNull: false },
    resepObat: { type: DataTypes.TEXT, allowNull: false, field: 'resep_obat' }
}, { tableName: 'rekam_medis' });

// Relasi 1:M (Pasien ke Rekam Medis & Dokter ke Rekam Medis)
Pasien.hasMany(RekamMedis, { foreignKey: 'pasien_id', onDelete: 'CASCADE' });
RekamMedis.belongsTo(Pasien, { foreignKey: 'pasien_id' });

Dokter.hasMany(RekamMedis, { foreignKey: 'dokter_id', onDelete: 'CASCADE' });
RekamMedis.belongsTo(Dokter, { foreignKey: 'dokter_id' });

module.exports = RekamMedis;