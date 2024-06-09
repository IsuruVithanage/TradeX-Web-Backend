const typeorm = require("typeorm");
const path = require("path");

const dataSource = new typeorm.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "isuruvithanage",
    password: "",
    database: "admin_service_db",
    synchronize: true,
    logging : true,
    entities: [path.join(__dirname , ".." , "models/**/*.js")],
})


module.exports = dataSource;