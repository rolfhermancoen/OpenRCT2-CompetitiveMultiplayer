/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import {Storage} from "@services/Storage";


const findValueByPrefix = (object: { [name: string]: unknown }, prefix: string): { [p: string]: unknown } => {
    return Object.keys(object).filter(function (k) {
        return k.indexOf(prefix) == 0;
    }).reduce(function (newData: { [p: string]: unknown }, k) {
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
                    if (!namespace) {
                        return storage;
                    }
                    return findValueByPrefix(storage, `${pluginName}_${namespace}`);
                }, has(key: string): boolean {
                    return Boolean(storage[`${pluginName}_${key}`]);
                }, set<T>(key: string, value: T): void {
                    if (value === undefined) {
                        delete storage[`${pluginName}_${key}`];
                    }
                    storage[`${pluginName}_${key}`] = value;
                    return;
                },
            };
        }
    });
});

test('new Storage(): default', t => {
    const storage = new Storage({
        name: "StorageName",
    });
    t.not(storage, undefined);
    t.is(storage.getStorageName(), "StorageName");
    t.is(storage.getStorageType(), "park");
});

test('new Storage(): park', t => {
    const storage = new Storage({
        name: "StorageName",
        type: "park"
    });
    t.is(storage.getStorageType(), "park");
});

test('new Storage(): shared', t => {
    const storage = new Storage({
        name: "StorageName",
        type: "shared"
    });
    t.is(storage.getStorageType(), "shared");
});

test('getValue()', (t) => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo", value: "bar"}
        ]
    });

    t.is(storage.getValue("foo"), "bar");
});

test('setValue()', t => {
    const storage = new Storage({
        name: "StorageName",
    });
    storage.setValue("foo", "bar");

    t.is(storage.getValue("foo"), "bar");
});

test('setValue(): update', t => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo", value: "bar"}
        ]
    });

    t.is(storage.getValue("foo"), "bar");

    storage.setValue("foo", "baz");

    t.is(storage.getValue("foo"), "baz");
});

test('deleteValue()', t => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo", value: "bar"}
        ]
    });

    storage.deleteValue("foo");

    t.is(storage.getValue("foo"), undefined);
});

test("isValueSet()", (t) => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo", value: "bar"}
        ]
    });

    t.is(storage.isValueSet("foo"), true);

    storage.deleteValue("foo");

    t.is(storage.isValueSet("foo"), false);
});

test("getCollection()", (t) => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo_bar", value: "baz"},
            {key: "foo_ava", value: "strong"}
        ]
    });

    t.deepEqual(storage.getCollection("foo"), [{value: 'baz', key: 'bar'}, {value: 'strong', key: 'ava'}]);
});

test("getValueFromCollection()", (t) => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo_bar", value: "baz"},
            {key: "foo_ava", value: "strong"}
        ]
    });

    t.deepEqual(storage.getValueFromCollection("foo", "bar"), {value: "baz", key: "bar",});
    t.deepEqual(storage.getValueFromCollection("foo", "ava"), {key: "ava", value: "strong"});
});

test("setCollection()", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });

    storage.setCollection("foo", [{key: "bar", value: "baz"}, {key: "ava", value: "strong"}]);


    t.deepEqual(storage.getCollection("foo"), [{value: 'baz', key: 'bar'}, {value: 'strong', key: 'ava'}]);
});

test("deleteCollection()", (t) => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo_bar", value: "baz"},
            {key: "foo_ava", value: "strong"}
        ]
    });

    storage.deleteCollection("foo");
    t.is(storage.getCollection("foo"), undefined);
});

test("deleteCollectionValue()", (t) => {
    const storage = new Storage({
        name: "StorageName",
        initialData: [
            {key: "foo_bar", value: "baz"},
            {key: "foo_ava", value: "strong"}
        ]
    });

    storage.deleteCollectionValue("foo", "bar");
    t.deepEqual(storage.getCollection("foo"), [{key: "ava", value: "strong"}]);
});

test("addPrefix()", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });

    const fullKey = storage.addPrefix("foo");
    t.is(fullKey, "StorageName_foo");
});

test("concatKeys()", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });

    const fullCollectionKey = storage.concatKeys("foo", "bar");
    t.is(fullCollectionKey, "foo_bar");
});

test("parseValueObjectIntoCollection()", (t) => {
    const storage = new Storage({
        name: "StorageName",
    });

    const valueObject = {"baz": "bar", "ava": "strong"};

    t.deepEqual(storage.parseValueObjectIntoCollection(valueObject), [{value: 'bar', key: 'baz'}, {
        value: 'strong',
        key: 'ava'
    }]);

});