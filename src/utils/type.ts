/**
 * Checks whether the target is null or not.
 * @param target value to test
 */
export const isNull = (target: unknown): target is null =>
{
    return (target === null);
};

/**
 * Checks whether the target is a number or not.
 */
export const isNumber = (value: unknown): value is number =>
{
    return (typeof value === "number");
};