// src/utils/response.ts
import { FastifyReply } from 'fastify';

const API_VERSION = '1.0.0';

/**
 * Sends a standardized success response.
 * @param reply - The Fastify reply object.
 * @param data - The payload to be sent in the response.
 * @param statusCode - The HTTP status code (default is 200).
 */
export function sendSuccess(reply: FastifyReply, data: any, statusCode: number = 200) {
  return reply.status(statusCode).send({
    status: 'success',
    api_version: API_VERSION,
    data: data,
  });
}

/**
 * Sends a standardized error response.
 * @param reply - The Fastify reply object.
 * @param message - A descriptive error message.
 * @param statusCode - The HTTP status code (default is 500).
 * @param details - Optional additional error details.
 */
export function sendError(reply: FastifyReply, message: string, statusCode: number = 500, details?: any) {
  return reply.status(statusCode).send({
    status: 'fail',
    api_version: API_VERSION,
    error: {
      message: message,
      ...(details && { details: details }), // Conditionally add details if they exist
    },
  });
}