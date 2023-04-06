export enum TILE_ELEMENT_TYPE {
    SURFACE = "surface",
    FOOTPATH = "footpath",
    TRACK = "track",
    SMALL_SCENERY = "small_scenery",
    WALL = "wall",
    ENTRANCE = "entrance",
    LARGE_SCENERY = "large_scenery",
    BANNER = "banner"
}

export enum HOOK_TYPE {
    ACTION_QUERY = "action.query",
    ACTION_EXECUTE = "action.execute",
    INTERVAL_TICK = "interval.tick",
    INTERVAL_DAY = "interval.day",
    NETWORK_CHAT = "network.chat",
    NETWORK_ACTION = "network.action",
    NETWORK_JOIN = "network.join",
    NETWORK_LEAVE = "network.leave",
    RIDE_RATINGS_CALCULATE = "ride.ratings.calculate",
    ACTION_LOCATION = "action.location",
    VEHICLE_CRASH = "vehicle.crash",
    MAP_CHANGE = "map.change",
    MAP_CHANGED = "map.changed",
    MAP_SAVE = "map.save"
}

export enum ACTION_TYPE {
    BALLOON_PRESS = "balloonpress",
    BANNER_PLACE = "bannerplace",
    BANNER_REMOVE = "bannerremove",
    BANNER_SET_COLOUR = "bannersetcolour",
    BANNER_SET_NAME = "bannersetname",
    BANNER_SET_STYLE = "bannersetstyle",
    CHEAT_SET = "cheatset",
    CLEAR_SCENERY = "clearscenery",
    CLIMATE_SET = "climateset",
    FOOTPATH_ADDITION_PLACE = "footpathadditionplace",
    FOOTPATH_ADDITION_REMOVE = "footpathadditionremove",
    FOOTPATH_PLACE = "footpathplace",
    FOOTPATH_LAYOUT_PLACE = "footpathlayoutplace",
    FOOTPATH_REMOVE = "footpathremove",
    GUEST_SET_FLAG = "guestsetflags",
    GUEST_SET_NAME = "guestsetname",
    LAND_BUY_RIGHTS = "landbuyrights",
    LAND_LOWER = "landlower",
    LAND_RAISE = "landraise",
    LAND_SET_HEIGHT = "landsetheight",
    LAND_SET_RIGHTS = "landsetrights",
    LAND_SMOOTH = "landsmooth",
    LARGE_SCENERY_PLACE = "largesceneryplace",
    LARGE_SCENERY_REMOVE = "largesceneryremove",
    LARGE_SCENERY_SET_COLOUR = "largescenerysetcolour",
    LOAD_OR_QUIT = "loadorquit",
    MAP_CHANGE_SIZE = "mapchangesize",
    MAZE_PLACE_TRACK = "mazeplacetrack",
    MAZE_SET_TRACK = "mazesettrack",
    NETWORK_MODIFY_GROUP = "networkmodifygroup",
    PARK_ENTRANCE_PLACE = "parkentranceplace",
    PARK_ENTRANCE_REMOVE = "parkentranceremove",
    PARK_MARKETING = "parkmarketing",
    PARK_SET_DATE = "parksetdate",
    PARK_SET_ENTRANCE_FEE = "parksetentrancefee",
    PARK_SET_LOAN = "parksetloan",
    PARK_SET_NAME = "parksetname",
    PARK_SET_PARAMETER = "parksetparameter",
    PARK_SET_RESEARCH_FUNDING = "parksetresearchfunding",
    PAUSE_TOGGLE = "pausetoggle",
    PEEP_PICKUP = "peeppickup",
    PEEP_SPAWN_PLACE = "peepspawnplace",
    PLAYER_KICK = "playerkick",
    PLAYER_SET_GROUP = "playersetgroup",
    RIDE_CREATE = "ridecreate",
    RIDE_DEMOLISH = "ridedemolish",
    RIDE_ENTRANCE_EXIT_PLACE = "rideentranceexitplace",
    RIDE_ENTRANCE_EXIT_REMOVE = "rideentranceexitremove",
    RIDE_FREEZE_RATING = "ridefreezerating",
    RIDE_SET_APPEARANCE = "ridesetappearance",
    RIDE_SET_COLOUR_SCHEME = "ridesetcolourscheme",
    RIDE_SET_NAME = "ridesetname",
    RIDE_SET_PRICE = "ridesetprice",
    RIDE_SET_SETTING = "ridesetsetting",
    RIDE_SET_STATUS = "ridesetstatus",
    RIDE_SET_VEHICLE = "ridesetvehicle",
    SCENARIO_SETTING = "scenariosetsetting",
    SIGN_SET_NAME = "signsetname",
    SIGN_SET_STYLE = "signsetstyle",
    SMALL_SCENERY_PLACE = "smallsceneryplace",
    SMALL_SCENERY_REMOVE = "smallsceneryremove",
    SMALL_SCENERY_SET_COLOUR = "smallscenerysetcolour",
    STAFF_FIRE = "stafffire",
    STAFF_HIRE = "staffhire",
    STAFF_SET_COLOUR = "staffsetcolour",
    STAFF_SET_COSTUME = "staffsetcostume",
    STAFF_SET_NAME = "staffsetname",
    STAFF_SET_ORDERS = "staffsetorders",
    STAFF_SET_PATROL_AREA = "staffsetpatrolarea",
    SURFACE_SET_STYLE = "surfacesetstyle",
    TILE_MODIFY = "tilemodify",
    TRACK_DESIGN = "trackdesign",
    TRACK_PLACE = "trackplace",
    TRACK_REMOVE = "trackremove",
    TRACK_SET_BRAKE_SPEED = "tracksetbrakespeed",
    WALL_PLACE = "wallplace",
    WALL_REMOVE = "wallremove",
    WALL_SET_COLOUR = "wallsetcolour",
    WATER_LOWER = "waterlower",
    WATER_RAISE = "waterraise",
    WATER_SET_HEIGHT = "watersetheight",
}