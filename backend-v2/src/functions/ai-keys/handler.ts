import express from 'express';
import serverless from 'serverless-http';
import cookieParser from 'cookie-parser';
import { z } from 'zod';
import { corsMiddleware } from '../../shared/middleware/cors.js';
import { authenticateToken } from '../../shared/middleware/auth.js';
import { sendError, sendSuccess, sendValidationError } from '../../shared/utils/response.js';
import { createFunctionLogger } from '../../shared/utils/logger.js';
import { AiKeyService } from '../../services/ai/aiKeyService.js';
import { OpenRouterService } from '../../services/ai/openRouterService.js';

const app = express();
const logger = createFunctionLogger('ai-keys-service');

const keyBodySchema = z.object({
  apiKey: z.string().min(8),
});

const optionalKeyBodySchema = z.object({
  apiKey: z.string().min(8).optional(),
});

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.options('*', corsMiddleware);

app.get('/', authenticateToken, async (req, res) => {
  try {
    const keys = await AiKeyService.listKeys(req.user!.id);
    sendSuccess(res, { keys });
  } catch (error) {
    logger.error({ userId: req.user?.id, error }, 'Failed to list AI keys');
    sendError(res, 'Failed to list AI keys', 500);
  }
});

app.get('/models', authenticateToken, async (_req, res) => {
  try {
    const models = await OpenRouterService.listModels();
    sendSuccess(res, { models, defaultModel: OpenRouterService.defaultModel() });
  } catch (error) {
    logger.error({ error }, 'Failed to list OpenRouter models');
    sendError(res, 'Failed to list OpenRouter models', 500);
  }
});

app.put('/:provider', authenticateToken, async (req, res) => {
  const { provider } = req.params;
  const validation = keyBodySchema.safeParse(req.body);

  if (!validation.success) {
    sendValidationError(res, validation.error.flatten().fieldErrors);
    return;
  }

  try {
    const key = await AiKeyService.saveKey(req.user!.id, provider, validation.data.apiKey);
    logger.info({ userId: req.user?.id, provider: key.provider }, 'AI key saved');
    sendSuccess(res, { key }, 'AI key saved');
  } catch (error) {
    logger.warn({ userId: req.user?.id, provider, error }, 'Failed to save AI key');
    sendError(res, error instanceof Error ? error.message : 'Failed to save AI key', 400);
  }
});

app.post('/:provider/test', authenticateToken, async (req, res) => {
  const { provider } = req.params;
  const validation = optionalKeyBodySchema.safeParse(req.body ?? {});

  if (!validation.success) {
    sendValidationError(res, validation.error.flatten().fieldErrors);
    return;
  }

  try {
    await AiKeyService.testKey(req.user!.id, provider, validation.data.apiKey);
    sendSuccess(res, { valid: true });
  } catch (error) {
    logger.warn({ userId: req.user?.id, provider, error }, 'AI key test failed');
    sendError(res, error instanceof Error ? error.message : 'AI key test failed', 400);
  }
});

app.delete('/:provider', authenticateToken, async (req, res) => {
  const { provider } = req.params;

  try {
    AiKeyService.normalizeProvider(provider);
    await AiKeyService.deleteKey(req.user!.id, provider);
    logger.info({ userId: req.user?.id, provider }, 'AI key deleted');
    sendSuccess(res, { deleted: true });
  } catch (error) {
    logger.warn({ userId: req.user?.id, provider, error }, 'AI key delete failed');
    sendError(res, error instanceof Error ? error.message : 'AI key delete failed', 400);
  }
});

app.use((err: any, _req: express.Request, res: express.Response) => {
  logger.error('Unhandled error in AI keys service', { error: err.message, stack: err.stack });
  sendError(res, 'Internal server error', 500);
});

app.use('*', (_req, res) => {
  sendError(res, 'Route not found', 404);
});

export const handler = serverless(app, {
  basePath: '/ai-keys',
});
