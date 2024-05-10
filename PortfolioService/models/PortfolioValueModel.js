const EntitySchema = require("typeorm").EntitySchema

const columns = {
    userId: {
        primary: true,
        type: "int",
        nullable: false,
    },
    recordNo: {
        primary: true,
        type: "int",
        default: 1,
        nullable: false,
    },
    time: {
        type: "timestamp with time zone",
        nullable: false,
    },
    value: {
        type: "float",
        nullable: false,
    },
};


const PortfolioHourlyValue = new EntitySchema({
    name: "PortfolioHourlyValue",
    tableName: "portfolioHourlyValue",
    columns: columns
});

const PortfolioDailyValue = new EntitySchema({
    name: "PortfolioDailyValue",
    tableName: "portfolioDailyValue",
    columns: columns
});

const PortfolioWeeklyValue = new EntitySchema({
    name: "PortfolioWeeklyValue",
    tableName: "portfolioWeeklyValue",
    columns: columns
});

module.exports = [
    PortfolioHourlyValue,
    PortfolioDailyValue,
    PortfolioWeeklyValue,
]