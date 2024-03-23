const dataSource = require('../config/config');

const update_portfolio_value_trigger = async () => {

    const sqlQuery = `
    CREATE OR REPLACE FUNCTION update_portfolio_value() RETURNS TRIGGER AS $$
    DECLARE
        lastRecordNo INT;
        recordHolder RECORD;
    BEGIN
        CASE TG_TABLE_NAME
            WHEN 'portfolioHourlyValue' THEN lastRecordNo := 24;
            WHEN 'portfolioDailyValue' THEN lastRecordNo := 31;
            WHEN 'portfolioWeeklyValue' THEN lastRecordNo := 53;
        END CASE;

        EXECUTE format('DELETE FROM %I WHERE "userId" = $1 AND "recordNo" = $2', TG_TABLE_NAME)
        USING NEW."userId", lastRecordNo;

        FOR recordHolder IN
            EXECUTE format('SELECT * FROM %I WHERE "userId" = $1 ORDER BY "recordNo" DESC', TG_TABLE_NAME)
            USING NEW."userId"
        LOOP
            EXECUTE format('UPDATE %I SET "recordNo" = "recordNo" + 1 WHERE "userId" = $1 AND "recordNo" = $2', TG_TABLE_NAME)
            USING recordHolder."userId", recordHolder."recordNo";
        END LOOP;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;



    CREATE OR REPLACE TRIGGER update_portfolio_hourly_value_trigger
        BEFORE INSERT ON "portfolioHourlyValue"
        FOR EACH ROW
        EXECUTE FUNCTION update_portfolio_value();


    CREATE OR REPLACE TRIGGER update_portfolio_daily_value_trigger
        BEFORE INSERT ON "portfolioDailyValue"
        FOR EACH ROW
        EXECUTE FUNCTION update_portfolio_value();


    CREATE OR REPLACE TRIGGER update_portfolio_weekly_value_trigger
        BEFORE INSERT ON "portfolioWeeklyValue"
        FOR EACH ROW
        EXECUTE FUNCTION update_portfolio_value();

    `;

    try {
        await dataSource.query(sqlQuery);
    } catch (error) {
        console.error('\n\nError creating trigger function:\n\n', error);
    }
}

module.exports = update_portfolio_value_trigger;