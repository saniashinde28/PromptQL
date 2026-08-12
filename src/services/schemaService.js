const pool = require('../db');

async function getDatabaseSchema(){

    const result = await pool.query(`Select 
            table_name,
            column_name,
            data_type
            FROM information_schema.columns
            WHERE table_schema='public'
            ORDER BY table_name, ordinal_position;`);

    const schema = {};
    result.rows.forEach(row => {
        if (!schema[row.table_name]) {
            schema[row.table_name] = {};
        }

        schema[row.table_name][row.column_name] = row.data_type;
    });
    return schema;


}

module.exports = { getDatabaseSchema };