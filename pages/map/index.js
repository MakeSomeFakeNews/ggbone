// pages/map/index.js
import Toast from "@vant/weapp/toast/toast";
import Dialog from "@vant/weapp/dialog/dialog";
import {
  mapBehavior
} from "./behavior";
var coordtransform = require('coordtransform');
var coordUtil = require('../../utils/WSCoordinate');
const blue = require("../../blue/index");
const protocol = require("../../protocol/protocol");
const message = require("../../utils/message");
const connectController = require("../../blue/controller");
const app = getApp()
var points_map = [] // 实时绘制地图
var last_lon = 0.0
var last_lat = 0.0
var isDrawing = false
Page({
  behaviors: [mapBehavior],

  /**
   * 页面的初始数据
   */
  data: {
    longitude: 0,
    latitude: 0,
    polyline: [{
      points: points_map,
      color: "#0091ff",
      width: 3
    }],
    markers: [],
    qqmap: null,
    showSetting: false,
    devices: [],
    isConnect: false,
    planeInfo: {},
    tx: "txElrs",
    rx: "rxElrs",
    gpsRawInt: {
      latitude: 0.0,
      longitude: 0.0,
      satelliteCount: 0,
      fixType: 0,
    },
    vrfHud: {
      speed: 0,
      altitude: 0,
      throttle: 0,
      heading: 0,
      vspeed: 0,
      airSpeed: 0
    },
    systemStatus: {
      voltage: 0.0,
      current: 0,
      used: 0,
    },
    heatBeat: {
      fm: "手动",
    },
    rcChannelRaw: {
      rssi: 0,
    },
    mode: "自稳",
    roll: 0,
    pitch: 0,
    yaw: 0,
    heading: 0,
    showlatitude: 0.0000000,
    showlongitude: 0.0000000,
    distance: 0.0,
    isInvert: false,
    isFollow: false,
    showLogin: false,
    showDetail: false,
    expanded: false,
    connectBleAddress: "",

  },
  toggleExpand: function () {
    this.setData({
      expanded: !this.data.expanded
    });
  },
  onPageTap: function () {
    if (this.data.expanded) {
      this.setData({
        expanded: false
      });
    }
  },

  trackPlane() {
    if (!this.data.isFollow) {
      Toast("已开启跟踪！")
    } else {
      Toast("已关闭跟踪！")
    }
    this.setData({
      isFollow: !this.data.isFollow
    });
  },
  openSetting() {
    this.setData({
      showSetting: !this.data.showSetting,
    });
  },
  showDetail() {
    this.setData({
      showDetail: !this.data.showDetail,
    });
  },
  findPlane() {
    this.qqmap.openMapApp({
      longitude: this.data.maps.lastLon,
      latitude: this.data.maps.lastLat,
      destination: "炸机位置"
    });
  },
  flyHistory() {
    Toast("下周开放");
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // setInterval(() => {
    //   const pitch = (Math.random() * 180 - 90).toFixed(1);  // 随机pitch值
    //   const roll = (Math.random() * 360 - 180).toFixed(1);  // 随机roll值
    //   this.setData({ pitch, roll });
    // }, 1000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.init();
    this.onMessage();

  },
  //蓝牙消息处理
  onMessage() {
    wx.onBLECharacteristicValueChange((result) => {
      protocol.processData(result.value);
    });
    message.onMessage((message) => {
      this.processData(message);
    });
  },
  //处理数据
  processData(message) {
    switch (message.type) {
      case "GPS_RAW_INT":
        let fixType = message.obj.fixType
        if (fixType > 2) {
          let lon = message.obj.lon;
          let lat = message.obj.lat;
          //位置未移动不绘制
          if (last_lon !== lon && last_lat !== lat) {
            last_lon = lon;
            last_lat = lat;
            let coord = coordtransform.wgs84togcj02(lon, lat)
            this.setData({
              gpsRawInt: {
                longitude: coord[0],
                latitude: coord[1],
                fixType: fixType,
                satelliteCount: message.obj.satelliteCount,
              },
            });
            //定位了才画线
            if (!isDrawing) {
              this.drawLine(coord)
            }
          }
        }

        break;
      case "SYS_STATUS":
        this.setData({
          systemStatus: {
            voltage: message.obj.voltage,
            current: message.obj.current,
            used: message.obj.used,
          },
        });
        break;
      case "VFR_HUD":
        this.setData({
          vrfHud: {
            speed: message.obj.speed.toFixed(2),
            altitude: message.obj.alt,
            throttle: message.obj.throttle || 0,
            heading: message.obj.heading,
            vspeed: message.obj.vspeed || 0,
            airSpeed: message.obj.airSpeed || 0
          },
        });
        break;
      case "ATTITUDE":
        this.setData({
          roll: message.obj.roll,
          pitch: message.obj.pitch,
          yaw: message.obj.yaw
        });
        break;
      case "RC_CHANNELS_RAW":
        this.setData({
          rcChannelRaw: {
            rssi: message.obj.rssi,
          },
        });
        break;
      case "HEARTBEAT":
        let fm = message.obj.mode;
        //获取上次模式
        if (fm != this.data.mode) {
          //播放声音
        }
        this.setData({
          mode: protocol.getFlightMode(message.obj.mode),
        });
        break;
    }
  },
  //获取用户授权
  getAuth() {
    wx.getSetting({
      success(res) {
        if (
          !res.authSetting["scope.bluetooth"] &&
          !res.authSetting["scope.userLocation"] &&
          !res.authSetting["scope.userInfo"]
        ) {
          wx.openSetting({
            success(res) {
              console.log(res.authSetting);
            },
          });
        }
      },
    });
  },
  //初始化
  init() {
    //开启蓝牙
    blue.start();
    //监听蓝牙状态
    this.listenBlueStatus();
    //获得授权
    this.getAuth();
    if (this.data.token === "" || this.data.token === undefined) {

    }
    this.qqmap = wx.createMapContext("map");
    this.getMylocation();
  },
  listenBlueStatus() {
    //扫描蓝牙
    connectController.addDevicesListen((device) => {
      const index = this.data.devices.findIndex(
        (item) => item.name === device.name
      );
      if (index < 0) {
        this.data.devices.push(device);
        this.setData({
          devices: this.data.devices,
        });
      }
    });
    //监听状态
    connectController.addConnectStateListen((data) => {
      switch (data.code) {
        case 200:
          Toast("连接成功");
          this.setData({
            isConnect: true,
          });
          wx.stopBluetoothDevicesDiscovery();
          break;
        case 500:
          Toast("已断开,正在重新连接");
          this.setData({
            isConnect: false,
            devices: []
          });
          blue.createBLEConnection(this.data.connectBleAddress);
          break;
        case -1:
          Toast("蓝牙不可用,请重新连接");
          this.setData({
            isConnect: false,
          });
          break;
        case 102:
          Toast.loading({
            duration: 0, // 持续展示 toast
            forbidClick: true,
            message: '正在连接',
          });
          break;
        case -2:
          Toast("连接失败");
          this.setData({
            isConnect: false,
          });
          break;
        default:
          this.setData({
            isConnect: false,
          });
          break;
      }
    });
  },
  getMylocation() {
    //获取位置
    wx.getLocation({
      type: "gcj02",
      isHighAccuracy: true,
      success: (result) => {
        let point = {
          latitude: result.latitude,
          longitude: result.longitude
        }
        points_map.push(point);
        this.setData({
          'polyline[0].points': points_map,
          latitude: result.latitude,
          longitude: result.longitude
        })
        this.drawMylocation(result);
        //初始化上次坐标
        last_lat = result.latitude;
        last_lon = result.longitude;
      },
      fail: (fail) => {
        Toast("获取定位失败");
      },
    });
  },
  //提示
  showToast(message) {
    Toast.loading({
      message: message,
      forbidClick: true,
      loadingType: "spinner",
    });
  },

  /**
   * 绘制我的位置和飞机位置
   * @param {*} data 坐标
   */
  drawMylocation(data) {
    this.setData({
      markers: [{
        id: 1,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        iconPath: "/images/ground/plane.png",
        width: 40,
        height: 40,
      }],
    });
  },
  /**
   * 画线和移动图标
   * @param {*} coord 坐标
   */
  drawLine(coord) {
    isDrawing = true;
    //移动marker
    this.qqmap.translateMarker({
      markerId: 1,
      destination: {
        latitude: parseFloat(coord[1]),
        longitude: parseFloat(coord[0]),
      },
      rotate: this.data.vrfHud.heading || 0,
      autoRotate: false,
      duration: 20,
      fail: (e) => {
        console.error("translateMarker", e);
      },
      complete() {
        isDrawing = false;
      }
    })
    if (this.data.maps.isPolyline) {
      //画轨迹线
      points_map.push({
        latitude: parseFloat(coord[1]),
        longitude: parseFloat(coord[0])
      });
      this.setData({
        'polyline[0].points': points_map
      });
    } else if (points_map.length >= 1) {
      points_map = [];
      this.setData({
        'polyline[0].points': points_map
      });
    }
    // 跟踪飞机位置
    if (this.data.isFollow) {
      this.qqmap.moveToLocation({
        latitude: parseFloat(coord[1]),
        longitude: parseFloat(coord[0])
      });
    }
    // 获取距离
    let distance = coordUtil.getDistance(coord[1], coord[0], this.data.latitude, this.data.longitude).toFixed(1);

    this.setData({
      distance: distance,
      showlongitude: coord[0].toFixed(7),
      showlatitude: coord[1].toFixed(7)
    });
    //保存最后位置
    this.data.maps.lastLon = last_lon
    this.data.maps.lastLat = last_lat
  },
  //连接蓝牙
  connect(e) {
    if (this.data.isConnect) {
      Dialog.confirm({
          title: "提示",
          message: "蓝牙已连接，确认断开吗?",
        })
        .then(() => {
          blue.closeBLEConnection();
        })
        .catch(() => {
          return;
        });
      return;
    }
    blue.createBLEConnection(e.detail);
    this.setData({
      createBLEConnection: e.detail
    })
  },
  //反转姿态球
  invertPitch() {
    Toast.loading({
      message: '设置反转...',
      forbidClick: true,
    });
  },
  //定位起飞位置
  moveToMyLocation() {
    //关闭飞机追踪
    if (this.data.isFollow) {
      this.setData({
        isFollow: !this.data.isFollow
      });
    }
    this.qqmap.moveToLocation({
      latitude: this.data.latitude,
      longitude: this.data.longitude
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // blue.closeBlue();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

});