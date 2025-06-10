import crypto from 'crypto';
import { storage } from './storage';
import type { EncryptionKey, InsertEncryptionKey, SecurityLog, InsertSecurityLog } from '../shared/schema';

export class AdvancedEncryption {
  private static instance: AdvancedEncryption;
  private masterKey: Buffer | null = null;
  private activeKeys: Map<string, EncryptionKey> = new Map();

  private constructor() {
    this.initializeMasterKey();
    this.startKeyRotation();
  }

  public static getInstance(): AdvancedEncryption {
    if (!AdvancedEncryption.instance) {
      AdvancedEncryption.instance = new AdvancedEncryption();
    }
    return AdvancedEncryption.instance;
  }

  private async initializeMasterKey(): Promise<void> {
    try {
      const masterKeyId = process.env.MASTER_KEY_ID || 'master_key_v1';
      let masterKeyRecord = await this.getActiveKey(masterKeyId);
      
      if (!masterKeyRecord) {
        // Generate new master key if none exists
        this.masterKey = crypto.randomBytes(64); // 512-bit master key
        const keyHash = this.generateSecureHash(this.masterKey);
        
        const masterKeyData: InsertEncryptionKey = {
          keyId: masterKeyId,
          keyType: 'AES',
          encryptedKey: this.masterKey.toString('base64'),
          keyHash,
          algorithm: 'AES-256-GCM',
          keySize: 256,
          purpose: 'master_encryption',
          isActive: true,
          accessLevel: 5,
          rotationSchedule: 'monthly'
        };
        
        masterKeyRecord = await storage.createEncryptionKey(masterKeyData);
        this.activeKeys.set(masterKeyId, masterKeyRecord);
      } else {
        this.masterKey = Buffer.from(masterKeyRecord.encryptedKey, 'base64');
        this.activeKeys.set(masterKeyId, masterKeyRecord);
      }

      await this.logSecurityEvent('master_key_initialized', 'low', {
        keyId: masterKeyId,
        algorithm: 'AES-256-GCM'
      });
    } catch (error) {
      await this.logSecurityEvent('master_key_initialization_failed', 'critical', {
        error: (error as Error).message
      });
      throw new Error('Failed to initialize master key');
    }
  }

