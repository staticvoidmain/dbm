// todo:
//  analyze? THEN
//    rebuild indexes
//    flush the plan cache??
//    clean up internal db

//   suggest:
//    suggest removing unused indexes
//    suggest covering indexes


// todo: suggest partitioning when the table size is larger than some threshold.
// 

import { IManagedDatabase } from '../lib/database'
import { exec } from 'child_process'

//  This task uses the 
enum Platform {
  pg,
  mssql,
  sqlite
}

// maybe some kind of LRU cache?
function load(name: string) {
  // TODO
  // loads a script from the scripts folder.
  // and caches it in memory.
}

export class DatabaseOptimizer {
  private db: IManagedDatabase
  private platform: Platform;
  private version: string // todo: this should be parsed or something.
  private missingIndexes: Array<any>
  
  constructor(db: IManagedDatabase) {
    // todo: not sure where this is gonna come from.
    // but we'll connect to the vendor.
    this.db = db
  }
  
  analyze() {
    
    if (this.platform === Platform.mssql) {
      const missingIndexQuery = load("/mssql/MissingIndexes")
      const fragmentedIndexQuery = load("/mssql/FragmentedIndexes")
      
      // todo: get physical table sizes?
      // actually we could just delegate to DTA
      // todo: wrap, promisify etc.
      exec("dta", (err, stdout, stderr) => {
        // dta doesn't support sql express, feels bad man.
      }) 
      // this.db.query(missingIndexQuery)
      
      
      
      
      
    }
    
    
    
  }
  
  optimize() {
    
    // # MSSQL
    // EXEC sp_purge_jobhistory
    // EXEC sp_maintplan_delete_log
    // EXEC sp_delete_backuphistory
    if (this.platform === Platform.mssql) {
      
    }
  }
}
