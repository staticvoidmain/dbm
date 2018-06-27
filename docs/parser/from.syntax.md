[ FROM { <table_source> } [ ,...n ] ]
<table_source> ::=
{
    table_or_view_name [ [ AS ] table_alias ]
        [ <tablesample_clause> ]
        [ WITH ( < table_hint > [ [ , ]...n ] ) ]
    | rowset_function [ [ AS ] table_alias ]
        [ ( bulk_column_alias [ ,...n ] ) ]
    | user_defined_function [ [ AS ] table_alias ]
    | OPENXML <openxml_clause>
    | derived_table [ [ AS ] table_alias ] [ ( column_alias [ ,...n ] ) ]
    | <joined_table>
    | <pivoted_table>
    | <unpivoted_table>
    | @variable [ [ AS ] table_alias ]
    | @variable.function_call ( expression [ ,...n ] )
        [ [ AS ] table_alias ] [ (column_alias [ ,...n ] ) ]
    | FOR SYSTEM_TIME <system_time>
}
<tablesample_clause> ::=
    TABLESAMPLE [SYSTEM] ( sample_number [ PERCENT | ROWS ] )
        [ REPEATABLE ( repeat_seed ) ]

<joined_table> ::=
{
    <table_source> <join_type> <table_source> ON <search_condition>
    | <table_source> CROSS JOIN <table_source>
    | left_table_source { CROSS | OUTER } APPLY right_table_source
    | [ ( ] <joined_table> [ ) ]
}
<join_type> ::=
    [ { INNER | { { LEFT | RIGHT | FULL } [ OUTER ] } } [ <join_hint> ] ]
    JOIN

<pivoted_table> ::=
    table_source PIVOT <pivot_clause> [ [ AS ] table_alias ]

<pivot_clause> ::=
        ( aggregate_function ( value_column [ [ , ]...n ])
        FOR pivot_column
        IN ( <column_list> )
    )

<unpivoted_table> ::=
    table_source UNPIVOT <unpivot_clause> [ [ AS ] table_alias ]

<unpivot_clause> ::=
    ( value_column FOR pivot_column IN ( <column_list> ) )

<column_list> ::=
    column_name [ ,...n ]

<system_time> ::=
{
       AS OF <date_time>
    |  FROM <start_date_time> TO <end_date_time>
    |  BETWEEN <start_date_time> AND <end_date_time>
    |  CONTAINED IN (<start_date_time> , <end_date_time>)
    |  ALL
}

    <date_time>::=
        <date_time_literal> | @date_time_variable

    <start_date_time>::=
        <date_time_literal> | @date_time_variable

    <end_date_time>::=
        <date_time_literal> | @date_time_variable