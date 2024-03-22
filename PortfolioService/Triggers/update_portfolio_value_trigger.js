const dataSource = require('../config/config');

const update_portfolio_value_trigger = async () => {

    const sqlQuery = `
    CREATE OR REPLACE FUNCTION update_portfolio_value()
        RETURNS TRIGGER AS $$
    DECLARE
        recordToDelete INT;
        record_row RECORD;
        cur_cursor CURSOR FOR
            SELECT * FROM "portfolioHourlyValue"
            WHERE "userId" = NEW."userId" 
            ORDER BY "recordNo" DESC;
            
    BEGIN
        CASE TG_TABLE_NAME
            WHEN 'portfolioHourlyValue' THEN recordToDelete := 24;
            WHEN 'portfolioDailyValue' THEN recordToDelete := 31;
            WHEN 'portfolioWeeklyValue' THEN recordToDelete := 53;
        END CASE;

        EXECUTE format('DELETE FROM %I WHERE "userId" = $1 AND "recordNo" = $2', TG_TABLE_NAME)
        USING NEW."userId", recordToDelete;

        OPEN cur_cursor;
        LOOP
            FETCH cur_cursor INTO record_row;
            EXIT WHEN NOT FOUND;

            EXECUTE format('UPDATE %I SET "recordNo" = "recordNo" + 1 WHERE "userId" = $1 AND "recordNo" = $2', TG_TABLE_NAME)
            USING record_row."userId", record_row."recordNo";
        END LOOP;

        CLOSE cur_cursor;

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