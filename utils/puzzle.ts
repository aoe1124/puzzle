/**
 * 拼图游戏核心工具类
 */
class PuzzleGame {
  private grid: number; // 网格大小 (3x3, 4x4, 5x5)
  private blocks: number[]; // 拼图块的位置数组
  private emptyPos: number; // 空白块的位置
  private steps: number; // 移动步数
  private startTime: number; // 开始时间
  private imageUrl: string; // 图片URL

  /**
   * 构造函数
   * @param grid 网格大小
   * @param imageUrl 图片URL
   */
  constructor(grid: number, imageUrl: string) {
    this.grid = grid;
    this.imageUrl = imageUrl;
    this.blocks = [];
    this.steps = 0;
    this.startTime = Date.now();
    this.init();
  }

  /**
   * 初始化拼图
   */
  private init(): void {
    // 初始化拼图块位置
    for (let i = 0; i < this.grid * this.grid; i++) {
      this.blocks[i] = i;
    }
    this.emptyPos = this.blocks.length - 1; // 最后一个位置为空白
    this.shuffle(); // 随机打乱
  }

  /**
   * 随机打乱拼图
   * 使用 Fisher-Yates 洗牌算法，确保拼图有解
   */
  private shuffle(): void {
    let len = this.blocks.length;
    while (len > 1) {
      let randomPos = Math.floor(Math.random() * len);
      len--;
      // 交换位置
      [this.blocks[len], this.blocks[randomPos]] = 
      [this.blocks[randomPos], this.blocks[len]];
    }
    
    // 如果当前状态无解，则交换任意两个非空白块
    if (!this.isSolvable()) {
      let pos1 = 0, pos2 = 1;
      if (this.blocks[pos1] === this.blocks.length - 1) pos1 = 2;
      if (this.blocks[pos2] === this.blocks.length - 1) pos2 = 2;
      [this.blocks[pos1], this.blocks[pos2]] = [this.blocks[pos2], this.blocks[pos1]];
    }

    // 更新空白块位置
    this.emptyPos = this.blocks.indexOf(this.blocks.length - 1);
  }

  /**
   * 判断当前拼图状态是否有解
   * 对于N*N的拼图：
   * - N为奇数时：逆序数必须为偶数
   * - N为偶数时：逆序数加空格所在行数（从底部数）的和必须为偶数
   */
  private isSolvable(): boolean {
    let inversions = 0;
    for (let i = 0; i < this.blocks.length - 1; i++) {
      for (let j = i + 1; j < this.blocks.length; j++) {
        if (this.blocks[i] !== this.blocks.length - 1 && 
            this.blocks[j] !== this.blocks.length - 1 && 
            this.blocks[i] > this.blocks[j]) {
          inversions++;
        }
      }
    }

    if (this.grid % 2 === 1) {
      // 奇数网格
      return inversions % 2 === 0;
    } else {
      // 偶数网格
      const emptyRowFromBottom = Math.floor(this.emptyPos / this.grid);
      return (inversions + emptyRowFromBottom) % 2 === 0;
    }
  }

  /**
   * 判断是否可以移动指定位置的块
   * @param pos 要移动的块的位置
   */
  canMove(pos: number): boolean {
    // 判断是否在空白块的上下左右
    const row = Math.floor(pos / this.grid);
    const col = pos % this.grid;
    const emptyRow = Math.floor(this.emptyPos / this.grid);
    const emptyCol = this.emptyPos % this.grid;

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  }

  /**
   * 移动指定位置的块
   * @param pos 要移动的块的位置
   * @returns 是否移动成功
   */
  move(pos: number): boolean {
    if (!this.canMove(pos)) return false;

    // 交换位置
    [this.blocks[pos], this.blocks[this.emptyPos]] = 
    [this.blocks[this.emptyPos], this.blocks[pos]];
    this.emptyPos = pos;
    this.steps++;

    return true;
  }

  /**
   * 判断游戏是否完成
   */
  isComplete(): boolean {
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i] !== i) return false;
    }
    return true;
  }

  /**
   * 获取游戏状态
   */
  getGameState() {
    return {
      blocks: this.blocks,
      emptyPos: this.emptyPos,
      steps: this.steps,
      time: Math.floor((Date.now() - this.startTime) / 1000),
      isComplete: this.isComplete()
    };
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.steps = 0;
    this.startTime = Date.now();
    this.init();
  }
}

export default PuzzleGame; 