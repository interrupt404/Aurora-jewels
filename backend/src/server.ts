import 'dotenv/config';
import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseManager } from './db/supabase';
import { connectMongoDB, getMongooseConnection } from './db/mongo';
import productRoutes from './routes/v1/product.route';
import { logger } from './utils/logger';
import { Connection as MongooseConnection } from 'mongoose';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: MongooseConnection;
    supabase: any;
  }
}

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const server = fastify({ logger: true });

// =========================
// Global CORS Middleware
// =========================
server.addHook('preHandler', (req, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    reply.send();
  } else {
    done();
  }
});

// =========================
// Root Route
// =========================
server.get('/', async (req, reply) => ({
  message: 'Jewelry E-commerce Backend API Root',
  status: 'Running',
  version: '1.0',
}));

server.get('/health', async () => ({ status: 'ok', time: Date.now() }));

// =========================
// onSend Hook
// =========================
server.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply, payload: any) => {
  try {
    if (typeof payload === 'string' && (reply.statusCode === 200 || reply.statusCode === 201)) {
      // Optional modifications
    }
  } catch (err) {
    console.error('Full error in onSend hook:', err);
    logger.error('Error in onSend hook:', err);
  }
  return payload;
});

// =========================
// Server Startup
// =========================
const start = async () => {
  try {
    // MongoDB
    await connectMongoDB();
    const mongooseConnection = getMongooseConnection();
    server.decorate('mongo', mongooseConnection);

    // Supabase
    await supabaseManager.initialize();
    const supabaseClient = supabaseManager.getClient();
    server.decorate('supabase', supabaseClient);

    // Routes
    await server.register(productRoutes, { prefix: '/api/v1' });

    // Start server
    await server.listen({ port: PORT, host: HOST });
    logger.info(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('Full server startup error:', err);
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
