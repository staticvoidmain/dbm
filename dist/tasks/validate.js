'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var steps = [
    'ensure_procs_return_result',
    'ensure_role_can_execute_procs',
    'ensure_table_primary_keys',
    'ensure_view_definitions',
    'ensure_all_constraints_checked'
];
function roleCanExecute(role) {
    return ' select [permission].* ' +
        ' from sys.database_permissions [permission] ' +
        ' inner join sys.database_principals [user] ' +
        '   on [user].principal_id = [permission].grantee_principal_id ' +
        " where major_id = object_id('$name') " +
        "   and [user].name = '" + role + "' " +
        "   and [permission].[permission_name] = 'EXECUTE' " +
        "   and [permission].[state] = 'G'";
}
function canGetResult(name) {
    return "SELECT * FROM sys.dm_exec_describe_first_result_set_for_object(OBJECT_ID('" + name + "'), 1);";
}
function validate() {
    return false;
}
exports.validate = validate;
