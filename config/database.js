const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false, // Set ke true jika ingin melihat raw SQL di terminal
        define: {
            timestamps: true, // Mengaktifkan created_at & updated_at otomatis
            underscored: true // Mengubah camelCase mjd snake_case di database (e.g. userId mjd user_id)
        }
    }
);

module.exports = sequelize;