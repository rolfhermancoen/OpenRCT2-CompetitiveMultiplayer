import { IRide } from "@src/objects/ride";
import {
  ACTION_TYPE,
  BALLOON_PRESS,
  BANNER_PLACE,
  BANNER_REMOVE,
  BANNER_SET_COLOUR,
  BANNER_SET_NAME,
  BANNER_SET_STYLE,
  CHEAT_SET,
  CLEAR_SCENERY,
  CLIMATE_SET,
  EXPENDITURE_TYPE,
  FOOTPATH_ADDITION_PLACE,
  FOOTPATH_ADDITION_REMOVE,
  FOOTPATH_LAYOUT_PLACE,
  FOOTPATH_PLACE,
  FOOTPATH_REMOVE,
  GUEST_SET_FLAG,
  GUEST_SET_NAME,
  LAND_BUY_RIGHTS,
  LAND_LOWER,
  LAND_RAISE,
  LAND_SET_HEIGHT,
  LAND_SET_RIGHTS,
  LAND_SMOOTH,
  LARGE_SCENERY_PLACE,
  LARGE_SCENERY_REMOVE,
  LARGE_SCENERY_SET_COLOUR,
  LOAD_OR_QUIT,
  MAP_CHANGE_SIZE,
  MAZE_PLACE_TRACK,
  MAZE_SET_TRACK,
  NETWORK_MODIFY_GROUP,
  PARK_ENTRANCE_PLACE,
  PARK_ENTRANCE_REMOVE,
  PARK_MARKETING,
  PARK_SET_DATE,
  PARK_SET_ENTRANCE_FEE,
  PARK_SET_LOAN,
  PARK_SET_NAME,
  PARK_SET_PARAMETER,
  PARK_SET_RESEARCH_FUNDING,
  PAUSE_TOGGLE,
  PEEP_PICKUP,
  PEEP_SPAWN_PLACE,
  PLAYER_KICK,
  PLAYER_SET_GROUP,
  RIDE_CREATE,
  RIDE_DEMOLISH,
  RIDE_ENTRANCE_EXIT_PLACE,
  RIDE_ENTRANCE_EXIT_REMOVE,
  RIDE_FREEZE_RATING,
  RIDE_SET_APPEARANCE,
  RIDE_SET_COLOUR_SCHEME,
  RIDE_SET_NAME,
  RIDE_SET_PRICE,
  RIDE_SET_SETTING,
  RIDE_SET_STATUS,
  RIDE_SET_VEHICLE,
  SCENARIO_SET_SETTING,
  SIGN_SET_NAME,
  SIGN_SET_STYLE,
  SMALL_SCENERY_PLACE,
  SMALL_SCENERY_REMOVE,
  SMALL_SCENERY_SET_COLOUR,
  STAFF_FIRE,
  STAFF_HIRE,
  STAFF_SET_COLOUR,
  STAFF_SET_COSTUME,
  STAFF_SET_NAME,
  STAFF_SET_ORDERS,
  STAFF_SET_PATROL_AREA,
  SURFACE_SET_STYLE,
  TILE_MODIFY,
  TRACK_DESIGN,
  TRACK_PLACE,
  TRACK_REMOVE,
  TRACK_SET_BRAKE_SPEED,
  WALL_PLACE,
  WALL_REMOVE,
  WALL_SET_COLOUR,
  WATER_LOWER,
  WATER_RAISE,
  WATER_SET_HEIGHT,
} from "./enum";

