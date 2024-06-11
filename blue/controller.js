/**
 * 公用模块
 * 蓝牙连接控制器
 */
module.exports = {
  /**
   * 蓝牙连接状态
   */
  addConnectStateListen(callBackFunc) {
    this.common._connectStateCallBackFunc = callBackFunc;
  },
  connectStateListen(params) {
    if (this.common._connectStateCallBackFunc) {
      this.common._connectStateCallBackFunc(params);
    }
  },

  /**
   * 设备列表监听
   */
  addDevicesListen(callBackFunc) {
    this.common._devicesCallBackFunc = callBackFunc;
  },
  devicesListen(params) {
    if (this.common._devicesCallBackFunc) {
      this.common._devicesCallBackFunc(params);
    }
  },
  addTransferDataListen(callBack) {
    this.common.bleProgressDataCallBack = callBack;
  },
  transferDataListen(params) {
    if (this.common.bleProgressDataCallBack) {
      this.common.bleProgressDataCallBack(params);
    }
  },

  common: {
    _connectStateCallBackFunc: null,
    _devicesCallBackFunc: null,
    bleProgressDataCallBack: null,
  },
};