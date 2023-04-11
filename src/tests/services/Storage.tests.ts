/// <reference path="../../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import {Storage} from "@services/Storage";


const findValueByPrefix = (object: { [name: string]: unknown }, prefix: string): { [p: string]: unknown } => {
    return Object.keys(object).filter(function(k) {
        return k.indexOf(prefix) == 0;
    }).reduce(function(newData: { [p: string]: unknown }, k) {
        newData[k] = object[k];
        return newData;
    }, {});
};

test.before(() => {
    globalThis.context = Mock.context({
        getParkStorage(pluginName: string = "CompetitiveMultiplayer"): Configuration {
            const storage: { [name: string]: unknown } = {};

            return {
                get<T>(key: string): T | undefined {
                    return storage[`${pluginName}_${key}`] as T | undefined;
                },
                getAll(namespace?: string): { [p: string]: unknown } {
                    if(!namespace) {
                        return storage;
                    }
                    return findValueByPrefix(storage, `${pluginName}_${namespace}`);
                }, has(key: string): boolean {
                    return Boolean(storage[`${pluginName}_${key}`]);
                }, set<T>(key: string, value: T): void {
                    storage[`${pluginName}_${key}`] = value;
                    return;
                },
            };
        }
    });
});

test('Creates a valid Storage', t => {
    const storage = new Storage({
        name: "StorageName",
    });
    t.not(storage, undefined);

    const storageName = storage.getStorageName();
    t.is(storageName, "StorageName");
});

test('Can set a value in Storage', t => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValue("foo", "bar");

    const isSet = storage.isValueSet("foo");

    t.is(isSet, true);
});

test('Can set a value in Storage and update it', t => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValue("foo", "bar");

    const value = storage.getValue("foo");

    t.is(value, "bar");

    storage.setValue("foo", "baz");

    const updatedValue = storage.getValue("foo");

    t.is(updatedValue, "baz");
});

test('Can set a value in Storage and delete it', t => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValue("foo", "bar");

    const value = storage.getValue("foo");

    t.is(value, "bar");

    storage.deleteValue("foo");

    const updatedValue = storage.getValue("foo");

    t.is(updatedValue, undefined);
});

test("Can set multiple values in Storage and getAll", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValue("foo", 1);
    storage.setValue("bar", 2);
    storage.setValue("baz", 3);

    const allValues = storage.getAllValues();

    t.is(allValues["CompetitiveMultiplayer_StorageName_foo"], 1);
    t.is(allValues["CompetitiveMultiplayer_StorageName_bar"], 2);
    t.is(allValues["CompetitiveMultiplayer_StorageName_baz"], 3);
});

test("Can set a value in a collection", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValueInCollection("foo", { "bar": 1});

    const value = storage.getValueFromCollection("foo", "bar");

    t.is(value, 1);
});

test("Can set a multiple values in a collection", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValueInCollection("foo", { "bar": 1});
    storage.setValueInCollection("foo", { "baz": 2});

    const barValue = storage.getValueFromCollection("foo", "bar");
    const bazValue = storage.getValueFromCollection("foo", "baz");

    t.is(barValue, 1);
    t.is(bazValue, 2);
});

test("Can set a multiple values in a collection and get all values from collection", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValueInCollection("foo", { "bar": 1});
    storage.setValueInCollection("foo", { "baz": 2});

    const allCollectionValues = storage.getAllValuesFromCollection("foo");

    t.is(allCollectionValues["CompetitiveMultiplayer_StorageName_foo_bar"], 1);
    t.is(allCollectionValues["CompetitiveMultiplayer_StorageName_foo_baz"], 2);
});

test("Can set a multiple values in a collection at once", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValuesInCollection("foo", { "bar": 1, "baz": 2});

    const allCollectionValues = storage.getAllValuesFromCollection("foo");

    t.is(allCollectionValues["CompetitiveMultiplayer_StorageName_foo_bar"], 1);
    t.is(allCollectionValues["CompetitiveMultiplayer_StorageName_foo_baz"], 2);
});


test("Parses the correct key", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });

    const fullKey = storage.parseKey("foo");
    t.is(fullKey, "StorageName_foo");
});

test("Parses the correct collection key", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });

    const fullCollectionKey = storage.parseCollectionKey("foo", "bar");
    t.is(fullCollectionKey, "foo_bar");
});