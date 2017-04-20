export interface IDatabaseSchema {
  tables: Array<any>
  procedures: Array<any>
  views: Array<any>
  keys: Array<any>
}

export function mergeResults(values) {
  let [tables, columns, keys] = values;
  let tableLookup = {}

  // todo: stitch together the keys.
  for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
    let table = tables[tableIndex]
    let key = table.schema + '.' + table.name

    tableLookup[key] = table
    table.columns = []
  }

  for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
    let column = columns[columnIndex]
    let key = column.tableSchema + '.' + column.tableName
    let table = tableLookup[key]

    if (table) {
      table.columns.push(column)
    }
  }

  return {
    tables: tables,
    procedures: null,
    vieiws: null,
    keys: keys
  }
}