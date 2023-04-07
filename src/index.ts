
/// <reference path="../lib/openrct2.d.ts" />

import { start } from "@src/start";

registerPlugin({
    name: "CompetitiveMultiplayer",
    version: "0.1",
    authors: ["rolfhermancoen"],
    type: "remote",
    licence: "MIT",
    targetApiVersion: 69,
    main: start,
});