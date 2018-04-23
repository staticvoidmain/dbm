'use strict'

// import "reflect-metadata";

function ms() {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    // I think my plan was to decorate certain validations with a @ms or @mysql or whatever
    // to indicate that the rule was only valid for certain platforms.
  }
}

// philosophical: what can we possibly do inside a migration that can BREAK the consistency of our
// database and cause mistakes.
var steps = [
  'ensure_procs_return_result',
  'ensure_role_can_execute_procs',
  'ensure_table_primary_keys',
  'ensure_view_definitions',
  'ensure_all_constraints_checked',
  'ensure_database_consistency', // dbcc
  'ensure_security_config'  // no sp_exec or other spooky things?
]

// if your procs are running as db_owner, this should probably throw.
function effectiveProcedurePermissions(role) {
  return `
  execute as user = '${role}'

  select 
    name,
    can_execute = HAS_PERMS_BY_NAME(name, 'OBJECT', 'execute')
  from sys.procedures p
  inner join syscomments c
  on p.object_id = c.id

  where is_ms_shipped = 0
  order by number, colid

  revert;
`
}

function roleCanExecute(role) {
  return `
  select [permission].*
  from sys.database_permissions [permission]
  inner join sys.database_principals [user]
    on [user].principal_id = [permission].grantee_principal_id
  where major_id = object_id('$name')
    and [user].name = '${role}'
    and [permission].[permission_name] = 'EXECUTE'
    and [permission].[state] = 'G'
  `;
}

function canGetResult(name) {
  return `SELECT * FROM sys.dm_exec_describe_first_result_set_for_object(OBJECT_ID('${name}'), 1);`;
}

// I don't even know what the interface should look like.