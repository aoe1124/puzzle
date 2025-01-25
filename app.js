// app.js
App({
  globalData: {
    userInfo: null,
    systemInfo: null,
    theme: 'light',
    gameSettings: {
      sound: true,
      vibration: true,
      showPreview: true
    }
  },
  
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.globalData.userInfo = res.userInfo;
      }
    });
  },
  
  onShow() {
    // 从后台进入前台时执行
  },
  
  onHide() {
    // 从前台进入后台时执行
  }
}); 