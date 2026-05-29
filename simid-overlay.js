/**
 * SIMID Discount Card Creative
 * 版本：1.0.0
 * 用途：在视频上展示商品折扣卡片（半透明，底部居中），点击按钮跳转。
 * 使用：上传此文件到 HTTPS 服务器，并在 VAST 4.x 中通过 <InteractiveCreativeFile> 引用。
 */

(function() {
  class DiscountCardCreative {
    constructor() {
      this.overlay = null;
      this.adSession = null;
      this.videoElement = null;
      this.environment = null;
      console.log('[SIMID] 创意实例已创建');
    }

    /**
     * SIMID 生命周期：初始化创意
     * @param {Object} adSession - SIMID 广告会话
     */
    init(adSession) {
      console.log('[SIMID] init 被调用');
      this.adSession = adSession;
      this.videoElement = adSession.getMediaElement();
      this.environment = adSession.getEnvironment();

      // 等待视频元数据就绪后创建蒙层（确保容器尺寸正确）
      if (this.videoElement.readyState >= 1) {
        this._createOverlay();
      } else {
        this.videoElement.addEventListener('loadedmetadata', () => {
          console.log('[SIMID] 视频元数据就绪');
          this._createOverlay();
        });
      }

      // 播放时显示蒙层
      this.videoElement.addEventListener('play', () => {
        if (this.overlay) this.overlay.style.display = 'flex';
      });

      // 视频结束时可选择隐藏（这里保留，按需修改）
      this.videoElement.addEventListener('ended', () => {
        if (this.overlay) this.overlay.style.display = 'none';
        this.adSession.complete();
        console.log('[SIMID] 广告完成');
      });
    }

    /**
     * 创建折扣卡片 DOM 并插入到 SIMID 容器
     */
    _createOverlay() {
      if (this.overlay) return;
      const slot = this.environment.getSlotElement();
      if (!slot) {
        console.error('[SIMID] 无法获取 slot 元素，蒙层创建失败');
        return;
      }

      // 外层蒙层容器（覆盖整个视频，透明，底部对齐）
      const overlay = document.createElement('div');
      overlay.className = 'simid-discount-overlay';
      overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        pointer-events: none;
        z-index: 9999;
      `;

      // 卡片本身
      overlay.innerHTML = `
        <div style="
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 18px 18px 0 0;
          padding: 18px 20px 16px;
          color: #fff;
          text-align: center;
          width: 90%;
          max-width: 400px;
          margin-bottom: 20px;
          pointer-events: auto;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
        ">
          <div style="font-size:1.15rem; font-weight:700; margin-bottom:4px;">
            🎧 高品质降噪耳机
          </div>
          <div style="font-size:2.4rem; font-weight:800; color:#FFD700; line-height:1.2;">
            ¥199
            <span style="font-size:0.9rem; text-decoration:line-through; color:#aaa; font-weight:400;">¥499</span>
          </div>
          <div style="font-size:0.85rem; color:#FF6B6B; margin:4px 0 8px;">
            ⚡ 限时5折 · 仅限今日
          </div>
          <button id="simid-cta-btn" style="
            background: linear-gradient(135deg, #FF6B35, #FF8C42);
            border: none;
            color: white;
            padding: 12px 36px;
            font-size: 1rem;
            font-weight: 700;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255,107,53,0.4);
            letter-spacing: 0.5px;
            transition: transform 0.1s;
          ">
            立即抢购
          </button>
        </div>
      `;

      slot.appendChild(overlay);
      this.overlay = overlay;
      console.log('[SIMID] 蒙层卡片已创建并插入 DOM');

      // 绑定按钮点击：调用 SIMID 的 click 方法跳转
      const ctaBtn = overlay.querySelector('#simid-cta-btn');
      if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('[SIMID] 按钮点击 - 触发点击跳转');
          try {
            this.adSession.click('https://www.example.com/product/headphone?ref=simid');
          } catch (err) {
            console.error('[SIMID] click 调用失败', err);
            // 降级方案：尝试打开新窗口（可能被拦截）
            window.open('https://www.example.com/product/headphone?ref=simid', '_blank');
          }
        });
        // 移动端触摸反馈
        ctaBtn.addEventListener('touchstart', () => ctaBtn.style.transform = 'scale(0.95)');
        ctaBtn.addEventListener('touchend', () => ctaBtn.style.transform = 'scale(1)');
      }
    }

    /** SIMID 生命周期：展示开始 */
    startImpression() {
      console.log('[SIMID] 展示开始');
    }

    /** SIMID 生命周期：停止创意，清理资源 */
    stop() {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
        console.log('[SIMID] 蒙层已移除');
      }
    }
  }

  // 将创意类暴露到全局，供 SIMID 播放器实例化
  window.SIMIDCreative = DiscountCardCreative;
})();