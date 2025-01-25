/**
 * 拼图游戏核心工具类
 */
class PuzzleGame {
  /**
   * 构造函数
   * @param {number} grid 网格大小
   * @param {string} imageUrl 图片URL
   */
  constructor(grid, imageUrl) {
    this.grid = grid;
    this.imageUrl = imageUrl;
    this.blocks = [];
    this.correctPositions = new Set(); // 记录正确位置的拼图块
    this.steps = 0;
    this.startTime = Date.now();
    this.init();
  }

  /**
   * 初始化拼图
   */
  init() {
    // 初始化拼图块位置
    for (let i = 0; i < this.grid * this.grid; i++) {
      this.blocks[i] = i;
    }
    this.shuffle(); // 随机打乱
    this.correctPositions.clear(); // 清空正确位置记录
    this.checkCorrectPositions(); // 检查初始正确位置
  }

  /**
   * 随机打乱拼图
   */
  shuffle() {
    let len = this.blocks.length;
    while (len > 1) {
      let randomPos = Math.floor(Math.random() * len);
      len--;
      [this.blocks[len], this.blocks[randomPos]] = 
      [this.blocks[randomPos], this.blocks[len]];
    }
  }

  /**
   * 交换两个位置的拼图块
   * @param {number} pos1 第一个位置
   * @param {number} pos2 第二个位置
   * @returns {boolean} 是否交换成功
   */
  swap(pos1, pos2) {
    // 如果任一位置的拼图已经正确，则不允许交换
    if (this.correctPositions.has(pos1) || this.correctPositions.has(pos2)) {
      return false;
    }

    // 交换位置
    [this.blocks[pos1], this.blocks[pos2]] = 
    [this.blocks[pos2], this.blocks[pos1]];
    
    this.steps++;
    
    // 检查交换后的位置是否正确
    this.checkPosition(pos1);
    this.checkPosition(pos2);
    
    return true;
  }

  /**
   * 检查指定位置的拼图块是否在正确位置
   * @param {number} position 要检查的位置
   */
  checkPosition(position) {
    if (this.blocks[position] === position) {
      this.correctPositions.add(position);
    } else {
      this.correctPositions.delete(position);
    }
  }

  /**
   * 检查所有拼图块的位置
   */
  checkCorrectPositions() {
    for (let i = 0; i < this.blocks.length; i++) {
      this.checkPosition(i);
    }
  }

  /**
   * 判断游戏是否完成
   * @returns {boolean}
   */
  isComplete() {
    return this.correctPositions.size === this.blocks.length;
  }

  /**
   * 获取游戏状态
   * @returns {Object}
   */
  getGameState() {
    return {
      blocks: this.blocks,
      correctPositions: Array.from(this.correctPositions),
      steps: this.steps,
      time: Math.floor((Date.now() - this.startTime) / 1000),
      isComplete: this.isComplete()
    };
  }

  /**
   * 重置游戏
   */
  reset() {
    this.steps = 0;
    this.startTime = Date.now();
    this.init();
  }
}

module.exports = PuzzleGame; 