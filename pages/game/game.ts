import PuzzleGame from '../../utils/puzzle';
import ImageProcessor from '../../utils/imageProcessor';

interface IGameData {
  grid: number;
  imageUrl: string;
  blockImages: string[];
  blocks: number[];
  emptyPos: number;
  steps: number;
  time: number;
  isComplete: boolean;
  showPreview: boolean;
  isPaused: boolean;
}

Page({
  data: {
    grid: 3, // 默认3x3
    imageUrl: '', // 原图URL
    blockImages: [], // 切割后的图片数组
    blocks: [], // 拼图块的位置数组
    emptyPos: -1, // 空白块的位置
    steps: 0, // 移动步数
    time: 0, // 游戏时间（秒）
    isComplete: false, // 是否完成
    showPreview: false, // 是否显示预览图
    isPaused: false, // 是否暂停
  } as IGameData,

  game: null as PuzzleGame | null, // 游戏实例
  timer: null as number | null, // 计时器

  onLoad(options: { grid: string; imageUrl: string }) {
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

      // 压缩图片
      const compressedImage = await ImageProcessor.compressImage(this.data.imageUrl);
      
      // 切割图片
      const blockImages = await ImageProcessor.splitImage(compressedImage, this.data.grid);
      
      // 为每个图片块添加边框
      const borderedImages = await Promise.all(
        blockImages.map(img => ImageProcessor.addBorder(img))
      );

      // 创建游戏实例
      this.game = new PuzzleGame(this.data.grid, this.data.imageUrl);
      const gameState = this.game.getGameState();

      this.setData({
        blockImages: borderedImages,
        blocks: gameState.blocks,
        emptyPos: gameState.emptyPos,
        steps: gameState.steps,
        time: gameState.time,
        isComplete: gameState.isComplete
      });

      // 开始计时
      this.startTimer();

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '游戏初始化失败',
        icon: 'none'
      });
      console.error('Game initialization failed:', error);
    }
  },

  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (!this.data.isPaused) {
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

  onBlockTap(e: any) {
    if (this.data.isComplete || this.data.isPaused) return;

    const { position } = e.currentTarget.dataset;
    if (!this.game?.canMove(position)) return;

    if (this.game.move(position)) {
      const gameState = this.game.getGameState();
      this.setData({
        blocks: gameState.blocks,
        emptyPos: gameState.emptyPos,
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
      emptyPos: gameState.emptyPos,
      steps: gameState.steps,
      time: gameState.time,
      isComplete: gameState.isComplete,
      isPaused: false
    });
  },

  onGameComplete() {
    this.stopTimer();
    wx.showModal({
      title: '恭喜完成！',
      content: `用时：${this.data.time}秒\n步数：${this.data.steps}步`,
      confirmText: '再来一局',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          this.resetGame();
          this.startTimer();
        } else {
          wx.navigateBack();
        }
      }
    });
  },

  onUnload() {
    this.stopTimer();
  }
}); 