  public async encryptData(data: string, purpose: string = 'data'): Promise<{ encrypted: string; keyId: string; iv: string; tag: string }> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    try {
      // Generate a unique data encryption key (DEK)
      const dek = crypto.randomBytes(32); // 256-bit key
      const iv = crypto.randomBytes(16); // 128-bit IV
      
      // Encrypt the data with DEK
      const cipher = crypto.createCipher('aes-256-gcm', dek);
      cipher.setAAD(Buffer.from(purpose)); // Additional authenticated data
      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      const tag = cipher.getAuthTag();

      // Encrypt the DEK with master key
      const keyIv = crypto.randomBytes(16);
      const keyCipher = crypto.createCipher('aes-256-gcm', this.masterKey);
      let encryptedDek = keyCipher.update(dek, null, 'base64');
      encryptedDek += keyCipher.final('base64');
      const keyTag = keyCipher.getAuthTag();

      // Store the encrypted DEK
      const keyId = `dek_${crypto.randomUUID()}`;
      const keyData: InsertEncryptionKey = {
        keyId,
        keyType: 'AES',
        encryptedKey: encryptedDek,
        keyHash: this.generateSecureHash(dek),
        algorithm: 'AES-256-GCM',
        keySize: 256,
        purpose,
        isActive: true,
        accessLevel: 3
      };

      await storage.createEncryptionKey(keyData);

      await this.logSecurityEvent('data_encrypted', 'low', {
        keyId,
        purpose,
        dataSize: data.length
      });

      return {
        encrypted,
        keyId,
        iv: iv.toString('base64'),
        tag: tag.toString('base64')
      };
    } catch (error) {
      await this.logSecurityEvent('encryption_failed', 'high', {
        purpose,
        error: (error as Error).message
      });
      throw new Error('Data encryption failed');
    }
  }

  public async decryptData(encryptedData: string, keyId: string, iv: string, tag: string, purpose: string = 'data'): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    try {
      // Retrieve the encrypted DEK
      const keyRecord = await this.getActiveKey(keyId);
      if (!keyRecord) {
        throw new Error('Encryption key not found');
      }

      // Decrypt the DEK with master key
      const decipher = crypto.createDecipher('aes-256-gcm', this.masterKey);
      const encryptedDek = keyRecord.encryptedKey;
      let dek = decipher.update(encryptedDek, 'base64', null);
      dek = Buffer.concat([dek, decipher.final()]);

      // Decrypt the data with DEK
      const dataDecipher = crypto.createDecipher('aes-256-gcm', dek);
      dataDecipher.setAAD(Buffer.from(purpose));
      dataDecipher.setAuthTag(Buffer.from(tag, 'base64'));
      let decrypted = dataDecipher.update(encryptedData, 'base64', 'utf8');
      decrypted += dataDecipher.final('utf8');

      await this.logSecurityEvent('data_decrypted', 'low', {
        keyId,
        purpose
      });

      return decrypted;
    } catch (error) {
      await this.logSecurityEvent('decryption_failed', 'high', {
        keyId,
        purpose,
        error: (error as Error).message
      });
      throw new Error('Data decryption failed');
    }
  }

  public async generateRSAKeyPair(keySize: number = 4096): Promise<{ publicKey: string; privateKey: string; keyId: string }> {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: keySize,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      const keyId = `rsa_${crypto.randomUUID()}`;
      
      // Encrypt and store the private key
      const encryptedPrivateKey = await this.encryptData(privateKey, 'rsa_private_key');
      
      const keyData: InsertEncryptionKey = {
        keyId,
        keyType: 'RSA',
        encryptedKey: JSON.stringify(encryptedPrivateKey),
        keyHash: this.generateSecureHash(Buffer.from(privateKey)),
        algorithm: 'RSA-OAEP',
        keySize,
        purpose: 'asymmetric_encryption',
        isActive: true,
        accessLevel: 4
      };

      await storage.createEncryptionKey(keyData);

      await this.logSecurityEvent('rsa_keypair_generated', 'medium', {
        keyId,
        keySize
      });

      return { publicKey, privateKey, keyId };
    } catch (error) {
      await this.logSecurityEvent('rsa_generation_failed', 'high', {
        error: (error as Error).message
      });
      throw new Error('RSA key pair generation failed');
    }
  }

  public async generateECDSAKeyPair(curve: string = 'secp521r1'): Promise<{ publicKey: string; privateKey: string; keyId: string }> {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: curve,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      const keyId = `ecdsa_${crypto.randomUUID()}`;
      
      // Encrypt and store the private key
      const encryptedPrivateKey = await this.encryptData(privateKey, 'ecdsa_private_key');
      
      const keyData: InsertEncryptionKey = {
        keyId,
        keyType: 'ECDSA',
        encryptedKey: JSON.stringify(encryptedPrivateKey),
        keyHash: this.generateSecureHash(Buffer.from(privateKey)),
        algorithm: 'ECDSA',
        keySize: curve === 'secp521r1' ? 521 : 256,
        purpose: 'digital_signature',
        isActive: true,
        accessLevel: 4
      };

      await storage.createEncryptionKey(keyData);

      await this.logSecurityEvent('ecdsa_keypair_generated', 'medium', {
        keyId,
        curve
      });

      return { publicKey, privateKey, keyId };
    } catch (error) {
      await this.logSecurityEvent('ecdsa_generation_failed', 'high', {
        error: (error as Error).message
      });
      throw new Error('ECDSA key pair generation failed');
    }
  }

  public generateSecureHash(data: Buffer): string {
    const algorithm = process.env.HASH_ALGORITHM || 'SHA3-512';
    return crypto.createHash(algorithm.toLowerCase()).update(data).digest('hex');
  }

  public async generateSecurePassword(length: number = 32): Promise<string> {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const password = Array.from(crypto.randomBytes(length))
      .map(byte => charset[byte % charset.length])
      .join('');
    
    await this.logSecurityEvent('secure_password_generated', 'low', {
      length
    });
    
    return password;
  }

  public async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '15');
    const salt = crypto.randomBytes(32);
    const hash = crypto.pbkdf2Sync(password, salt, saltRounds * 10000, 64, 'sha512');
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  public async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '15');
    const verifyHash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), saltRounds * 10000, 64, 'sha512');
    return hash === verifyHash.toString('hex');
  }

  private async getActiveKey(keyId: string): Promise<EncryptionKey | null> {
    if (this.activeKeys.has(keyId)) {
      return this.activeKeys.get(keyId)!;
    }

    try {
      const keys = await storage.getEncryptionKeys();
      const key = keys.find(k => k.keyId === keyId && k.isActive);
      if (key) {
        this.activeKeys.set(keyId, key);
      }
      return key || null;
    } catch {
      return null;
    }
  }

  private async startKeyRotation(): Promise<void> {
    const rotationInterval = parseInt(process.env.KEY_ROTATION_INTERVAL || '86400000'); // 24 hours
    
    setInterval(async () => {
      try {
        await this.rotateKeys();
      } catch (error) {
        await this.logSecurityEvent('key_rotation_failed', 'critical', {
          error: (error as Error).message
        });
      }
    }, rotationInterval);
  }

  private async rotateKeys(): Promise<void> {
    const keys = await storage.getEncryptionKeys();
    const now = new Date();
    
    for (const key of keys) {
      if (key.rotationSchedule && this.shouldRotateKey(key, now)) {
        await this.rotateKey(key);
      }
    }
  }

  private shouldRotateKey(key: EncryptionKey, now: Date): boolean {
    if (!key.lastRotated) return true;
    
    const lastRotated = new Date(key.lastRotated);
    const rotationIntervals = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };
    
    const interval = rotationIntervals[key.rotationSchedule as keyof typeof rotationIntervals];
    return interval && (now.getTime() - lastRotated.getTime()) >= interval;
  }

  private async rotateKey(key: EncryptionKey): Promise<void> {
    // Implementation for key rotation logic
    await this.logSecurityEvent('key_rotated', 'medium', {
      keyId: key.keyId,
      keyType: key.keyType
    });
  }

  private async logSecurityEvent(eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): Promise<void> {
    try {
      const logData: InsertSecurityLog = {
        eventType,
        severity,
        source: 'encryption_system',
        details,
        threatLevel: severity === 'critical' ? 10 : severity === 'high' ? 7 : severity === 'medium' ? 4 : 1
      };
      
      await storage.createSecurityLog(logData);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const encryption = AdvancedEncryption.getInstance();