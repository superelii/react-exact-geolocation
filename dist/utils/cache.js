export const createCache = (cacheDuration) => {
    const cache = new Map();
    return {
        get: key => {
            const cached = cache.get(key);
            if (!cached)
                return null;
            if (Date.now() - cached.timestamp > cacheDuration) {
                cache.delete(key);
                return null;
            }
            return cached.data;
        },
        set: (key, data) => {
            cache.set(key, { data, timestamp: Date.now() });
        },
        clear: () => cache.clear(),
    };
};
export const createPositionCache = (cacheDuration = 5 * 60 * 1000) => {
    return createCache(cacheDuration);
};
