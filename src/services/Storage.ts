import {Logger} from "@services/Logger";

type StorageOptions = {
    name: string;
    type?: "park" | "shared"
};

type StorageValue = string | number | boolean;

type StorageValues = { [key: string]: StorageValue };

/**
 * Class representing storage.
 * @class
 */
export class Storage {
    /**
     * name used for prefixing the keys for the storage
     */
    private readonly name: string;

    /**
     * storage used throughout the class
     */
    private readonly storage: Configuration;

    /**
     * logger used in storage
     */
    private readonly logger: Logger;

    /**
     * Construct a new storage
     *
     * @param {StorageOptions} options - the options provided when instantiating
     */
    public constructor(options: StorageOptions) {
        if (!options.type) {
            options.type = "park";
        }
        this.name = options.name;
        this.logger = new Logger({
            name: `Storage_${this.name}`
        });
        this.storage = options.type === "shared" ? context.sharedStorage : context.getParkStorage();
    }

    /**
     * Gets the name of the storage
     *
     * @return {string} - The name of the storage
     */
    public getStorageName(): string {
        return this.name;
    }

    /**
     * Sets a value in the storage through the use of a key and a value
     *
     * @param {string} key - The key to set the value upon
     * @param {<T>} value - The value to set
     * @return {<T>} - The value that was set
     */
    public setValue<T extends StorageValue>(key: string, value: T): T | undefined {
        if (!Storage.isValue(value)) {
            this.logger.error(`Invalid type of value for key ${key}, actual type: ${typeof value}, with value: ${value}`);
            return undefined;
        }

        this.logger.debug(`set ${key} with value: ${value}`);
        this.storage.set(this.parseKey(key), value);

        return value;
    }

    /**
     * Retrieves a value from the storage through the use of a key
     *
     * @param {string} key - The key containing the value
     * @param {<T> | undefined} defaultValue - optional default value
     * @return {<T> | undefined} - the value or undefined if nothing is found
     */
    public getValue<T extends StorageValue>(key: string, defaultValue?: T): T | undefined {
        const value = defaultValue ? this.storage.get<T>(this.parseKey(key), defaultValue) : this.storage.get<T>(this.parseKey(key));

        if (value !== undefined && !Storage.isValue(value)) {
            this.logger.error(`Invalid type of value for key ${key}, actual type: ${typeof value}, with value: ${value}`);
            return undefined;
        }

        this.logger.debug(`get ${key}, ${defaultValue ? `with defaultValue: ${defaultValue},` : ''} results: ${value}`);
        return value;
    }

    /**
     * Gets all the values in the storage with a prefix filter
     *
     * @param {string} prefix - the prefix to filter upon
     * @return {StorageValues} - values in the storage with prefix filter
     */
    public getValues(prefix: string): StorageValues {
        const values = this.storage.getAll(this.parseKey(prefix));

        if (Object.keys(values).length === 0) {
            this.logger.warning(`No values found with prefix: ${prefix}`);
        }

        this.logger.debug(`getValues, with prefix: ${prefix}, results: ${values}`);
        return values;
    }

    /**
     * Gets all the values in the storage
     *
     * @return {StorageValues} - all values in the storage
     */
    public getAllValues(): StorageValues {
        const values = this.storage.getAll();
        this.logger.debug(`getAllValues, results: ${values}`);
        return values;
    }

    /**
     * Sets a value to undefined in the storage through the use of a key
     *
     * @param {string} key - The key to set the value upon
     * @return {boolean} - if the value was deleted or not
     */
    public deleteValue(key: string): boolean {
        if (this.isValueSet(key)) {
            this.logger.debug(`delete ${key}`);
            this.storage.set(this.parseKey(key), undefined);
            return true;
        } else {
            this.logger.debug(`${key} not found, no value deleted`);
            return false;
        }
    }

    /**
     * Checks if a value is set in the storage
     *
     * @param {string} key - The key to check for the value
     * @return {boolean} - if the value was set or not
     */
    public isValueSet(key: string): boolean {
        const hasValue = this.storage.has(this.parseKey(key));
        this.logger.debug(`has ${key}, results ${hasValue}`);
        return hasValue;
    }

    /**
     * Gets a value from a collection
     *
     * @param {string} collection - The collection to get the value from
     * @param {string} key - The key to get the value from
     * @return {<T> | undefined} - the value or undefined if nothing was found
     */
    public getValueFromCollection<T extends StorageValue>(collection: string, key: string): T | undefined {
        return this.getValue<T>(this.parseCollectionKey(collection, key));
    }

    /**
     * Gets all values from a collection
     *
     * @param {string} collection - The collection to get the values from
     * @return {StorageValues} - the values found in the collection
     */
    public getAllValuesFromCollection(collection: string): StorageValues {
        return this.getValues(collection);
    }

    /**
     * Sets a value in a collection in the storage
     *
     * @param {string} collection - The key to check for the value
     * @param {string} value - The key to check for the value
     * @return {StorageValue} - the value that was set
     */
    public setValueInCollection(collection: string, value: StorageValues): StorageValue | undefined {
        if (Object.keys(value).length !== 1) {
            this.logger.error("setValueInCollection called with more than 1 key in value");
            return undefined;
        }

        return this.setValue(this.parseCollectionKey(collection, Object.keys(value)[0]), value[Object.keys(value)[0]]);
    }

    /**
     * Sets multiple values in a collection in the storage
     *
     * @param {string} collection - The key to check for the value
     * @param {string} values - Multiple values to set in the collection
     * @return {StorageValues} - the values that were set
     */
    public setValuesInCollection(collection: string, values: StorageValues): StorageValues {
        for (const key in values) {
            this.setValueInCollection(collection, {[key]: values[key]});
        }
        return values;
    }

    /**
     * Parses a key string to add a prefix to the key
     *
     * @param {string} key - The key to assert the storage upon
     * @param {string | undefined} prefix - an optional prefix
     * @return {string}
     */
    public parseKey(key: string, prefix: string = this.name): string {
        return `${prefix}_${key}`;
    }

    /**
     * Parses a key string to add a prefix to the key for a collection
     *
     * @param {string} collection - The collection key
     * @param {string} key - The key to assert the storage upon
     * @return {string}
     */
    public parseCollectionKey(collection: string, key: string): string {
        return `${collection}_${key}`;
    }

    /**
     * Checks if a value is of a valid type
     *
     * @param {unknown} value - The value to check
     * @return {boolean}
     */
    static isValue(value: unknown): value is string | number | boolean {
        return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    }

}

