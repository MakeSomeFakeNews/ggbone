// components/footer/footer.js
Component({
  options: {
    multipleSlots: true // 复数插槽: 是
  },
  /**
   * 组件的属性列表
   */
  properties: {

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
    moveToMyLocation() {
      this.triggerEvent("moveToMyLocation")
    },
    openSetting() {
      this.triggerEvent("openSetting")
    }
  }
})