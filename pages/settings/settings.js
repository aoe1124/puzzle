const app = getApp()

Page({
  data: {
    settings: {
      sound: true,
      vibration: true,
      showPreview: true,
      theme: 'light'
    }
  },

  onLoad() {
    // 从全局数据获取设置
    this.setData({
      settings: app.globalData.gameSettings
    })
  },

  // 切换设置项
  toggleSetting(e) {
    const key = e.currentTarget.dataset.key
    const settings = this.data.settings
    settings[key] = !settings[key]
    
    this.setData({ settings })
    
    // 更新全局设置
    app.globalData.gameSettings = settings
    
    // 保存到本地
    wx.setStorageSync('gameSettings', settings)
  },

  // 切换主题
  switchTheme() {
    const theme = this.data.settings.theme === 'light' ? 'dark' : 'light'
    const settings = this.data.settings
    settings.theme = theme
    
    this.setData({ settings })
    app.globalData.theme = theme
    
    wx.setStorageSync('theme', theme)
  }
}) 