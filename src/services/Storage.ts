import {Logger} from "@services/Logger";

type StorageType = "park" | "shared";

type StorageOptions<T> = {
    name: string;
    type?: StorageType;
    initialData?: Collection<T>;
};

type Value<T> = T;
type ValueObject<T> = { [key: string]: T };
type CollectionValue<T> = { key: string, value: Value<T> };
type Collection<T> = Array<CollectionValue<T>>;

/**
 * Class representing storage.
 */
export class Storage<T> {
    /**
     * name used for prefixing the keys for the storage
     */
    private readonly name: string;

    /**
     * name used for prefixing the keys for the storage
     */
    private readonly storageType: StorageType;

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
    public constructor(options: StorageOptions<T>) {
        if (!options.type) {
            options.type = "park";
        }
        this.storageType = options.type;


        this.name = options.name;
        this.logger = new Logger({
            name: `Storage_${this.name}`
        });


        this.storage = this.storageType === "shared" ? context.sharedStorage : context.getParkStorage();
        if (options.initialData && options.initialData.length !== 0) {
            this.setInitialData(options.initialData);
        }

    }

    /**
     * Gets the name of the storage
     *
     * @return {string} - The name of the storage
     */
    public getStorageName(): string {
        this.logger.debug(`[getStorageName] ${this.name}`);
        return this.name;
    }

    /**
     *
     */
    public getStorageType(): StorageType {
        this.logger.debug(`[getStorageType] ${this.storageType}`);
        return this.storageType;
    }

    /**
     *
     * @param data
     */
    public setInitialData<T>(data: Collection<T>): void {
        for (let i = 0; i < data.length; i++) {
            this.setValue(data[i].key, data[i].value);
        }
    }

    /**
     * VALUE
     * A value is the most basic way of data in the storage, it is generic typed, so any kind of data can be stored.
     */

    /**
     * Sets a value in the storage through the use of a key and a value
     *
     * @param {string} key - The key to set the value upon
     * @param {Value} value - The value to set
     * @return {Value} - The value that was set
     */
    public setValue<T>(key: string, value: Value<T>): Value<T> | undefined {
        this.storage.set(this.addPrefix(key), value);
        this.logger.debug(`[setValue] ${key} with value: ${value}`);
        return value;
    }

    /**
     * Retrieves a value from the storage through the use of a key
     *
     * @param {string} key - The key containing the value
     * @param {Value | undefined} defaultValue - optional default value
     * @return {Value | undefined} - the value or undefined if nothing is found
     */
    public getValue<T>(key: string, defaultValue?: Value<T>): Value<T> | undefined {
        const value = defaultValue ? this.storage.get<T>(this.addPrefix(key), defaultValue) : this.storage.get<T>(this.addPrefix(key));
        this.logger.debug(`[getValue] ${key}, ${defaultValue ? `with defaultValue: ${defaultValue},` : ''} results: ${value}`);
        return value;
    }

