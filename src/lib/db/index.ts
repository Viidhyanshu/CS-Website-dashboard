import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 60, // Max connection lifetime 1 hour
  socket: {
    keepalive: true,
  }
});

export default sql;
