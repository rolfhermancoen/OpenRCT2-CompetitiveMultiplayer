import test from "ava";
import * as ArrayHelper from "../../src/utils/array";

test("findIndex()", t =>
{
    const array = [ "one", "two", "three" ];

    t.is(ArrayHelper.findIndex(array, i => i.indexOf("o") === 0), 0);
    t.is(ArrayHelper.findIndex(array, i => i.indexOf("tw") === 0), 1);
    t.is(ArrayHelper.findIndex(array, i => i.indexOf("th") === 0), 2);
    t.is(ArrayHelper.findIndex(array, () => true), 0);

    t.is(ArrayHelper.findIndex(array, i => i.indexOf("z") === 0), null);
    t.is(ArrayHelper.findIndex(array, () => false), null);
    t.is(ArrayHelper.findIndex([], () => false), null);
});