import {
  observable,
  action
} from "mobx-miniprogram"
import {
  getStorage,
  setStorage
} from "../utils/storage.js"
export const mapStore = observable({
  isSatelliteMap: getStorage("isSatelliteMap") || false,
  isInvertBall: getStorage("isInvertBall") || false,
  isInvertRoll: getStorage("isInvertRoll") || false,
  isPolyline: getStorage("isPolyline") || true,
  radar: getStorage("radar") || true,
  isVoice: getStorage("isVoice") || true,
  checkResult: getStorage("checkResult") || ['轨迹线', '飞机雷达'],
  lastLon: getStorage("lastLon") || 0,
  lastLat: getStorage("lastLat") || 0,
  setIsSatelliteMap: action(function (value) {
    this.isSatelliteMap = value
    setStorage("isSatelliteMap", value)
  }),
  setIsInvertBall: action(function (value) {
    this.isInvertBall = value
    setStorage("isInvertBall", value)
  }),
  setRadar: action(function (value) {
    this.radar = value
    setStorage("radar", value)
  }),
  setIsInvertRoll: action(function (value) {
    this.isInvertRoll = value
    setStorage("isInvertRoll", value)
  }),
  setIsPolyline: action(function (value) {
    this.isPolyline = value
    setStorage("isPolyline", value)
  }),
  setIsVoice: action(function (value) {
    this.isVoice = value
    setStorage("isVoice", value)
  }),
  setCheckResult: action(function (value) {
    this.checkResult = value
    setStorage("checkResult", value)
  }),
  setLastLon: action(function (value) {
    this.lastLon = value
    setStorage("lastLon", value)
  }),
  setLastLat: action(function (value) {
    this.lastLat = value
    setStorage("lastLat", value)
  })
})