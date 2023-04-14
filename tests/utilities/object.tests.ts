import test from "ava";
import * as ObjectHelper from "../../src/utils/object";

test("combine()", t => {
    const objectOne = {foo: "bar", bar: 1, pedro: true};
    const objectTwo = {ava: "strong", baz: 2, pedro: false};

    const combined = ObjectHelper.combine<typeof objectOne & typeof objectTwo>(objectOne, objectTwo);

    t.is(combined["foo"], "bar");
    t.is(combined["bar"], 1);
    t.is(combined["ava"], "strong");
    t.is(combined["baz"], 2);
    t.is(combined["pedro"], false);
});