export type Args<A extends ACTION_TYPE> = A extends typeof BALLOON_PRESS
  ? BalloonPressArgs
  : A extends typeof BANNER_PLACE
  ? BannerPlaceArgs
  : A extends typeof BANNER_REMOVE
  ? BannerRemoveArgs
  : A extends typeof BANNER_SET_COLOUR
  ? BannerSetColourArgs
  : A extends typeof BANNER_SET_NAME
  ? BannerSetNameArgs
  : A extends typeof BANNER_SET_STYLE
  ? BannerSetStyleArgs
  : A extends typeof CHEAT_SET
  ? CheatSetArgs
  : A extends typeof CLEAR_SCENERY
  ? ClearSceneryArgs
  : A extends typeof CLIMATE_SET
  ? ClimateSetArgs
  : A extends typeof FOOTPATH_ADDITION_PLACE
  ? FootpathAdditionPlaceArgs
  : A extends typeof FOOTPATH_ADDITION_REMOVE
  ? FootpathAdditionRemoveArgs
  : A extends typeof FOOTPATH_PLACE
  ? FootpathPlaceArgs
  : A extends typeof FOOTPATH_LAYOUT_PLACE
  ? FootpathLayoutPlaceArgs
  : A extends typeof FOOTPATH_REMOVE
  ? FootpathRemoveArgs
  : A extends typeof GUEST_SET_FLAG
  ? GuestSetFlagsArgs
  : A extends typeof GUEST_SET_NAME
  ? GuestSetNameArgs
  : A extends typeof LAND_BUY_RIGHTS
  ? LandBuyRightsArgs
  : A extends typeof LAND_LOWER
  ? LandLowerArgs
  : A extends typeof LAND_RAISE
  ? LandRaiseArgs
  : A extends typeof LAND_SET_HEIGHT
  ? LandSetHeightArgs
  : A extends typeof LAND_SET_RIGHTS
  ? LandSetRightsArgs
  : A extends typeof LAND_SMOOTH
  ? LandSmoothArgs
  : A extends typeof LARGE_SCENERY_PLACE
  ? LargeSceneryPlaceArgs
  : A extends typeof LARGE_SCENERY_REMOVE
  ? LargeSceneryRemoveArgs
  : A extends typeof LARGE_SCENERY_SET_COLOUR
  ? LargeScenerySetColourArgs
  : A extends typeof LOAD_OR_QUIT
  ? LoadOrQuitArgs
  : A extends typeof MAP_CHANGE_SIZE
  ? MapChangeSizeArgs
  : A extends typeof MAZE_PLACE_TRACK
  ? MazePlaceTrackArgs
  : A extends typeof MAZE_SET_TRACK
  ? MazeSetTrackArgs
  : A extends typeof NETWORK_MODIFY_GROUP
  ? NetworkModifyGroupArgs
  : A extends typeof PARK_ENTRANCE_PLACE
  ? ParkEntrancePlaceArgs
  : A extends typeof PARK_ENTRANCE_REMOVE
  ? ParkEntranceRemoveArgs
  : A extends typeof PARK_MARKETING
  ? ParkMarketingArgs
  : A extends typeof PARK_SET_DATE
  ? ParkSetDateArgs
  : A extends typeof PARK_SET_ENTRANCE_FEE
  ? ParkSetEntranceFeeArgs
  : A extends typeof PARK_SET_LOAN
  ? ParkSetLoanArgs
  : A extends typeof PARK_SET_NAME
  ? ParkSetNameArgs
  : A extends typeof PARK_SET_PARAMETER
  ? ParkSetParameterArgs
  : A extends typeof PARK_SET_RESEARCH_FUNDING
  ? ParkSetResearchFundingArgs
  : A extends typeof PAUSE_TOGGLE
  ? PauseToggleArgs
  : A extends typeof PEEP_PICKUP
  ? PeepPickupArgs
  : A extends typeof PEEP_SPAWN_PLACE
  ? PeepSpawnPlaceArgs
  : A extends typeof PLAYER_KICK
  ? PlayerKickArgs
  : A extends typeof PLAYER_SET_GROUP
  ? PlayerSetGroupArgs
  : A extends typeof RIDE_CREATE
  ? RideCreateArgs
  : A extends typeof RIDE_DEMOLISH
  ? RideDemolishArgs
  : A extends typeof RIDE_ENTRANCE_EXIT_PLACE
  ? RideEntranceExitPlaceArgs
  : A extends typeof RIDE_ENTRANCE_EXIT_REMOVE
  ? RideEntranceExitRemoveArgs
  : A extends typeof RIDE_FREEZE_RATING
  ? RideFreezeRatingArgs
  : A extends typeof RIDE_SET_APPEARANCE
  ? RideSetAppearanceArgs
  : A extends typeof RIDE_SET_COLOUR_SCHEME
  ? RideSetColourSchemeArgs
  : A extends typeof RIDE_SET_NAME
  ? RideSetNameArgs
  : A extends typeof RIDE_SET_PRICE
  ? RideSetPriceArgs
  : A extends typeof RIDE_SET_SETTING
  ? RideSetSettingArgs
  : A extends typeof RIDE_SET_STATUS
  ? RideSetStatusArgs
  : A extends typeof RIDE_SET_VEHICLE
  ? RideSetVehicleArgs
  : A extends typeof SCENARIO_SET_SETTING
  ? ScenarioSetSettingArgs
  : A extends typeof SIGN_SET_NAME
  ? SignSetNameArgs
  : A extends typeof SIGN_SET_STYLE
  ? SignSetStyleArgs
  : A extends typeof SMALL_SCENERY_PLACE
  ? SmallSceneryPlaceArgs
  : A extends typeof SMALL_SCENERY_REMOVE
  ? SmallSceneryRemoveArgs
  : A extends typeof SMALL_SCENERY_SET_COLOUR
  ? SmallScenerySetColourArgs
  : A extends typeof STAFF_FIRE
  ? StaffFireArgs
  : A extends typeof STAFF_HIRE
  ? StaffHireArgs
  : A extends typeof STAFF_SET_COLOUR
  ? StaffSetColourArgs
  : A extends typeof STAFF_SET_COSTUME
  ? StaffSetCostumeArgs
  : A extends typeof STAFF_SET_NAME
  ? StaffSetNameArgs
  : A extends typeof STAFF_SET_ORDERS
  ? StaffSetOrdersArgs
  : A extends typeof STAFF_SET_PATROL_AREA
  ? StaffSetPatrolAreaArgs
  : A extends typeof SURFACE_SET_STYLE
  ? SurfaceSetStyleArgs
  : A extends typeof TILE_MODIFY
  ? TileModifyArgs
  : A extends typeof TRACK_DESIGN
  ? TrackDesignArgs
  : A extends typeof TRACK_PLACE
  ? TrackPlaceArgs
  : A extends typeof TRACK_REMOVE
  ? TrackRemoveArgs
  : A extends typeof TRACK_SET_BRAKE_SPEED
  ? TrackSetBrakeSpeedArgs
  : A extends typeof WALL_PLACE
  ? WallPlaceArgs
  : A extends typeof WALL_REMOVE
  ? WallRemoveArgs
  : A extends typeof WALL_SET_COLOUR
  ? WallSetColourArgs
  : A extends typeof WATER_LOWER
  ? WaterLowerArgs
  : A extends typeof WATER_RAISE
  ? WaterRaiseArgs
  : A extends typeof WATER_SET_HEIGHT
  ? WaterSetHeightArgs
  : undefined;

type GameActionResultObject = {
  expenditureType?: EXPENDITURE_TYPE;
} & Omit<GameActionResult, "expenditureType">;

type RideCreateActionResultObject = {
  ride?: IRide;
  expenditureType?: EXPENDITURE_TYPE;
} & Omit<RideCreateActionResult, "expenditureType" | "ride">;

type StaffHireNewActionResultObject = {
  expenditureType?: EXPENDITURE_TYPE;
} & Omit<StaffHireNewActionResult, "expenditureType">;

export type Result<T extends ACTION_TYPE> = T extends typeof RIDE_CREATE
  ? RideCreateActionResultObject
  : T extends typeof STAFF_HIRE
  ? StaffHireNewActionResultObject
  : GameActionResultObject;
