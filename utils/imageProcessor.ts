/// <reference path="../node_modules/miniprogram-api-typings/index.d.ts" />

/**
 * 图片处理工具类
 */
class ImageProcessor {
  /**
   * 将图片切割成网格
   * @param imageUrl 图片URL
   * @param grid 网格大小
   * @returns Promise<string[]> 返回切割后的图片URL数组
   */
  static async splitImage(imageUrl: string, grid: number): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const images: string[] = [];
      wx.getImageInfo({
        src: imageUrl,
        success: async (res) => {
          const canvasWidth = res.width;
          const canvasHeight = res.height;
          const blockWidth = Math.floor(canvasWidth / grid);
          const blockHeight = Math.floor(canvasHeight / grid);

          // 创建离屏画布
          const canvas = wx.createOffscreenCanvas({
            type: '2d',
            width: blockWidth,
            height: blockHeight
          });
          const ctx = canvas.getContext('2d');

          try {
            // 加载原图
            const image = canvas.createImage();
            await new Promise<void>((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
              image.src = imageUrl;
            });

            // 切割图片
            for (let i = 0; i < grid; i++) {
              for (let j = 0; j < grid; j++) {
                ctx.clearRect(0, 0, blockWidth, blockHeight);
                ctx.drawImage(
                  image,
                  j * blockWidth,
                  i * blockHeight,
                  blockWidth,
                  blockHeight,
                  0,
                  0,
                  blockWidth,
                  blockHeight
                );
                
                // 将画布内容转为临时文件
                const tempFilePath = await new Promise<string>((resolve, reject) => {
                  wx.canvasToTempFilePath({
                    canvas,
                    success: res => resolve(res.tempFilePath),
                    fail: reject
                  });
                });
                images.push(tempFilePath);
              }
            }
            resolve(images);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 压缩图片
   * @param imageUrl 图片URL
   * @param maxWidth 最大宽度
   * @param maxHeight 最大高度
   * @returns Promise<string> 返回压缩后的图片URL
   */
  static async compressImage(
    imageUrl: string,
    maxWidth: number = 1080,
    maxHeight: number = 1080
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imageUrl,
        success: async (res) => {
          const { width, height } = res;
          let targetWidth = width;
          let targetHeight = height;

          // 计算缩放比例
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            targetWidth = Math.floor(width * ratio);
            targetHeight = Math.floor(height * ratio);
          }

          // 创建离屏画布
          const canvas = wx.createOffscreenCanvas({
            type: '2d',
            width: targetWidth,
            height: targetHeight
          });
          const ctx = canvas.getContext('2d');

          try {
            // 加载原图
            const image = canvas.createImage();
            await new Promise<void>((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
              image.src = imageUrl;
            });

            ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
            
            // 将画布内容转为临时文件
            const tempFilePath = await new Promise<string>((resolve, reject) => {
              wx.canvasToTempFilePath({
                canvas,
                quality: 0.8,
                success: res => resolve(res.tempFilePath),
                fail: reject
              });
            });
            resolve(tempFilePath);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 添加图片边框
   * @param imageUrl 图片URL
   * @param borderWidth 边框宽度
   * @param borderColor 边框颜色
   * @returns Promise<string> 返回添加边框后的图片URL
   */
  static async addBorder(
    imageUrl: string,
    borderWidth: number = 2,
    borderColor: string = '#ffffff'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imageUrl,
        success: async (res) => {
          const { width, height } = res;
          
          // 创建离屏画布
          const canvas = wx.createOffscreenCanvas({
            type: '2d',
            width: width + borderWidth * 2,
            height: height + borderWidth * 2
          });
          const ctx = canvas.getContext('2d');

          try {
            // 绘制边框
            ctx.fillStyle = borderColor;
            ctx.fillRect(0, 0, width + borderWidth * 2, height + borderWidth * 2);

            // 加载原图
            const image = canvas.createImage();
            await new Promise<void>((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
              image.src = imageUrl;
            });

            ctx.drawImage(image, borderWidth, borderWidth, width, height);
            
            // 将画布内容转为临时文件
            const tempFilePath = await new Promise<string>((resolve, reject) => {
              wx.canvasToTempFilePath({
                canvas,
                success: res => resolve(res.tempFilePath),
                fail: reject
              });
            });
            resolve(tempFilePath);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
}

export default ImageProcessor; 