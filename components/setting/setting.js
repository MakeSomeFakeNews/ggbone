import {
  createStoreBindings
} from 'mobx-miniprogram-bindings'
import {
  mapStore
} from '../../stores/mapStore'
Component({
  options: {
    multipleSlots: true, // 复数插槽: 是
  },

  /**
   * 组件的属性列表
   */
  properties: {
    devices: Array,
    isConnect: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
    list: ['卫星地图', "轨迹线", "飞机雷达", "俯仰反转", "横滚反转"],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    connect(e) {
      const device = e.currentTarget.dataset.device;
      this.triggerEvent("connect", device.deviceId);
    },
    sendMessage(buff) {
      let device = wx.getStorageSync("deviceId");
      let service = wx.getStorageSync("serviceId");
      let characteristic = wx.getStorageSync("characteristicId");
      wx.writeBLECharacteristicValue({
        deviceId: device,
        serviceId: service,
        characteristicId: characteristic,
        value: buff.buffer,
        success(res) {
          console.log("发送成功", buff);
        },
      });
    },
    onCheckBoxChange(event) {
      console.log(event.detail);
      this.setCheckResult(event.detail);
    },

    toggle(event) {
      const {
        index
      } = event.currentTarget.dataset;
      const checkbox = this.selectComponent(`.checkboxes-${index}`);
      if (checkbox.data.name === "轨迹线") {
        this.setIsPolyline(!checkbox.data.value);
      }
      if (checkbox.data.name === "语音播报") {
        this.setIsVoice(!checkbox.data.value);
      }
      if (checkbox.data.name === "卫星地图") {
        this.setIsSatellite(!checkbox.data.value);
      }
      if (checkbox.data.name === "俯仰反转") {
        this.setIsInvertBall(!checkbox.data.value);
      }
      if (checkbox.data.name === "横滚反转") {
        this.setIsInvertRoll(!checkbox.data.value);
      }
      if (checkbox.data.name === "飞机雷达") {
        this.setRadar(!checkbox.data.value);
      }
      checkbox.toggle();
    },

    noop() {},
  },
  attached() {
    this.storeBindings = createStoreBindings(this, {
      namespace: "map",
      store: mapStore,
      fields: {
        isSatelliteMap: "isSatelliteMap",
        isPolyline: "isPolyline",
        isVoice: "isVoice",
        checkResult: "checkResult",
        isInvertRoll: "isInvertRoll",
        isInvertBall: "isInvertBall",
        radar: "radar"
      },
      actions: {
        setIsSatellite: "setIsSatelliteMap",
        setIsPolyline: "setIsPolyline",
        setIsVoice: "setIsVoice",
        setCheckResult: "setCheckResult",
        setIsInvertBall: "setIsInvertBall",
        setIsInvertRoll: "setIsInvertRoll",
        setRadar: "setRadar"
      },
    }, );
  }
});