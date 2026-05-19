const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const RekamMedis = require('./RekamMedis');

const Transaksi = sequelize.define('Transaksi', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rekamMedisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rekam_medis_id',
        references: { model: RekamMedis, key: 'id' }
    },
    biayaDokter: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'biaya_dokter'
    },
    biayaObat: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'biaya_obat'
    },
    totalBayar: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_bayar'
    },
    statusPembayaran: {
        type: DataTypes.ENUM('Belum Lunas', 'Lunas'),
        allowNull: false,
        defaultValue: 'Belum Lunas',
        field: 'status_pembayaran'
    }
}, {
    tableName: 'transaksi',
    timestamps: true
});

// Setup Relasi agar kasir bisa melihat detail rekam medis saat bayar
Transaksi.belongsTo(RekamMedis, { foreignKey: 'rekam_medis_id', as: 'rekamMedis' });

module.exports = Transaksi;