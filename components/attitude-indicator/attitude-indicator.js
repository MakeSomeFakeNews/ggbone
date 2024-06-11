Component({
  properties: {
    pitch: {
      type: Number,
      value: 0
    },
    roll: {
      type: Number,
      value: 0
    }
  },
  data: {
    prevPitch: 0,
    prevRoll: 0,
    pitchMarks: Array.from({ length: 13 }, (_, i) => i * 20 - 120) // 生成从-120到120的刻度数组
  },
  lifetimes: {
    attached: function () {
      const query = wx.createSelectorQuery().in(this);
      query.select('#horizon')
        .fields({ node: true, size: true })
        .exec(this.initCanvas.bind(this));
    }
  },
  observers: {
    'pitch, roll': function (pitch, roll) {
      if (this.ctx) {
        pitch = parseInt(pitch);
        roll = parseInt(roll);
        if (Math.abs(pitch - this.data.prevPitch) > 1 || Math.abs(roll - this.data.prevRoll) > 1) {
          this.drawHorizon(pitch, roll);
          this.setData({ prevPitch: pitch, prevRoll: roll });
        }
      }
    }
  },
  methods: {
    initCanvas(res) {
      if (!res[0] || !res[0].node) {
        console.error('Failed to get canvas node');
        return;
      }
      
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;

      canvas.width = 100 * dpr;
      canvas.height = 100 * dpr;
      ctx.scale(dpr, dpr);

      this.canvas = canvas;
      this.ctx = ctx;
      this.drawHorizon(this.data.pitch, this.data.roll);
      this.setData({ prevPitch: this.data.pitch, prevRoll: this.data.roll });
    },
    drawHorizon(pitch, roll) {
      const { ctx, canvas } = this;
      const width = 100;
      const height = 100;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = width / 2;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.clip();
      ctx.closePath();

      const horizonY = centerY + pitch / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate(roll * Math.PI / 180);
      ctx.translate(-centerX, -centerY);

      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, width, horizonY);
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, horizonY, width, height - horizonY);

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      ctx.restore();

      this.drawPitchScale(ctx, centerX, centerY, radius, pitch, roll);
      this.drawFixedArrow(ctx, centerX, centerY, radius);
      this.drawRollValue(ctx, centerX, centerY, roll);
      this.drawPitchValue(ctx, centerX, centerY, pitch);
    },
    drawPitchScale(ctx, centerX, centerY, radius, pitch, roll) {
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial"; // 放大字体
      ctx.lineWidth = 1;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(roll * Math.PI / 180);
      ctx.translate(-centerX, -centerY);

      this.data.pitchMarks.forEach(mark => {
        const y = centerY - (mark - pitch) * 2 / 5;
        ctx.beginPath();

        if (mark % 40 === 0) {
          ctx.moveTo(centerX - 15, y); // 加长刻度线
          ctx.lineTo(centerX + 15, y); // 加长刻度线
          ctx.strokeStyle = "#000";
          ctx.stroke();
          // 只显示当前 pitch 对应的刻度值
        } else {
          ctx.moveTo(centerX - 10, y); // 加长刻度线
          ctx.lineTo(centerX + 10, y); // 加长刻度线
          ctx.strokeStyle = "#000";
          ctx.stroke();
        }
      });

      ctx.restore();
    },
    drawFixedArrow(ctx, centerX, centerY, radius) {
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 15);
      ctx.lineTo(centerX - 5, centerY - radius - 5);
      ctx.lineTo(centerX + 5, centerY - radius - 5);
      ctx.closePath();
      ctx.fill();
    },
    drawRollValue(ctx, centerX, centerY, roll) {
      ctx.fillStyle = "#ff0000"; // 醒目的颜色
      ctx.font = "bold 14px Arial"; // 放大字体
      ctx.textAlign = "center";
      ctx.fillText(`Roll: ${roll}`, centerX, centerY - 8); // 显示 roll 值在圆的上方
    },
    drawPitchValue(ctx, centerX, centerY, pitch) {
      ctx.fillStyle = "#ff0000"; // 醒目的颜色
      ctx.font = "bold 14px Arial"; // 放大字体
      ctx.textAlign = "center";
      ctx.fillText(`Pitch: ${pitch}`, centerX, centerY + 8); // 显示 pitch 值在圆的下方
    }
  }
});
