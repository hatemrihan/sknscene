// High-performance in-memory cache system
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class PerformanceCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private readonly maxSize = 1000; // Prevent memory leaks

    set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5min default
        // Clean old entries if cache is getting large
        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        // Check expiration
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    private cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));

        // If still too large, remove oldest entries
        if (this.cache.size >= this.maxSize) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)); // Remove 20%
            toRemove.forEach(([key]) => this.cache.delete(key));
        }
    }

    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const entry of this.cache.values()) {
            if (now - entry.timestamp <= entry.ttl) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            total: this.cache.size,
            valid: validEntries,
            expired: expiredEntries,
            memoryUsage: `${Math.round(JSON.stringify([...this.cache.entries()]).length / 1024)}KB`
        };
    }
}

// Global cache instances
export const productCache = new PerformanceCache();
export const apiCache = new PerformanceCache();

// Cache invalidation helpers
export const invalidateProductCache = (productId?: string) => {
    if (productId) {
        productCache.delete(`product:${productId}`);
        productCache.delete(`product:detail:${productId}`);
    }

    // Invalidate related caches
    apiCache.delete('products:all');
    apiCache.delete('products:featured');
    apiCache.delete('products:admin');

    console.log('🗑️ Product cache invalidated');
};

export const invalidateAllCaches = () => {
    productCache.clear();
    apiCache.clear();
    console.log('🗑️ All caches cleared');
};



