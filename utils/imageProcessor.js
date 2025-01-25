/**
 * 图片处理工具类
 */
class ImageProcessor {
  /**
   * 构造函数
   * @param {string} imageUrl 图片URL
   */
  constructor(imageUrl) {
    this.imageUrl = imageUrl;
  }

  /**
   * 压缩图片
   * @param {number} maxWidth 最大宽度
   * @param {number} maxHeight 最大高度
   * @returns {Promise<string>} 压缩后的图片临时路径
   */
  async compressImage(maxWidth = 500, maxHeight = 500) {
    try {
      // 获取图片信息
      const imageInfo = await this.getImageInfo();
      
      // 计算压缩比例
      const ratio = Math.min(
        maxWidth / imageInfo.width,
        maxHeight / imageInfo.height,
        1
      );
      
      // 如果不需要压缩，直接返回原图
      if (ratio >= 1) return this.imageUrl;

      // 计算压缩后的尺寸
      const targetWidth = Math.floor(imageInfo.width * ratio);
      const targetHeight = Math.floor(imageInfo.height * ratio);

      // 压缩图片
      return await this.canvasCompressImage(targetWidth, targetHeight);
    } catch (error) {
      console.error('压缩图片失败:', error);
      throw error;
    }
  }

  /**
   * 将图片分割成网格
   * @param {number} grid 网格大小
   * @returns {Promise<string[]>} 分割后的图片临时路径数组
   */
  async splitImage(grid) {
    try {
      // 获取图片信息
      const imageInfo = await this.getImageInfo();
      
      // 计算每个块的大小
      const blockWidth = Math.floor(imageInfo.width / grid);
      const blockHeight = Math.floor(imageInfo.height / grid);
      
      // 存储所有分割后的图片路径
      const blockImages = [];
      
      // 创建离屏画布
      const canvas = wx.createOffscreenCanvas({
        type: '2d',
        width: blockWidth,
        height: blockHeight
      });
      const ctx = canvas.getContext('2d');

      // 加载图片
      const image = canvas.createImage();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = this.imageUrl;
      });

      // 分割图片
      for (let i = 0; i < grid; i++) {
        for (let j = 0; j < grid; j++) {
          // 清空画布
          ctx.clearRect(0, 0, blockWidth, blockHeight);
          
          // 绘制对应区域的图片
          ctx.drawImage(
            image,
            j * blockWidth, i * blockHeight, // 源图像裁剪位置
            blockWidth, blockHeight, // 源图像裁剪大小
            0, 0, // 目标位置
            blockWidth, blockHeight // 目标大小
          );
          
          // 转换为临时文件
          const tempFilePath = await new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
              canvas,
              success: res => resolve(res.tempFilePath),
              fail: reject
            });
          });
          
          blockImages.push(tempFilePath);
        }
      }

      return blockImages;
    } catch (error) {
      console.error('分割图片失败:', error);
      throw error;
    }
  }

  /**
   * 获取图片信息
   * @returns {Promise<WechatMiniprogram.GetImageInfoSuccessCallbackResult>}
   */
  getImageInfo() {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: this.imageUrl,
        success: resolve,
        fail: reject
      });
    });
  }

  /**
   * 使用canvas压缩图片
   * @param {number} targetWidth 目标宽度
   * @param {number} targetHeight 目标高度
   * @returns {Promise<string>} 压缩后的图片临时路径
   */
  async canvasCompressImage(targetWidth, targetHeight) {
    // 创建离屏画布
    const canvas = wx.createOffscreenCanvas({
      type: '2d',
      width: targetWidth,
      height: targetHeight
    });
    const ctx = canvas.getContext('2d');

    // 加载图片
    const image = canvas.createImage();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = this.imageUrl;
    });

    // 绘制图片
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    // 转换为临时文件
    return await new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas,
        success: res => resolve(res.tempFilePath),
        fail: reject
      });
    });
  }
}

module.exports = ImageProcessor; 