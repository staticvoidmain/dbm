
/*
 env: {
      vendor: 'postgres',
      host: 'localhost',
      user: 'sql_pg',
      password: 'abc123',
      name: 'local/ross'
    },


 */

export class Environment {
  name: string
  // dev / test / uat / prod whatever
  tier: string
  host: string
  vendor: string
  creds: any

  // group? not sure what that would do
}