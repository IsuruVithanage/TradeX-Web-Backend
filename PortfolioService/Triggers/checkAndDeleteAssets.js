const dataSource = require('../config/config');

const createTriggerFunction = async () => {

    const sqlQuery = `
        CREATE OR REPLACE FUNCTION check_and_delete_asset()
        RETURNS TRIGGER AS $$
        DECLARE
            total_balance FLOAT;
        BEGIN
            IF NEW.symbol = 'USD' THEN
                RETURN NEW;
            END IF;
        
        
            SELECT "tradingBalance" + "holdingBalance" + "fundingBalance" INTO total_balance
            FROM asset
            WHERE "userId" = NEW."userId" AND "symbol" = NEW."symbol";
        
            IF total_balance <= 0 THEN
                DELETE FROM asset WHERE "userId" = NEW."userId" AND "symbol" = NEW."symbol";
            END IF;
        
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;


        CREATE OR REPLACE TRIGGER check_and_delete_asset_trigger
        AFTER UPDATE ON asset
        FOR EACH ROW
        EXECUTE FUNCTION check_and_delete_asset();`
    ;

    try {
        await dataSource.query(sqlQuery);
    } catch (error) {
        console.error('\n\nError creating trigger function:\n\n', error);
    }
}

module.exports = createTriggerFunction;