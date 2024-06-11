const BLUE_STATE = require("./blueState.js");
const ConnectController = require("./controller.js");
let bleConnectDeviceID = null;

module.exports = {
  /**
   * 蓝牙连接状态：200-> 已连接；-1 ->未连接
   */
  connectState: -1,

  /**
   * 扫描蓝牙设备
   * @param onlyBind 是否单独绑定操作，默认false
   * @param module 设备模块，区分设备
   */
  start() {
    wx.openBluetoothAdapter({
      success: () => {
        this.startBluetoothDevicesDiscovery();
      },
      fail: (res) => {
        console.error("打开蓝牙适配器失败：", res);
        if (res.errCode === 10001) {
          if (res.state === 3) {
            ConnectController.connectStateListen(
              BLUE_STATE.NOBLUETOOTHPERMISSION
            );
          } else {
            ConnectController.connectStateListen(BLUE_STATE.UNAVAILABLE);
          }
        }
        // Android 系统特有，系统版本低于 4.3 不支持 BLE
        if (res.errCode === 10009) {
          ConnectController.connectStateListen(BLUE_STATE.VERSIONLOW);
        }
        if (res.errCode === 10008) {
          ConnectController.connectStateListen(BLUE_STATE.SYSTEMERROR);
        }
      },
      complete: () => {
        wx.offBluetoothAdapterStateChange();
        wx.onBluetoothAdapterStateChange((res) => {
          if (this._discoveryStarted) return;
          if (res.available) {
            this._discoveryStarted = res.discovering;
            ConnectController.connectStateListen(BLUE_STATE.SCANING);
            this.startBluetoothDevicesDiscovery();
          } else {
            // 蓝牙模块未开启
            ConnectController.connectStateListen(BLUE_STATE.UNAVAILABLE);
          }
        });
      },
    });
  },
  /**
   * 关闭蓝牙、初始化BLE状态
   */
  closeBlue() {
    if (bleConnectDeviceID) {
      wx.closeBLEConnection({
        deviceId: bleConnectDeviceID,
      });
    }
    bleConnectDeviceID = null;
    this.connectState = -1;
    this._discoveryStarted = false;
    // ConnectController.connectStateListen(BLUE_STATE.UNAVAILABLE);
    // wx.closeBluetoothAdapter();
    // wx.offBluetoothAdapterStateChange();
    // wx.offBLEConnectionStateChange();
    // wx.stopBluetoothDevicesDiscovery();
  },
  /**
   * 断开蓝牙
   */
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: bleConnectDeviceID,
      success: () => {
        bleConnectDeviceID = null;
        this.connectState = -1;
        ConnectController.connectStateListen(BLUE_STATE.DISCONNECT);
      },
    });
  },

  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return;
    }
    this._discoveryStarted = true;
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      interval: 1000,
      success: () => {
        this.onBluetoothDeviceFound();
        console.log("扫描中.....");
      },
      fail: (res) => {
        console.error("搜索外围设备失败--", res);
        const {
          locationAuthorized
        } = wx.getSystemInfoSync();
        if (
          (res.errCode === -1 &&
            (res.errno === 1509008 || res.errno === 1509009)) ||
          !locationAuthorized
        ) {
          this.closeBlue();
          ConnectController.connectStateListen(BLUE_STATE.NOLOCATIONPERMISSION);
        }
      },
    });
  },

  onBluetoothDeviceFound() {
    ConnectController.connectStateListen(BLUE_STATE.SCANING);

    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach((device) => {
        const deviceName = device.name || device.localName;
        if (!deviceName) return;
        ConnectController.devicesListen(device);
      });
    });
  },

  createBLEConnection(deviceId) {
    // if (bleConnectDeviceID == null) {
    bleConnectDeviceID = deviceId;
    ConnectController.connectStateListen(BLUE_STATE.CONNECTING);
    wx.createBLEConnection({
      deviceId: deviceId,
      success: () => {
        this.connectState = 200;
        ConnectController.connectStateListen({
          ...BLUE_STATE.CONNECTSUCCESS,
          deviceId,
        });
        this.onBLEConnectionStateChange();
        this.getBLEDeviceServices(deviceId);
      },
      fail: () => {
        ConnectController.connectStateListen(BLUE_STATE.CONNECTFAILED);
      },
    });
    // }
  },
  // 获取设备服务
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId, // 搜索到设备的 deviceId
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            let uuid = res.services[i].uuid;
            this.getBLEDeviceCharacteristics(deviceId, uuid);
          }
        }
      },
    });
  },
  // 获取设备特征值
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    console.log(deviceId, serviceId);
    wx.getBLEDeviceCharacteristics({
      deviceId, // 搜索到设备的 deviceId
      serviceId, // 上一步中找到的某个服务
      success: (res) => {
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i];
          if (item.properties.write) {
            // 该特征值可写
            // 本示例是向蓝牙设备发送一个 0x00 的 16 进制数据
            // 实际使用时，应根据具体设备协议发送数据
            let buffer = new ArrayBuffer(1);
            let dataView = new DataView(buffer);
            dataView.setUint8(0, 0);

            wx.writeBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              value: buffer,
              success(res) {
                console.log("发送成功");
                wx.setStorageSync("deviceId", deviceId);
                wx.setStorageSync("serviceId", serviceId);
                wx.setStorageSync("characteristicId", item.uuid);
                console.log(
                  "deviceId",
                  deviceId,
                  "serviceId",
                  serviceId,
                  "characteristicId",
                  item.uuid
                );
              },
              fail(res) {
                console.log("发送失败");
                console.log("writeBLECharacteristicValue fail", res.errMsg);
              },
              complete(res) {
                console.log("writeBLECharacteristicValue complete", res.errMsg);
                console.log("该方法完成");
              },
            });
          }

          if (item.properties.read) {
            // 改特征值可读
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            });
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            });
            // 必须先启用 wx.notifyBLECharacteristicValueChange 才能监听到设备 onBLECharacteristicValueChange 事件
          }
        }
      },
    });
    // 操作之前先监听，保证第一时间获取数据
  },

  onBLEConnectionStateChange() {
    wx.onBLEConnectionStateChange((res) => {
      if (!res.connected) {
        ConnectController.connectStateListen(BLUE_STATE.DISCONNECT);
        this.connectState = -1;
        this.closeBlue();
      }
    });
  },
};