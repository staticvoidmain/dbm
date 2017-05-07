# just made this repo public, it's currently unfinished.

# dbm

Now anyone can be a DBA!

Use tools to:
* Analyze
* Backup
* Optimize
* Review
* Migrate


# examples

``` shell
$ dbm migrate v2.1-important-release.yml dev

$ dbm dump dev/postgres/ross --all

$ dbm compare -db1 dev/postgres/ross -db2 test/postgres/ross

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

# TypeScript

Yeah, so, local hacking is going to require typescript, because I love me some types boys.

ts-node maybe? I'm not sure.

# Migrations

The yaml has grown on me. I also support JSON though, in case you don't like it.

```yaml
---
name: my-first-migration
aliases:
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

# MS SQL

So, for my local development, I was using Microsoft's LocalDB.

```
SqlLocalDB.exe create marketing-dev
SqlLocalDB.exe start marketing-dev
SqlLocalDB.exe info marketing-dev

sqlcmd -S (localdb)\marketing-dev -Q "create logon ross with password='abc123'; create user ross; go;"

```

This is just here as a reminder so I don't forget. Lul.
