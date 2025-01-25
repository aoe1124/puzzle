// pages/game/game.js
Page({
  data: {
    imageInfo: null,
    difficulty: 'easy',
    isLoading: true
  },

  onLoad(options) {
    if (options.image && options.difficulty) {
      const imageInfo = JSON.parse(options.image)
      const difficulty = options.difficulty
      
      this.setData({
        imageInfo,
        difficulty,
        isLoading: false
      })
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  }
}) 