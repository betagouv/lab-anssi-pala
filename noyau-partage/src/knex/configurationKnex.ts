export default {
  client: 'pg',
  connection: process.env.BASE_DONNEES_URL!,
  pool: {
    min: process.env.BASE_DE_DONNEES_MIN_POOL
      ? parseInt(process.env.BASE_DE_DONNEES_MIN_POOL)
      : 0,
    max: process.env.BASE_DE_DONNEES_MAX_POOL
      ? parseInt(process.env.BASE_DE_DONNEES_MAX_POOL)
      : 10,
  },
  migrations: { tableName: 'knex_migrations' },
};
