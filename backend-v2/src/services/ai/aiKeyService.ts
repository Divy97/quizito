import AWS from 'aws-sdk';
import crypto from 'crypto';
import pool from '../../shared/config/database.js';
import { OpenRouterService } from './openRouterService.js';

export type AiProvider = 'openrouter';

export interface AiKeyMetadata {
  provider: AiProvider;
  status: 'active' | 'invalid' | 'deleted';
  keyFingerprint: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiCredentials {
  openRouterApiKey: string;
  userKeyProviders: AiProvider[];
}

const kms = new AWS.KMS();
const ALGORITHM = 'aes-256-gcm';
const PROVIDERS: AiProvider[] = ['openrouter'];

const normalizeProvider = (provider: string): AiProvider => {
  if (!PROVIDERS.includes(provider as AiProvider)) {
    throw new Error('Unsupported AI provider');
  }

  return provider as AiProvider;
};

const getKmsKeyId = (): string => {
  const keyId = process.env.BYOK_KMS_KEY_ID;
  if (!keyId) {
    throw new Error('BYOK_KMS_KEY_ID is not configured');
  }

  return keyId;
};

const fingerprintSecret = (secret: string): string => {
  return crypto.createHash('sha256').update(secret).digest('hex').slice(0, 16);
};

const encryptSecret = async (secret: string) => {
  const dataKey = await kms.generateDataKey({
    KeyId: getKmsKeyId(),
    KeySpec: 'AES_256',
  }).promise();

  if (!dataKey.Plaintext || !dataKey.CiphertextBlob) {
    throw new Error('KMS did not return a usable data key');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, dataKey.Plaintext as Buffer, iv);
  const encryptedSecret = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedSecret,
    encryptedDataKey: dataKey.CiphertextBlob as Buffer,
    iv,
    authTag,
    keyFingerprint: fingerprintSecret(secret),
  };
};

const decryptSecret = async (row: {
  encrypted_secret: Buffer;
  encrypted_data_key: Buffer;
  secret_iv: Buffer;
  secret_auth_tag: Buffer;
}): Promise<string> => {
  const dataKey = await kms.decrypt({
    CiphertextBlob: row.encrypted_data_key,
  }).promise();

  if (!dataKey.Plaintext) {
    throw new Error('KMS did not decrypt data key');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, dataKey.Plaintext as Buffer, row.secret_iv);
  decipher.setAuthTag(row.secret_auth_tag);

  return Buffer.concat([
    decipher.update(row.encrypted_secret),
    decipher.final(),
  ]).toString('utf8');
};

const toMetadata = (row: any): AiKeyMetadata => ({
  provider: row.provider,
  status: row.status,
  keyFingerprint: row.key_fingerprint,
  lastUsedAt: row.last_used_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class AiKeyService {
  static normalizeProvider(provider: string): AiProvider {
    return normalizeProvider(provider);
  }

  static async listKeys(userId: string): Promise<AiKeyMetadata[]> {
    const result = await pool.query(
      `SELECT provider, status, key_fingerprint, last_used_at, created_at, updated_at
       FROM user_ai_provider_keys
       WHERE user_id = $1 AND status <> 'deleted'
       ORDER BY provider`,
      [userId]
    );

    return result.rows.map(toMetadata);
  }

  static async saveKey(userId: string, providerInput: string, secret: string): Promise<AiKeyMetadata> {
    const provider = normalizeProvider(providerInput);
    await this.validateKey(provider, secret);
    const encrypted = await encryptSecret(secret);

    const result = await pool.query(
      `INSERT INTO user_ai_provider_keys (
         user_id, provider, status, encrypted_secret, encrypted_data_key,
         secret_iv, secret_auth_tag, key_fingerprint
       )
       VALUES ($1, $2, 'active', $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, provider)
       DO UPDATE SET
         status = 'active',
         encrypted_secret = EXCLUDED.encrypted_secret,
         encrypted_data_key = EXCLUDED.encrypted_data_key,
         secret_iv = EXCLUDED.secret_iv,
         secret_auth_tag = EXCLUDED.secret_auth_tag,
         key_fingerprint = EXCLUDED.key_fingerprint,
         last_used_at = NULL
       RETURNING provider, status, key_fingerprint, last_used_at, created_at, updated_at`,
      [
        userId,
        provider,
        encrypted.encryptedSecret,
        encrypted.encryptedDataKey,
        encrypted.iv,
        encrypted.authTag,
        encrypted.keyFingerprint,
      ]
    );

    return toMetadata(result.rows[0]);
  }

  static async testKey(userId: string, providerInput: string, secret?: string): Promise<void> {
    const provider = normalizeProvider(providerInput);
    const key = secret ?? await this.getSavedSecret(userId, provider);
    await this.validateKey(provider, key);
  }

  static async deleteKey(userId: string, providerInput: string): Promise<void> {
    const provider = normalizeProvider(providerInput);
    await pool.query(
      `UPDATE user_ai_provider_keys
       SET status = 'deleted'
       WHERE user_id = $1 AND provider = $2`,
      [userId, provider]
    );
  }

  static async resolveCredentials(userId: string): Promise<AiCredentials> {
    const userKeys = await this.getActiveSecrets(userId);
    const openRouterApiKey = userKeys.openrouter ?? process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    return {
      openRouterApiKey,
      userKeyProviders: Object.keys(userKeys) as AiProvider[],
    };
  }

  static async markKeysUsed(userId: string, providers: AiProvider[]): Promise<void> {
    if (providers.length === 0) {
      return;
    }

    await pool.query(
      `UPDATE user_ai_provider_keys
       SET last_used_at = NOW()
       WHERE user_id = $1 AND provider = ANY($2::text[]) AND status = 'active'`,
      [userId, providers]
    );
  }

  private static async getSavedSecret(userId: string, provider: AiProvider): Promise<string> {
    const result = await pool.query(
      `SELECT encrypted_secret, encrypted_data_key, secret_iv, secret_auth_tag
       FROM user_ai_provider_keys
       WHERE user_id = $1 AND provider = $2 AND status = 'active'`,
      [userId, provider]
    );

    if (result.rows.length === 0) {
      throw new Error('No active key saved for provider');
    }

    return decryptSecret(result.rows[0]);
  }

  private static async getActiveSecrets(userId: string): Promise<Partial<Record<AiProvider, string>>> {
    const result = await pool.query(
      `SELECT provider, encrypted_secret, encrypted_data_key, secret_iv, secret_auth_tag
       FROM user_ai_provider_keys
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const secrets: Partial<Record<AiProvider, string>> = {};
    for (const row of result.rows) {
      secrets[row.provider as AiProvider] = await decryptSecret(row);
    }

    return secrets;
  }

  private static async validateKey(provider: AiProvider, secret: string): Promise<void> {
    normalizeProvider(provider);
    await OpenRouterService.testKey(secret);
  }
}
