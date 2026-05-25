const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalDokter = sequelize.define('JadwalDokter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    hari: {
        type: DataTypes.STRING,
        allowNull: false // Contoh: "Senin", "Selasa"
    },
    jamMulai: {
        type: DataTypes.STRING,
        allowNull: false // Contoh: "08:00"
    },
    jamSelesai: {
        type: DataTypes.STRING,
        allowNull: false // Contoh: "14:00"
    },
    status: {
        type: DataTypes.ENUM('Aktif', 'Cuti', 'Tidak Hadir'),
        defaultValue: 'Aktif'
    }
}, {
    tableName: 'jadwal_dokters'
});

module.exports = JadwalDokter;