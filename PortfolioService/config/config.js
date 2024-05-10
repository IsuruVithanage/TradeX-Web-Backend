const typeorm = require("typeorm");
const path = require("path");

const dataSource = new typeorm.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "isuruvithanage",
    database: "portfolio_service_db",
    synchronize: true,
    logging : ["error", "warn"],
    entities: [path.join(__dirname , ".." , "models/**/*.js")],
})


module.exports = dataSource;