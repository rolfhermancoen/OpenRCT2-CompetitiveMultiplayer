type StorageOptions = {
    name?: string;
};

/**
 * Class representing storage.
 * @class
 */
export class Storage {
    /**
     * name used for prefixing the keys for the storage
     * @private
     * @type {name}
     */
    private readonly name: string;

    /**
     * storage used throughout the class
     * @private
     * @type {Configuration}
     */
    private readonly storage: Configuration;

    /**
     * Construct a new storage
     *
     * @public
     * @param {StorageOptions} options - the options provided when instantiating
     */
    public constructor(options: StorageOptions = {}) {
        if(!options.name) {
            throw new Error(`Missing name for constructed Storage object}`);
        }

        this.name = options.name;
        this.storage = context.getParkStorage();
    }

    /**
     * Retrieves a value from the storage through the use of a key
     *
     * @public
     * @param {string} key - The key containing the value
     * @return {<T> | undefined}
     */
    public getValue<T>(key: string): T | undefined {
        return this.storage.get<T>(this.parseKey(key));
    }

    /**
     * Sets a value in the storage through the use of a key and a value
     *
     * @public
     * @param {string} key - The key to set the value upon
     * @param {<T>} value - The value to set
     * @return {void}
     */
    public setValue<T>(key: string, value: T): void {
        this.storage.set<T>(this.parseKey(key), value);
    }

    /**
     * Asserts if the storage has a key set
     *
     * @public
     * @param {string} key - The key to assert the storage upon
     * @return {boolean}
     */
    public hasKey(key: string): boolean {
        return this.storage.has(this.parseKey(key));
    }

    /**
     * Parses a key string to add a prefix to the key, only used within Storage class
     *
     * @private
     * @param {string} key - The key to assert the storage upon
     * @return {string}
     */
    private parseKey(key: string): string {
        return `${this.name}_${key}`;
    }
}