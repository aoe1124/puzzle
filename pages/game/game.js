// pages/game/game.js
const PuzzleGame = require('../../utils/puzzle');
const ImageProcessor = require('../../utils/imageProcessor');

Page({
  data: {
    grid: 3, // 默认3x3
    imageUrl: '', // 原图URL
    blockImages: [], // 切割后的图片数组
    blocks: [], // 拼图块的位置数组
    correctPositions: [], // 正确位置的拼图块
    steps: 0, // 移动步数
    time: 0, // 游戏时间（秒）
    isComplete: false, // 是否完成
    showPreview: false, // 是否显示预览图
    isPaused: false, // 是否暂停
    containerStyle: '', // 拼图容器样式
    blockStyle: '', // 拼图块样式
    dragBlock: null, // 当前拖动的块
    dragPosition: null, // 当前拖动的位置
  },

  game: null, // 游戏实例
  timer: null, // 计时器

  onLoad(options) {
    if (!options.imageUrl) {
      wx.showToast({
        title: '图片加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    const { grid, imageUrl } = options;
    this.setData({
      grid: parseInt(grid) || 3,
      imageUrl
    });
    this.initGame();
  },

  async initGame() {
    try {
      wx.showLoading({ title: '加载中...' });

      // 创建图片处理器实例
      const imageProcessor = new ImageProcessor(this.data.imageUrl);
      
      // 获取原图信息
      const imageInfo = await imageProcessor.getImageInfo();
      
      // 计算容器尺寸和样式
      const containerSize = this.calculateContainerSize(imageInfo.width, imageInfo.height);
      const containerStyle = `width: ${containerSize.width}px; height: ${containerSize.height}px; grid-template-columns: repeat(${this.data.grid}, 1fr);`;
      const blockStyle = `width: ${containerSize.width / this.data.grid}px; height: ${containerSize.height / this.data.grid}px;`;
      
      // 压缩图片
      const compressedImageUrl = await imageProcessor.compressImage(containerSize.width, containerSize.height);
      
      // 更新图片处理器实例使用压缩后的图片
      const processor = new ImageProcessor(compressedImageUrl);
      
      // 切割图片
      const blockImages = await processor.splitImage(this.data.grid);

      // 创建游戏实例
      this.game = new PuzzleGame(this.data.grid, compressedImageUrl);
      const gameState = this.game.getGameState();

      this.setData({
        blockImages,
        blocks: gameState.blocks,
        correctPositions: gameState.correctPositions,
        steps: gameState.steps,
        time: gameState.time,
        isComplete: gameState.isComplete,
        containerStyle,
        blockStyle
      });

      // 开始计时
      this.startTimer();

      wx.hideLoading();
    } catch (error) {
      console.error('游戏初始化失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '游戏初始化失败',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  // 计算拼图容器的尺寸
  calculateContainerSize(imageWidth, imageHeight) {
    // 获取屏幕宽度
    const screenWidth = wx.getSystemInfoSync().windowWidth;
    // 考虑页面边距
    const maxWidth = screenWidth - 40; // 左右各预留20px边距
    
    // 计算容器尺寸，保持原图比例
    const ratio = imageHeight / imageWidth;
    const width = maxWidth;
    const height = width * ratio;
    
    return { width, height };
  },

  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (!this.data.isPaused && !this.data.isComplete) {
        this.setData({
          time: this.data.time + 1
        });
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  onBlockTap(e) {
    if (this.data.isComplete || this.data.isPaused) return;

    const { position } = e.currentTarget.dataset;
    if (!this.game?.canMove(position)) return;

    if (this.game.move(position)) {
      const gameState = this.game.getGameState();
      this.setData({
        blocks: gameState.blocks,
        correctPositions: gameState.correctPositions,
        steps: gameState.steps,
        isComplete: gameState.isComplete
      });

      if (gameState.isComplete) {
        this.onGameComplete();
      }
    }
  },

  togglePreview() {
    this.setData({
      showPreview: !this.data.showPreview
    });
  },

  togglePause() {
    if (this.data.isComplete) return;
    this.setData({
      isPaused: !this.data.isPaused
    });
  },

  resetGame() {
    if (!this.game) return;
    this.game.reset();
    const gameState = this.game.getGameState();
    this.setData({
      blocks: gameState.blocks,
      correctPositions: gameState.correctPositions,
      steps: gameState.steps,
      time: gameState.time,
      isComplete: gameState.isComplete,
      isPaused: false,
      showPreview: false
    });
    this.startTimer();
  },

  onGameComplete() {
    this.stopTimer();
    // 保存游戏记录
    const record = {
      grid: this.data.grid,
      steps: this.data.steps,
      time: this.data.time,
      date: new Date().toISOString()
    };
    const records = wx.getStorageSync('gameRecords') || [];
    records.push(record);
    wx.setStorageSync('gameRecords', records);

    // 显示完成提示
    wx.showModal({
      title: '恭喜完成！',
      content: `用时：${this.data.time}秒\n步数：${this.data.steps}步`,
      confirmText: '再来一局',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          this.resetGame();
        } else {
          this.navigateBack();
        }
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  onUnload() {
    this.stopTimer();
  },

  // 开始拖动
  onBlockTouchStart(e) {
    if (this.data.isComplete || this.data.isPaused) return;
    
    const position = e.currentTarget.dataset.position;
    // 如果拼图块已经在正确位置，不允许拖动
    if (this.data.correctPositions.includes(position)) return;
    
    this.setData({
      dragBlock: position
    });
  },

  // 拖动中
  onBlockTouchMove(e) {
    if (this.data.dragBlock === null) return;
    
    // 获取当前触摸点在页面中的位置
    const touch = e.touches[0];
    
    // 获取被触摸的拼图块
    this.findBlockByPosition(touch.pageX, touch.pageY).then(targetBlock => {
      if (targetBlock !== null && targetBlock !== this.data.dragPosition) {
        // 更新目标位置的视觉效果
        this.setData({
          dragPosition: targetBlock
        });
      }
    });
  },

  // 结束拖动
  onBlockTouchEnd() {
    if (this.data.dragBlock === null) return;
    
    const fromPos = this.data.dragBlock;
    const toPos = this.data.dragPosition;
    
    // 清除拖动状态
    this.setData({
      dragBlock: null,
      dragPosition: null
    });
    
    // 如果有有效的目标位置，执行交换
    if (toPos !== null && fromPos !== toPos) {
      if (this.game.swap(fromPos, toPos)) {
        const gameState = this.game.getGameState();
        this.setData({
          blocks: gameState.blocks,
          correctPositions: gameState.correctPositions,
          steps: gameState.steps,
          isComplete: gameState.isComplete
        });

        if (gameState.isComplete) {
          this.onGameComplete();
        }
      }
    }
  },

  // 取消拖动
  onBlockTouchCancel() {
    if (this.data.dragBlock === null) return;
    
    // 清除拖动状态
    this.setData({
      dragBlock: null,
      dragPosition: null
    });
  },

  // 根据触摸位置找到对应的拼图块
  findBlockByPosition(pageX, pageY) {
    // 获取所有拼图块的位置信息
    const query = wx.createSelectorQuery();
    return new Promise(resolve => {
      query.selectAll('.puzzle-block').boundingClientRect(rects => {
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i];
          if (pageX >= rect.left && pageX <= rect.right &&
              pageY >= rect.top && pageY <= rect.bottom) {
            resolve(i);
            return;
          }
        }
        resolve(null);
      }).exec();
    });
  },
}); 