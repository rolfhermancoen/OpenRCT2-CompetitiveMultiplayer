/**
 * Merges an object into another object
 * @param {Record<string, unknown>} objectA The first object to merge into the second object
 * @param {Record<string, unknown>} objectB The second object which it is merged into
 */
const combineObject = (objectA: Record<string, unknown>, objectB: Record<string, unknown>): void => {
    for (const key of Object.keys(objectA)) {
        objectB[key] = objectA[key];
    }
};

/**
 * Merges two objects into one
 * @param {Record<string, unknown>} objectA The first object to merge
 * @param {Record<string, unknown>} objectB The second object to merge
 */
export const combine = <T extends Record<string, unknown>>(objectA: Record<string, unknown>, objectB: Record<string, unknown>): T => {
    const combined = {};
    combineObject(objectA, combined);
    combineObject(objectB, combined);
    return combined as T;
};
