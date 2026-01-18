const STORAGE_PREFIX = 'study_data_';

const safeParse = (value, fallback) => {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const normalizeState = (state) => {
    if (!state || typeof state !== 'object' || Array.isArray(state)) return {};
    return state;
};

const getAllStorageKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            keys.push(key);
        }
    }
    return keys;
};

const loadState = () => {
    const state = {};
    getAllStorageKeys().forEach((key) => {
        const parsed = safeParse(localStorage.getItem(key), null);
        if (parsed) {
            state[key] = parsed;
        }
    });
    return state;
};

const loadItem = (key, fallback = null) => {
    if (!key || !key.startsWith(STORAGE_PREFIX)) {
        return fallback;
    }
    return safeParse(localStorage.getItem(key), fallback);
};

const saveItem = (key, value) => {
    if (!key || !key.startsWith(STORAGE_PREFIX)) {
        return;
    }
    localStorage.setItem(key, JSON.stringify(value));
};

const saveState = (state) => {
    const normalized = normalizeState(state);
    getAllStorageKeys().forEach((key) => localStorage.removeItem(key));
    Object.entries(normalized).forEach(([key, value]) => {
        if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    });
};

const exportStateToJSON = () => JSON.stringify(loadState(), null, 2);

const importStateFromJSON = (jsonString, mode = 'merge') => {
    const parsed = safeParse(jsonString, null);
    const incoming = normalizeState(parsed);
    if (!Object.keys(incoming).length && mode !== 'replace') {
        return;
    }

    if (mode === 'replace') {
        saveState(incoming);
        return;
    }

    const current = loadState();
    const merged = {
        ...current,
        ...incoming,
    };
    saveState(merged);
};

window.storageService = {
    loadState,
    loadItem,
    saveState,
    saveItem,
    exportStateToJSON,
    importStateFromJSON,
};
