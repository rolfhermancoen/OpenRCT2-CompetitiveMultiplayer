const PREFIX = new RegExp('^(!|/)');

let instantiated = false;

/**
 * Class representing a way to use commands.
 */
export class Commander {
    /**
     * Construct a new Commander and checks if none has been instantiated yet
     *
     */
    constructor() {
        if(instantiated) {
            throw new Error("Commander can only be instantiated once, and needs to be injected into other classes.");
        }
        instantiated = true;
    }

    /**
     * Gets the command by trimming the string
     *
     * @param {string} string - The string to use
     * @return {string | boolean}
     */
    public getCommand(string: string): string | boolean {
        if (string.match(PREFIX)) {
            return string.replace(PREFIX, '').trim();
        }
        return false;
    }


    /**
     * Checks if a command matches an array of commands
     *
     * @param {string} string - The string to test
     * @param {RegExp[]} commands - An array of commands to test
     * @return {boolean | string}
     */
    public doesCommandMatch(string: string, commands: RegExp[]): boolean | string {
        for (const command of commands) {
            if (command.test(string)) {
                const ret = string.substring(command.source.length, string.length).trim();
                return (ret) ? ret : true;
            }

        }
        return false;
    }
}