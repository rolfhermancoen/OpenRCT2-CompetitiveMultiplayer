import {ACTION_TYPE} from "@lib/enum";

const PREFIX = new RegExp('^(!|/)');

export class BaseManager {
    private readonly name: string;
    private readonly storage: Configuration;

    constructor() {
        if (!('name' in this.constructor)) {
            throw new Error("Something went wrong!");
        }

        this.name = this.constructor["name"] as string;

        if (this.name === "BaseManager") {
            throw new Error("BaseManager can only be extended, not used independently!");
        }

        this.storage = context.getParkStorage();
        this.init();
    }

    init(): void {
        // does nothing
    }

    protected getName(): string {
        return this.name;
    }

    protected getValue<T>(key: string): T | undefined {
        return this.storage.get<T>(this.parseKey(key));
    }

    protected setValue<T>(key: string, value: T): void {
        this.storage.set<T>(this.parseKey(key), value);
    }

    protected hasValue(key: string): boolean {
        return this.storage.has(this.parseKey(key));
    }

    private parseKey(key: string): string {
        return `${this.name}_${key}`;
    }

    protected broadcast(message: string, players?: number | number[]): void {
        if(!players) {
            network.sendMessage(message);
            return;
        }

        const playersArg: number[] = Array.isArray(players) ? players : [players as number];
        network.sendMessage(message, playersArg);
    }

    protected broadcastOnJoin(message: string, players?: number | number[]): void {
        if(!players) {
            network.sendMessage(message);
            return;
        }
        const playersArg: number[] = Array.isArray(players) ? players : [players as number];
        context.setTimeout(() => network.sendMessage(message, playersArg), 1000);
    }

    protected setCheatAction(type: number, param1: number = 1, param2: number = 0): void {
        context.executeAction(ACTION_TYPE.CHEAT_SET, {
            type,
            param1,
            param2
        });
    }

    protected getCommand(string: string): string | boolean {
        if (string.match(PREFIX)) {
            return string.replace(PREFIX, '').trim();
        }
        return false;
    }

    protected doesCommandMatch(string: string, commands: RegExp[]): boolean | string {
        for (const command of commands) {
            if (command.test(string)) {
                const ret = string.substring(command.source.length, string.length).trim();
                return (ret) ? ret : true;
            }

        }
        return false;
    }
}