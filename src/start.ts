import {Network} from "@services/Network";
import {Utilities} from "@services/Utilities";

export const start = (): void => {
    if (network.mode !== "server") {
        return;
    }

    new Network();
    new Utilities();
};
