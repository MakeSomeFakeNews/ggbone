import {
  BehaviorWithStore
} from "mobx-miniprogram-bindings";
import {
  mapStore
} from "../../stores/mapStore";
import {
  userStore
} from "../../stores/userStore";
export const mapBehavior = BehaviorWithStore({
  storeBindings: [{
    namespace: "maps",
    store: mapStore,
    fields: ["isSatelliteMap", "isInvertBall", "isPolyline", "lastLon", "lastLat", "isInvertRoll", "radar"],
    actions: ["setIsSatelliteMap", "setIsInvertBall", "setIsPolyline", "setLastLon", "setLastLat", "setIsInvertRoll", "setRadar"],
  }, {
    store: userStore,
    fields: ["token"],
    actions: ["setToken"],
  }, ]
});