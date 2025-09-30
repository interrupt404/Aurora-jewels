import fastify from 'fastify';
import 'dotenv/config';
import { logSupabaseStatus } from './db/supabase';
import { connectMongoDB } from './db/mongo';

const PORT = parseInt(process.env.PORT || '3001', 10);

const server = fastify({
  logger: true
});

// A professional setup requires registering plugins and routes
// We'll add registration functions for Auth/CORS/Routes here later.

server.get('/', async (request, reply) => {
  return { 
    message: 'Jewelry E-commerce Backend API Root', 
    status: 'Running',
    version: '1.0'
  };
});

const start = async () => {
  try {
    // 1. Connect to Databases
    await connectMongoDB();
    logSupabaseStatus();

    // 2. Start Fastify
    await server.listen({ port: PORT, host: '0.0.0.0' });
    server.log.info(`Server listening at http://localhost:${PORT}`);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();