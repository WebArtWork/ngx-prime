export let lastId = 0;

export function UniqueComponentId(prefix = 'pn_id_') {
    lastId++;

    return `${prefix}${lastId}`;
}

/**
 * Resets the shared id counter. Needed when rendering multiple independent
 * pages within the same process (e.g. static site generation), since the
 * counter is otherwise module-scoped and persists across renders.
 */
export function resetUniqueComponentId() {
    lastId = 0;
}
