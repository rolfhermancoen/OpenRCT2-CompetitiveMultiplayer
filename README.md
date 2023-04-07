# CompetitiveMultiplayer plugin for OpenRCT2

This plugin spices up the multiplayer aspect of OpenRCT2.

## Current features
- WIP

### Planned features
- Please submit any ideas under [Issues](https://github.com/rolfhermancoen/OpenRCT2-CompetitiveMultiplayer/issues).

## Installation

1. This plugin requires at least OpenRCT2 version v0.4.4.
2. Download the latest version of the plugin from the [Releases page](https://github.com/rolfhermancoen/OpenRCT2-CompetitiveMultiplayer/releases).
3. To install it, put the downloaded `*.js` file into your `/OpenRCT2/plugin` folder.
    - Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
    - Otherwise this folder is commonly found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin` on Windows.
    - If you already had this plugin installed before, you can safely overwrite the old file.
4. Once the file is there, it should show a special message when a server instance is started.

### Multiplayer! (How to setup)

This plugin only works in multiplayer and also only when ran as the server! A few key points to note:

1. For the plugin to work in multiplayer, **it needs to be installed on the server.** Make sure it is installed in the plugin's folder of the server's user directory.
2. When the server is started, the plugin will be loaded in the server. Players do not need to install the plugin for themselves.
3. When the plugin is installed in single-player, it will do nothing.

## FAQ

###  Does it work in single-player?
**Answer:** No, this plugin only works when installed on the server client. It does nothing in single-player.


### Where does the plugin save its data?
**Answer:** All the data in regards to the players, rides, and economy is saved in the `.park` file.

---

## For developers: building the source code

This project is based on [wisnia74's Typescript modding template](https://github.com/wisnia74/openrct2-typescript-mod-template) and uses [Nodemon](https://nodemon.io/), [ESLint](https://eslint.org/) and [TypeScript](https://www.typescriptlang.org/) from this template.

1. Install latest version of [Node](https://nodejs.org/en/) and make sure to include NPM in the installation options.
2. Clone the project to a location of your choice on your PC.
3. Open command prompt, use `cd` to change your current directory to the root folder of this project and run `npm install` or `yarn install`.
4. Run `npm run gettypes` or `yarn gettypes` to get the types of OpenRCT2; `openrct2.d.ts`, directly from the git of OpenRCT2.
5. Run `npm run build` or `yarn build` (release build) or `npm run build:dev` or `yanr build:dev` (develop build) to build the project.
    - For the release build, the default output folder is `(project directory)/dist`.
    - For the develop build, the project tries to put the plugin into your game's plugin directory.
    - These output paths can be changed in `rollup.config.js`.

### Hot reload

This project supports the [OpenRCT2 hot reload feature](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) for development.

1. Make sure you've enabled it by setting `enable_hot_reloading = true` in your `/OpenRCT2/config.ini`.
2. Open `rollup.config.dev.js` and change the output file path to your plugin folder.
    - Example: `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin/CompetitiveMultiplayer.js`.
    - Make sure this path uses `/` instead of `\` slashes!
3. Open command prompt and use `cd` to change your current directory to the root folder of this project.
4. Run `npm start` or `yarn start` to start the hot reload server.
5. Use the `/OpenRCT2/bin/openrct2.com` executable to [start OpenRCT2 with console](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) and load a save or start new game.
6. Each time you save any of the files in `./src/`, the server will compile `./src/registerPlugin.ts` and place compiled plugin file inside your local OpenRCT2 plugin directory.
7. OpenRCT2 will notice file changes and it will reload the plugin.

### Headless Server

For convenience, it is possible to include a shell file, to start the server from the repository itself, but because install paths and config paths are different on each machine, this `server.sh` is ignored for the git.
There is however a `npm run server` and `yarn server` command available in the package, which runs the shell file, if it exists. An example shell file is included, but needs modification to work on a system.

### Final notes

Thanks to [wisnia74](https://github.com/wisnia74/openrct2-typescript-mod-template) for providing the template for this plugin and parts of the readme. Also a special thanks to [Basssiiie](https://github.com/Basssiiie) for providing help and inspiration when needed!
