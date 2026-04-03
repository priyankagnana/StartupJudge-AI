// src/services/cacheService.js

class CacheService {
  constructor(ttlMs = 3600000) {
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  _makeKey(idea, provider) {
    const normalized = idea.toLowerCase().trim().replace(/\s+/g, ' ');
    return `${provider}:${normalized}`;
  }

  get(idea, provider) {
    const key = this._makeKey(idea, provider);
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(idea, provider, data) {
    const key = this._makeKey(idea, provider);
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

module.exports = new CacheService();
