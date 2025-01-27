Page({
  data: {
    currentGrid: 3,
    rankList: [],
    isRefreshing: false,
    userInfo: null,
    hasUserInfo: false,
    shareImagePath: '' // 分享图片路径
  },

  onLoad() {
    // 检查是否已有用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
    this.loadRankData();
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于在排行榜中显示头像和昵称',
      success: (res) => {
        const userInfo = res.userInfo;
        // 保存用户信息
        wx.setStorageSync('userInfo', userInfo);
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });
        // 刷新排行榜数据
        this.loadRankData();
      },
      fail: (err) => {
        console.log('获取用户信息失败', err);
        wx.showToast({
          title: '需要授权才能参与排行',
          icon: 'none'
        });
      }
    });
  },

  // 加载排行榜数据
  loadRankData() {
    // 获取本地游戏数据
    const gameData = wx.getStorageSync('gameData') || {
      bestRecords: {
        3: { score: 0, time: Infinity, steps: Infinity, date: '' },
        4: { score: 0, time: Infinity, steps: Infinity, date: '' },
        5: { score: 0, time: Infinity, steps: Infinity, date: '' }
      },
      recentRecords: []
    };

    // 构建排行榜数据
    const rankList = [];
    
    // 添加自己的记录
    if (this.data.hasUserInfo) {
      rankList.push({
        avatarUrl: this.data.userInfo.avatarUrl,
        nickname: this.data.userInfo.nickName,
        score: gameData.bestRecords[this.data.currentGrid].score,
        time: gameData.bestRecords[this.data.currentGrid].time === Infinity ? 0 : gameData.bestRecords[this.data.currentGrid].time,
        steps: gameData.bestRecords[this.data.currentGrid].steps === Infinity ? 0 : gameData.bestRecords[this.data.currentGrid].steps,
        isSelf: true
      });
    }

    this.setData({
      rankList: rankList,
      isRefreshing: false
    });
  },

  // 切换难度
  switchDifficulty(e) {
    const grid = parseInt(e.currentTarget.dataset.grid);
    this.setData({ currentGrid: grid });
    this.loadRankData();
  },

  // 下拉刷新
  onRefresh() {
    this.setData({ isRefreshing: true });
    this.loadRankData();
  },

  // 生成分享图片
  async generateShareImage() {
    const ctx = wx.createCanvasContext('shareCanvas');
    const systemInfo = wx.getSystemInfoSync();
    const canvasWidth = 300;
    const canvasHeight = 200;
    
    // 绘制背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制标题
    ctx.setFillStyle('#2C3E50');
    ctx.setFontSize(16);
    ctx.setTextAlign('center');
    ctx.fillText('治愈系拼图', canvasWidth / 2, 40);
    
    // 绘制用户信息
    if (this.data.hasUserInfo) {
      const record = this.data.rankList[0] || {};
      const difficultyText = `${this.data.currentGrid}x${this.data.currentGrid}`;
      const scoreText = `${record.score || 0}分`;
      const detailText = `${record.steps || 0}步 · ${record.time || 0}秒`;
      
      ctx.setFontSize(14);
      ctx.fillText(difficultyText, canvasWidth / 2, 70);
      
      ctx.setFontSize(24);
      ctx.fillText(scoreText, canvasWidth / 2, 100);
      
      ctx.setFontSize(14);
      ctx.fillText(detailText, canvasWidth / 2, 130);
    }
    
    // 绘制邀请文案
    ctx.setFontSize(14);
    ctx.setFillStyle('#666666');
    ctx.fillText('点击进入挑战', canvasWidth / 2, 170);
    
    // 保存图片
    return new Promise((resolve, reject) => {
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: (res) => {
            this.setData({ shareImagePath: res.tempFilePath });
            resolve(res.tempFilePath);
          },
          fail: reject
        });
      });
    });
  },

  // 分享
  async onShareAppMessage() {
    if (!this.data.hasUserInfo) {
      return {
        title: '来挑战拼图游戏吧！',
        path: '/pages/index/index'
      };
    }

    // 生成分享图片
    try {
      const shareImagePath = await this.generateShareImage();
      const record = this.data.rankList[0] || {};
      const difficultyMap = {
        3: '休闲',
        4: '进阶',
        5: '挑战'
      };
      
      return {
        title: `我在${difficultyMap[this.data.currentGrid]}模式获得了${record.score || 0}分，敢来挑战吗？`,
        path: `/pages/index/index?from=share&grid=${this.data.currentGrid}&score=${record.score || 0}&uid=${this.data.userInfo.nickName}`,
        imageUrl: shareImagePath
      };
    } catch (err) {
      console.error('生成分享图片失败:', err);
      return {
        title: '来挑战拼图游戏吧！',
        path: '/pages/index/index'
      };
    }
  }
}); 