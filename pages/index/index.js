const app = getApp()

Page({
  data: {
    leftImages: [],
    rightImages: [],
    isLoading: false,
    showDifficulty: false,
    selectedDifficulty: 'easy',
    selectedImage: null,
    page: 1,
    pageSize: 6,
    columnHeights: {
      left: 0,
      right: 0
    },
    allImages: [
      // 自然风景
      {
        id: 'nature_001',
        url: '/images/puzzles/puzzle_nature_001.jpg',
        title: '小鹿在觅食',
        category: 'nature'
      },
      {
        id: 'nature_002',
        url: '/images/puzzles/puzzle_nature_002.jpg',
        title: '空山明月',
        category: 'nature'
      },
      {
        id: 'nature_003',
        url: '/images/puzzles/puzzle_nature_003.jpg',
        title: '自然风光',
        category: 'nature'
      },
      {
        id: 'nature_004',
        url: '/images/puzzles/puzzle_nature_004.jpg',
        title: '自然风光',
        category: 'nature'
      },
      {
        id: 'nature_005',
        url: '/images/puzzles/puzzle_nature_005.jpg',
        title: '自然风光',
        category: 'nature'
      },
      // 城市风光
      {
        id: 'city_001',
        url: '/images/puzzles/puzzle_city_001.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_002',
        url: '/images/puzzles/puzzle_city_002.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_003',
        url: '/images/puzzles/puzzle_city_003.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_004',
        url: '/images/puzzles/puzzle_city_004.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_005',
        url: '/images/puzzles/puzzle_city_005.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_006',
        url: '/images/puzzles/puzzle_city_006.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_007',
        url: '/images/puzzles/puzzle_city_007.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_008',
        url: '/images/puzzles/puzzle_city_008.jpg',
        title: '城市风光',
        category: 'city'
      },
      {
        id: 'city_009',
        url: '/images/puzzles/puzzle_city_009.jpg',
        title: '城市风光',
        category: 'city'
      },
      // 温馨家居
      {
        id: 'home_001',
        url: '/images/puzzles/puzzle_home_001.jpg',
        title: '温馨家居',
        category: 'home'
      },
      {
        id: 'home_002',
        url: '/images/puzzles/puzzle_home_002.jpg',
        title: '温馨家居',
        category: 'home'
      },
      // 卡通动漫
      {
        id: 'cartoon_001',
        url: '/images/puzzles/puzzle_cartoon_001.jpg',
        title: '卡通动漫',
        category: 'cartoon'
      },
      {
        id: 'cartoon_002',
        url: '/images/puzzles/puzzle_cartoon_002.jpg',
        title: '卡通动漫',
        category: 'cartoon'
      }
    ]
  },

  onLoad() {
    this.loadImages()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      leftImages: [],
      rightImages: []
    }, () => {
      this.loadImages()
    })
  },

  onReachBottom() {
    this.loadImages()
  },

  // 加载图片
  loadImages() {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    const start = (this.data.page - 1) * this.data.pageSize
    const end = start + this.data.pageSize
    const currentPageImages = this.data.allImages.slice(start, end)
    
    // 如果没有更多图片了
    if (currentPageImages.length === 0) {
      this.setData({ 
        isLoading: false 
      })
      wx.showToast({
        title: '已经到底啦',
        icon: 'none'
      })
      return
    }
    
    // 预加载图片获取实际尺寸
    const imageLoadPromises = currentPageImages.map(image => {
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: image.url,
          success: (res) => {
            // 计算等比缩放后的高度
            const containerWidth = wx.getSystemInfoSync().windowWidth * 0.48 // 考虑列宽48%
            const scale = containerWidth / res.width
            const height = res.height * scale
            resolve({
              ...image,
              height: height
            })
          },
          fail: (err) => {
            console.error('图片加载失败:', err)
            // 加载失败时使用默认高度
            resolve({
              ...image,
              height: 200
            })
          }
        })
      })
    })

    Promise.all(imageLoadPromises).then(imagesWithHeight => {
      const leftImages = [...this.data.leftImages]
      const rightImages = [...this.data.rightImages]
      const columnHeights = {
        left: this.data.columnHeights.left,
        right: this.data.columnHeights.right
      }
      
      // 瀑布流布局逻辑
      imagesWithHeight.forEach(image => {
        if (columnHeights.left <= columnHeights.right) {
          leftImages.push(image)
          columnHeights.left += image.height
        } else {
          rightImages.push(image)
          columnHeights.right += image.height
        }
      })
      
      this.setData({
        leftImages,
        rightImages,
        columnHeights,
        page: this.data.page + 1,
        isLoading: false
      })
      
      wx.stopPullDownRefresh()
    })
  },

  // 图片加载错误处理
  handleImageError(e) {
    const { column, index } = e.currentTarget.dataset
    const images = this.data[`${column}Images`]
    const errorImage = images[index]
    
    // 显示加载失败提示
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    })
    
    // 更新图片状态
    errorImage.loadError = true
    this.setData({
      [`${column}Images[${index}]`]: errorImage
    })
  },

  // 预览图片
  previewImage(e) {
    const image = e.currentTarget.dataset.image
    this.setData({
      selectedImage: image,
      showDifficulty: true
    })
  },

  // 选择难度
  selectDifficulty(e) {
    const difficulty = e.currentTarget.dataset.difficulty
    this.setData({
      selectedDifficulty: difficulty
    })
  },

  // 开始游戏
  startGame() {
    if (!this.data.selectedImage || !this.data.selectedDifficulty) return
    
    // 跳转到游戏页面，传递选中的图片和难度
    wx.navigateTo({
      url: `/pages/game/game?image=${JSON.stringify(this.data.selectedImage)}&difficulty=${this.data.selectedDifficulty}`
    })
    
    this.closeDifficulty()
  },

  // 关闭难度选择弹窗
  closeDifficulty() {
    this.setData({
      showDifficulty: false,
      selectedImage: null
    })
  },

  // 防止点击弹窗内容时关闭弹窗
  preventBubble() {
    return
  }
}) 