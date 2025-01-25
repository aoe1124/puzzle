Page({
  data: {
    achievements: [],
    isLoading: true
  },

  onLoad() {
    this.loadAchievements()
  },

  // 加载成就数据
  loadAchievements() {
    // 模拟加载数据
    setTimeout(() => {
      this.setData({
        achievements: [
          {
            id: 1,
            title: '初次相遇',
            description: '完成第一次拼图',
            icon: '/images/achievement-first.png',
            isUnlocked: true
          },
          {
            id: 2,
            title: '速度之星',
            description: '在3分钟内完成一次拼图',
            icon: '/images/achievement-speed.png',
            isUnlocked: false
          },
          {
            id: 3,
            title: '收藏家',
            description: '完成10张不同的拼图',
            icon: '/images/achievement-collector.png',
            isUnlocked: false
          }
        ],
        isLoading: false
      })
    }, 1000)
  }
}) 