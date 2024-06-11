// components/top/top.js
Component({
  options: {
    multipleSlots: true // 复数插槽: 是
  },


  properties: {
    topValue: {
      type: Object,
      value: {
        rssi: 0,
        gps: 0,
        used: 0,
        current: 0,
        voltage: 0,
        speed: 0,
        altitude: 0,
        fm: "自稳"
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})