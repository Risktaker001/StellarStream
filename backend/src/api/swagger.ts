import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nebula Warp Indexer API',
      version: '2.0.0',
      description:
        'REST API for querying indexed Stellar payment stream data from the Nebula Warp Indexer.',
      contact: {
        name: 'StellarStream',
      },
    },
    servers: [
      {
        url: '/api/v2',
        description: 'V2 API',
      },
    ],
    components: {
      schemas: {
        Stream: {
          type: 'object',
          properties: {
            stream_id: { type: 'string', example: 'stream-abc123' },
            tx_hash_created: {
              type: 'string',
              example: 'a1b2c3d4e5f6...',
            },
            sender: {
              type: 'string',
              example: 'GABC...XYZ',
              description: 'Stellar account address of the sender',
            },
            receiver: {
              type: 'string',
              example: 'GDEF...UVW',
              description: 'Stellar account address of the receiver',
            },
            original_total_amount: {
              type: 'string',
              example: '1000000000',
              description: 'Total stream amount in stroops (string to preserve precision)',
            },
            streamed_amount: {
              type: 'string',
              example: '500000000',
              description: 'Amount streamed so far in stroops',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'CANCELED', 'COMPLETED', 'PAUSED'],
              example: 'ACTIVE',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
            closed_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: null,
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T12:00:00.000Z',
            },
            last_ledger: {
              type: 'integer',
              example: 48500000,
              description: 'Last Stellar ledger number where this stream was updated',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            message: { type: 'string', example: 'StellarStream Backend is running' },
          },
        },
        IndexerStatus: {
          type: 'object',
          properties: {
            isRunning: { type: 'boolean', example: true },
            lastProcessedLedger: { type: 'integer', example: 48500000 },
            errorCount: { type: 'integer', example: 0 },
            lastError: { type: 'string', nullable: true, example: null },
          },
        },
        PaginatedStreams: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Stream' },
            },
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Stream not found' },
            code: { type: 'integer', example: 404 },
          },
        },
      },
    },
  },
  apis: ['./src/api/v2.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
