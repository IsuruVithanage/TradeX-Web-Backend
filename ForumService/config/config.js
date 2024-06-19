const typeorm = require("typeorm");

const path = require("path");
require('dotenv').config({path: path.join(__dirname, '...', '.env')});

console.log('RDS_HOST:', process.env.RDS_HOST);
console.log('RDS_PORT:', process.env.RDS_PORT);
console.log('RDS_USERNAME:', process.env.RDS_USERNAME);
console.log('RDS_PASSWORD:', process.env.RDS_PASSWORD);

const dataSource = new typeorm.DataSource({
    type: "postgres",
    host: process.env.RDS_HOST,
    port: process.env.RDS_PORT,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: "forum_service_db",
    synchronize: true,
    logging : true,
    entities: [path.join(__dirname, "..", "models/**/*.js")],
});

module.exports = dataSource;
