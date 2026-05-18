const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pasien = sequelize.define('Pasien', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nik: { type: DataTypes.STRING(16), allowNull: false, unique: true },
    namaPasien: { type: DataTypes.STRING, allowNull: false, field: 'nama_pasien' },
    tanggalLahir: { type: DataTypes.DATEONLY, allowNull: false, field: 'tanggal_lahir' },
    jenisKelamin: { type: DataTypes.ENUM('L', 'P'), allowNull: false, field: 'jenis_kelamin' },
    alamat: { type: DataTypes.TEXT },
    noTelp: { type: DataTypes.STRING, field: 'no_telp' }
}, { tableName: 'pasien' });

module.exports = Pasien;