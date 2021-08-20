import mysql from 'serverless-mysql';

const db = mysql({
    config: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT ?? 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_BASE,
    }
});

export default async function execute({ query, values }) {
    try {
        const results = await db.query(query, values);
        await db.end();
        return results;
    } catch (error) {
        return { error };
    }
}

export function tableName(raw_table_name) {
    const $return = {};

    const [table_name, alias] = raw_table_name.replace(/`/g, "").split(" AS ");

    const [name, database] = table_name.split(".").reverse();

    $return.database = database;
    $return.name = name;
    $return.alias = alias;

    const table_parts = [];
    if (database) table_parts.push(database);
    if (table_name) table_parts.push(name);

    const joined_parts = `${table_parts.join("`.`")}`;
    if (alias) {
        $return.fullname = `\`${joined_parts}\` AS \`${alias}\``;
    } else {
        $return.fullname = `\`${joined_parts}\``;
    }

    return $return;
}

export function buildWhere(params, debug = false) {
    const query_where_params = [];
    params.map(condition => {
        if (Array.isArray(condition)) {
            query_where_params.push(`(${condition.join(" OR ")})`);
        } else {
            query_where_params.push(condition);
        }
    });

    return query_where_params;
}

export async function buildSelect(params, debug = false) {
    if (debug) console.log("params", params);

    const table = tableName(params.table);

    const columns = params.columns ?? [`\`${table.alias ?? table.name}\`.*`];
    const joins = params.joins ?? [];
    const where = params.where ?? [];
    const group_by = params.group_by ?? [];
    const order_by = params.order_by ?? [];

    const query_columns_params = [];
    columns.map(column => query_columns_params.push(column));

    const query_joins_params = [];
    joins.map(join_table => {
        const join_query = [];
        join_query.push(join_table[0]);
        join_query.push(tableName(join_table[1]).fullname);
        join_query.push(`ON (${join_table[2].join(" AND ")})`);
        query_joins_params.push(join_query.join(" "));
    });

    const query_where_params = buildWhere(where);

    const query_order_params = [];
    order_by.map(column => query_order_params.push(column));

    const query_group_params = [];
    group_by.map(column => query_group_params.push(column));

    const query_table = table.fullname;
    const query_columns = query_columns_params.join(", ");
    const query_joins = query_joins_params.join(" ") ?? "";
    const query_where = (query_where_params.length) ? ` WHERE ${query_where_params.join(" AND ")}` : "";
    const query_group_by = (query_group_params.length) ? ` GROUP BY ${query_group_params.join(",")}` : "";
    const query_order_by = (query_order_params.length) ? ` ORDER BY ${query_order_params.join(",")}` : "";

    const query = `SELECT ${query_columns} FROM ${query_table}${query_joins}${query_where}${query_group_by}${query_order_by}`;

    if (debug) console.log("query", query);

    return query;
}

export async function select(params, debug = false) {
    const $return = {};

    $return.success = false;
    $return.results = 0;

    const query = await buildSelect(params);
    const select_raw = await execute({ query });

    if (debug) {
        console.log("query", query);
        console.log("select_raw", select_raw);
    }

    $return.query = query;
    if (select_raw.error) {
        $return.query = query;
        $return.error = select_raw;

    } else {
        $return.success = true;
        $return.results = select_raw.length;
        const data = [];
        Object.keys(select_raw).map(row_raw => {
            var row = JSON.stringify(select_raw[row_raw]);
            row = JSON.parse(row);
            delete row.password;

            data.push(row);
        })

        $return.data = data;
    }

    return $return;
}

export async function insert(params, debug = false) {
    const $return = {};

    $return.success = false;
    $return.affected_rows = 0;

    const query_columns = [];
    const query_data = [];
    Object.keys(company).map(field => {
        query_columns.push(field)
        query_data.push(escapeString(company[field]));
    });

    const query = `INSERT INTO companies (\`${query_columns.join("\`, \`")}\`) VALUES ('${query_data.join("', '")}')`;
    $return.sql = query;

    return $return;
}

export async function update(params, debug = false) {
    const $return = {};

    $return.success = false;
    $return.affected_rows = 0;

    return $return;
}

export async function remove(params, debug = false) {
    const $return = {};

    $return.success = false;
    $return.affected_rows = 0;

    return $return;
}