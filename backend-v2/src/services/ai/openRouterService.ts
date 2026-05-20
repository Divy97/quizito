import { cleanJson } from '../../shared/utils/jsonUtils.js';

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface OpenRouterModel {
  id: string;
  name: string;
  contextLength?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openrouter/free';

const getHeaders = (apiKey?: string, requireKey = true) => {
  const resolvedKey = apiKey ?? process.env.OPENROUTER_API_KEY;
  if (requireKey && !resolvedKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  return {
    ...(resolvedKey ? { Authorization: `Bearer ${resolvedKey}` } : {}),
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://quizito.vercel.app',
    'X-OpenRouter-Title': 'Quizito',
  };
};

export class OpenRouterService {
  static defaultModel(): string {
    return process.env.OPENROUTER_DEFAULT_MODEL ?? DEFAULT_MODEL;
  }

  static async listModels(apiKey?: string): Promise<OpenRouterModel[]> {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models?output_modalities=text`, {
      headers: getHeaders(apiKey, false),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OpenRouter models');
    }

    const body = await response.json() as { data?: any[] };
    return (body.data ?? [])
      .filter((model) => model.id && model.name)
      .map((model) => ({
        id: model.id,
        name: model.name,
        contextLength: model.context_length,
        pricing: model.pricing,
      }));
  }

  static async testKey(apiKey: string): Promise<void> {
    await this.listModels(apiKey);
  }

  static async chatJson<T>(args: {
    apiKey: string;
    model?: string;
    messages: OpenRouterMessage[];
    temperature: number;
    userId?: string;
  }): Promise<T> {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(args.apiKey),
      body: JSON.stringify({
        model: args.model ?? this.defaultModel(),
        messages: args.messages,
        temperature: args.temperature,
        response_format: { type: 'json_object' },
        user: args.userId,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter request failed: ${response.status} ${body.slice(0, 200)}`);
    }

    const body = await response.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenRouter returned an empty response');
    }

    return JSON.parse(cleanJson(content)) as T;
  }
}
