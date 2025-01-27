// app.js
App({
  globalData: {
    userInfo: null,
    hasUserInfo: false,
    systemInfo: null,
    theme: 'light',
    gameSettings: {
      sound: true,
      showPreview: true
    }
  },
  
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 检查本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.hasUserInfo = true;
    } else {
      // 自动弹出授权窗口
      wx.getUserProfile({
        desc: '用于显示头像和昵称',
        success: (res) => {
          const userInfo = res.userInfo;
          // 保存到全局数据
          this.globalData.userInfo = userInfo;
          this.globalData.hasUserInfo = true;
          // 保存到本地存储
          wx.setStorageSync('userInfo', userInfo);
        },
        fail: (err) => {
          console.log('获取用户信息失败', err);
        }
      });
    }
  },
  
  // 获取用户信息的全局方法（用于重试获取用户信息）
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于显示头像和昵称',
        success: (res) => {
          const userInfo = res.userInfo;
          // 保存到全局数据
          this.globalData.userInfo = userInfo;
          this.globalData.hasUserInfo = true;
          // 保存到本地存储
          wx.setStorageSync('userInfo', userInfo);
          resolve(userInfo);
        },
        fail: (err) => {
          console.log('获取用户信息失败', err);
          reject(err);
        }
      });
    });
  },
  
  onShow() {
    // 从后台进入前台时执行
  },
  
  onHide() {
    // 从后台进入后台时执行
  }
}); 