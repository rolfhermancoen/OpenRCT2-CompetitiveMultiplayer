/**
 * Checks whether the target is null or not.
 * @param target value to test
 */
export function isNull(target: unknown): target is null
{
    return (target === null);
}