import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  idle_timeout: 20,
  max_lifetime: 60 * 60,
});

export default sql;
