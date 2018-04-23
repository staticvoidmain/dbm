export interface IDatabaseSchema {
  tables?: Array<any>
  procedures?: Array<any>
  views?: Array<any>
  // todo: should keys be hoisted up like this, or part of the table?
  keys?: Array<any>
}

export function getSingleTable() {
  
}

/**
 * combines a set of promise results into a single result.
 *
 * @param values [ tables, columns, keys, views, procedures ]
 * @returns combined database schema
 */
export function mergeResults(values): IDatabaseSchema {
  const [
    tables,
    columns,
    keys,
    views,
    procedures
  ] = values;

  const tableLookup = {}

  // todo: stitch together the keys.
  for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
    const table = tables[tableIndex]
    const key = table.schema + '.' + table.name

    tableLookup[key] = table
    table.columns = []
  }

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
    const column = columns[columnIndex]
    const key = column.tableSchema + '.' + column.tableName
    const table = tableLookup[key]

    if (table) {
      table.columns.push(column)
    }
  }

  return {
    tables: tables,
    procedures: procedures,
    views: views,
    keys: keys
  }
}