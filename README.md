# Totally unfinished, just a side project.




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

## The parser is not batteries included

I didn't want to mess with subtrees for now, since it's eventually going to be
an NPM module, I just don't want to pollute NPM with the module until it's in a
usable state.

mklink 

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
