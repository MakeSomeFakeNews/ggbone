// app.js
let socketMsgQueue = []
import {
  login
} from "./api/login"
import {
  setStorage,
  getStorage
} from "./utils/storage"
App({
  onLaunch() {
    // wx.showModal({
    //   title: '更新提示',
    //   content: '更新了姿态仪，现在显示更清晰直观了。新增了一个飞机雷达，方便天线角度的调整，能清楚的获取飞机相对方位。雷达中间的数值是计算出的平板天线的俯仰角补偿角度。可以在设置中进行开关',
    // })
    wx.setKeepScreenOn({
      keepScreenOn: true,
      fail: function () {
        wx.setKeepScreenOn({
          keepScreenOn: true
        });
      }
    });
    const account = wx.getAccountInfoSync()
    console.log("当前版本:", account.miniProgram.envVersion);
    // this.userLogin();
  },
  globalData: {
    userInfo: null,
    localSocket: {},
    callback: function () {}
  },
  // 用户登录
  userLogin() {
    wx.login({
      success: async (res) => {
        console.log(res);
        const result = await login({
          code: res.code
        });
        await setStorage("token", result.data);
        await this.initSocket(result.data);
      },
    })
  },
  initSocket(token) {
    let that = this
    that.globalData.localSocket = wx.connectSocket({
      url: `wss://wss.superbaby.cc/websocket?token=${getStorage("token")}`
    })
    that.globalData.localSocket.onOpen(function (res) {
      console.log('WebSocket连接已打开！readyState=' + that.globalData.localSocket.readyState)
      while (socketMsgQueue.length > 0) {
        var msg = socketMsgQueue.shift();
        that.sendSocketMessage(msg);
      }
    })
    that.globalData.localSocket.onMessage(function (res) {
      that.globalData.callback(res)
    })
    that.globalData.localSocket.onError(function (res) {
      console.log('readyState=' + that.globalData.localSocket.readyState)
    })
    that.globalData.localSocket.onClose(function (res) {
      console.log('WebSocket连接已关闭！readyState=' + that.globalData.localSocket.readyState)
      that.initSocket()
    })
  },
  //统一发送消息
  sendSocketMessage: function (msg) {
    if (this.globalData.localSocket.readyState === 1) {
      this.globalData.localSocket.send({
        data: msg
      })
    } else {
      socketMsgQueue.push(msg)
    }
  },
  onShow: function (options) {
    if (this.globalData.localSocket.readyState !== 0 && this.globalData.localSocket.readyState !== 1) {
      console.log('开始尝试连接WebSocket！readyState=' + this.globalData.localSocket.readyState)
      this.userLogin()
    }
  }
})