    /**
     * Sets a value to undefined in the storage through the use of a key
     *
     * @param {string} key - The key to set the value upon
     * @return {boolean} - if the value was deleted or not
     */
    public deleteValue(key: string): boolean {
        if (this.isValueSet(key)) {
            this.logger.debug(`[deleteValue] ${key}`);
            this.storage.set(this.addPrefix(key), undefined);
            return true;
        } else {
            this.logger.debug(`[deleteValue] ${key} not found, no value deleted`);
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
        const hasValue = this.storage.has(this.addPrefix(key));
        this.logger.debug(`[isValueSet] ${key}, results ${hasValue}`);
        return hasValue;
    }

    /**
     * COLLECTION
     * A collection is basically a key with multiple keys with values in the storage,
     * through the use of the methods in the Storage class, it is possible to work more easier with a collection of values.
     * Single values are still returned as a generic type, but multiple values are returned in an array of objects, with the key and value as properties.
     */

    /**
     *
     * @param {string} collection
     * @param {Collection} values
     * @return {Collection} - the values that were set
     */
    public setCollection<T>(collection: string, values: Collection<T>): Collection<T> {
        const valueObject = this.setCollectionValues(collection, values);
        this.logger.debug(`[setCollection]key ${collection} with values: ${values}`);
        return valueObject;
    }


    /**
     * Sets a value in a collection in the storage
     *
     * @param {string} collection - The key to check for the value
     * @param {string} key - The key to check for the value
     * @param {<T>} value - The key to check for the value
     * @return {<T> | undefined} - the value that was set
     */
    public setCollectionValue<T>(collection: string, key: string, value: T): T | undefined {
        this.logger.debug(`[setCollectionValue], collection: ${collection}, key: ${key}, value: ${value}.`);
        return this.setValue<T>(this.concatKeys(collection, key), value);
    }


    /**
     * Sets multiple values in a collection in the storage
     *
     * @param {string} collection - The key to check for the value
     * @param {Collection} values - Multiple values to set in the collection
     * @return {Collection} - the values that were set
     */
    public setCollectionValues<T>(collection: string, values: Collection<T>): Collection<T> {
        this.logger.debug(`[setCollectionValues] collection: ${collection}, values: ${values}`);
        for (let i = 0; i < values.length; i++) {
            this.setCollectionValue(collection, values[i].key, values[i].value);
        }
        return values;
    }


    /**
     *
     * @param {string} collection - collection key
     * @return {Collection} - array of values
     */
    public getCollection<T>(collection: string): Collection<T> | undefined {
        const valueObject = this.storage.getAll(this.addPrefix(collection));

        if (!valueObject || Object.keys(valueObject).length === 0) {
            this.logger.warning(`No values found with collection key: ${collection}`);
            return undefined;
        }

        this.logger.debug(`[getCollection], with key: ${collection}, results: ${valueObject}`);
        const collectionArray = this.parseValueObjectIntoCollection(valueObject);

        if (collectionArray.length === 0) {
            return undefined;
        }
        return collectionArray;
    }

    /**
     * Gets a value from a collection
     *
     * @param {string} collection - The collection to get the value from
     * @param {string} key - The key to get the value from
     * @return {<T> | undefined} - the value or undefined if nothing was found
     */
    public getValueFromCollection<T>(collection: string, key: string): T | undefined {
        const value = this.getValue<T>(this.concatKeys(collection, key));
        this.logger.debug(`[getValueFromCollection], collection: ${collection}, key: ${key}.`);
        return value;
    }

    /**
     *
     * @param {string} collection - collection key to delete on
     * @return {boolean}
     */
    public deleteCollection(collection: string): boolean {
        const collectionValues = this.getCollection(collection) ?? [];

        if (collectionValues.length === 0) {
            return false;
        }

        for (let i = 0; i < collectionValues.length; i++) {
            this.deleteValue(this.concatKeys(collection, collectionValues[i].key));
        }
        this.logger.debug(`[deleteCollection] ${collection} deleted, with ${collectionValues.length} values.`);
        return true;
    }

    /**
     *
     * @param {string} collection - collection key to use to get the value on
     * @param {string} key - key inside the collection to delete
     * @return {boolean}
     */
    public deleteCollectionValue(collection: string, key: string): boolean {
        const deleted = this.deleteValue(this.concatKeys(collection, key));
        this.logger.debug(`[deleteCollectionValue] ${collection} ${key}: ${deleted}`);
        return deleted;
    }

    /**
     * UTILITIES
     */

    /**
     *
     * @param {string} key
     * @return {string}
     */
    public addPrefix(key: string): string {
        const prefixed = `${this.getStorageName()}_${key}`;
        this.logger.debug(`[addPrefix]: prefix: ${this.getStorageName()}, subKey: ${key}, result: ${prefixed}`);
        return prefixed;
    }

    /**
     * Parses a key string to add a prefix to the key
     *
     * @param {string} key - The key to assert the storage upon
     * @param {string | undefined} subKey - an optional prefix
     * @return {string}
     */
    public concatKeys(key: string, subKey: string): string {
        const concatKeys = `${key}_${subKey}`;
        this.logger.debug(`[concatKeys]: key: ${key}, subKey: ${subKey}, result: ${concatKeys}`);
        return concatKeys;
    }


    // TEMPORARY HERE FOR NOW
    // /**
    //  *
    //  * @param {Collection} array - array to parse into an object
    //  * @return {ValueObject}
    //  */
    // private parseCollectionIntoValueObject<T>(array: Collection<T>): ValueObject<T> {
    //     const object: ValueObject<T> = {};
    //
    //     for (let i = 0; i < array.length; ++i) {
    //         const objectKey = array[i].key;
    //         object[objectKey] = array[i].value;
    //     }
    //
    //     this.logger.debug(`[parseCollectionIntoValueObject] array: ${array}, result ${object}`);
    //     return object;
    // }

    /**
     *
     * @param {ValueObject} object - object to parse into an collection
     * @return {Collection}
     */
    public parseValueObjectIntoCollection<T>(object: ValueObject<T>): Collection<T> {
        const array = Object.keys(object).map((key) => {
            const value = object[key];

            return {
                value: value,
                key: key.split("_").pop() as string
            };
        }).filter((entry) => entry.value !== undefined);
        this.logger.debug(`[parseValueObjectIntoCollection] object: ${object}, array ${array}`);
        return array;
    }
}

