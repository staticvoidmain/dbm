# dbm

A DBA is just a programmer who only knows one language.
-Ross

Use tools to:
* Analyze
* Backup
* Optimize
* Review
* Migrate


# examples

``` shell
$ dbm migrate project.json dev-environment

$ dbm dump database dev customer-service

$ dbm --help

$ dbm --interactive


```

# Installation

By default, no sql drivers will be installed. You should determine which platforms you will be targeting and install those.

```
npm install mssql

npm install pg

npm install sqlite3
```

# Migrations

I'm actually NOT super sold on yaml as a format,
but I think this looks enough like t-sql that DBAs might
not whine about it.

```yaml
---
name: my-first-migration
no_sort: true
dbs:
- captive: reporting.Captive
- vendor: originations.Vendor

steps:
- drop.table: foo.bar
  on: captive

- create.table: My.Table
  script: tables/my.table.sql
  on: captive

- create.table: Another.Table
  from: tables/maybe.from.schema.json
  on: captive

- create.view: My.View 
  from: views/my_view.sql
  on: captive

- create.proc: My.Proc
  from: procs/my_proc.sql
  on: vendor

```