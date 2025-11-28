// src/lib/localStorageShim.ts
// Guard against environments where globalThis.localStorage exists but lacks the full Storage API
// (e.g., node started with an invalid --localstorage-file flag). We normalize it to a no-op Storage
// to prevent `localStorage.getItem is not a function` crashes while keeping behavior predictable.

function ensureLocalStorageShape() {
    if (typeof globalThis === 'undefined') return;
    const candidate = (globalThis as { localStorage?: unknown }).localStorage;
    if (!candidate) return;

    const maybeStorage = candidate as Partial<Storage>;
    const hasAPI = typeof maybeStorage.getItem === 'function' && typeof maybeStorage.setItem === 'function';
    if (hasAPI) return;

    const memory = new Map<string, string>();
    const safeStorage: Storage = {
        getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
        setItem: (key: string, value: string) => {
            memory.set(key, String(value));
        },
        removeItem: (key: string) => {
            memory.delete(key);
        },
        clear: () => {
            memory.clear();
        },
        key: (index: number) => Array.from(memory.keys())[index] ?? null,
        get length() {
            return memory.size;
        },
    };

    (globalThis as any).localStorage = safeStorage;
}

ensureLocalStorageShape();
