// 音效管理器
const app = getApp();

class SoundManager {
  constructor() {
    // 初始化音效设置
    this.enabled = app.globalData.gameSettings.sound;
    
    // 创建音效实例
    this.moveAudio = wx.createInnerAudioContext();
    this.correctAudio = wx.createInnerAudioContext();
    this.completeAudio = wx.createInnerAudioContext();
    
    // 设置音效文件路径
    this.moveAudio.src = '/assets/audio/click.mp3';
    this.correctAudio.src = '/assets/audio/correct.mp3';
    this.completeAudio.src = '/assets/audio/complete.mp3';
    
    // 设置音量
    this.moveAudio.volume = 0.3;
    this.correctAudio.volume = 0.5;
    this.completeAudio.volume = 0.7;
  }

  // 播放移动音效
  playMove() {
    if (this.enabled) {
      this.moveAudio.stop();
      this.moveAudio.play();
    }
  }

  // 播放正确放置音效
  playCorrect() {
    if (this.enabled) {
      this.correctAudio.stop();
      this.correctAudio.play();
    }
  }

  // 播放完成音效
  playComplete() {
    if (this.enabled) {
      this.completeAudio.stop();
      this.completeAudio.play();
    }
  }

  // 销毁音效管理器
  destroy() {
    if (this.moveAudio) {
      this.moveAudio.destroy();
    }
    if (this.correctAudio) {
      this.correctAudio.destroy();
    }
    if (this.completeAudio) {
      this.completeAudio.destroy();
    }
  }
}

module.exports = SoundManager; 