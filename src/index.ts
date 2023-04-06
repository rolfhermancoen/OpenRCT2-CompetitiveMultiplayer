
/// <reference path="../lib/openrct2.d.ts" />

import { main } from "@src/main";

registerPlugin({
    name: "CompetitiveMultiplayer",
    version: "0.1",
    authors: ["rolfhermancoen"],
    type: "remote",
    licence: "MIT",
    targetApiVersion: 69,
    main,
});