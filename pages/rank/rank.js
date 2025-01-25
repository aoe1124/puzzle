Page({
  data: {
    rankList: [],
    isLoading: true
  },

  onLoad() {
    this.loadRankData()
  },

  // 加载排行榜数据
  loadRankData() {
    // 模拟加载数据
    setTimeout(() => {
      this.setData({
        rankList: [
          { rank: 1, avatar: '/images/default-avatar.png', nickname: '玩家1', score: 1000 },
          { rank: 2, avatar: '/images/default-avatar.png', nickname: '玩家2', score: 950 },
          { rank: 3, avatar: '/images/default-avatar.png', nickname: '玩家3', score: 900 }
        ],
        isLoading: false
      })
    }, 1000)
  }
}) 