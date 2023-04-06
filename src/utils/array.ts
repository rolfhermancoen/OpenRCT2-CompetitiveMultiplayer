import {isNull} from "@utils/type";

/**
 * Gets index of the first matching item. Returns -1 if no items match the predicate.
 * @param array The array to check.
 * @param predicate The function to match the items against.
 */
export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number | null
{
    for (let idx = 0, end = array.length; idx < end; idx++)
    {
        if (predicate(array[idx]))
        {
            return idx;
        }
    }
    return null;
}

/**
 * Gets the first matching item. Returns null if no items match the predicate.
 * @param array The array to check.
 * @param predicate The function to match the items against.
 */
export function find<T>(array: T[], predicate: (item: T) => boolean): T | null
{
    const idx = findIndex(array, predicate);
    return (isNull(idx)) ? null : array[idx];
}