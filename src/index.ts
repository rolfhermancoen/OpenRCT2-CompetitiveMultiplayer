
/// <reference path="../types/openrct2.d.ts" />

import { main } from "./main";

registerPlugin({
    name: "CompetitiveMultiplayer",
    version: "0.1",
    authors: ["DeRofle"],
    type: "remote",
    licence: "MIT",
    targetApiVersion: 69,
    main,
});