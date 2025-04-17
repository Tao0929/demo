<template>
  <!-- 画布容器，包含canvas元素和控制按钮 -->
  <div class="canvas-container">
    <canvas ref="canvasRef" width="800" height="600"></canvas>
    <div class="controls">
      <el-button type="primary" @click="startAnimation" :disabled="isAnimating">开始动画</el-button>
      <el-button type="warning" @click="stopAnimation" :disabled="!isAnimating">停止动画</el-button>
    </div>
  </div>
</template>

<script setup>
/**
 * 小鸟飞行动画组件
 * 实现了一个小鸟在阳台周围飞行的动画效果
 * 包含阳台、小鸟、云朵和太阳等元素
 */

import { ref, onMounted, onUnmounted } from 'vue';

// 组件状态变量
const canvasRef = ref(null);  // canvas元素引用
const isAnimating = ref(false);  // 动画状态标志
let animationFrameId = null;  // requestAnimationFrame的ID
let angle = 0;  // 飞行角度
let wingAngle = 0;  // 翅膀摆动角度

// 画布上下文
let ctx;

// 场景位置配置参数
const balconyX = 50;  // 阳台X坐标
const balconyY = 480;  // 阳台Y坐标
const brickWidth = 600;  // 阳台宽度
const brickHeight = 60;  // 阳台高度
const radius = 150;  // 飞行半径

// 小鸟的初始位置
const birdStartX = balconyX + 150;  // 小鸟起始X坐标
const birdStartY = balconyY - 25;  // 小鸟起始Y坐标，贴近砖块表面

/**
 * 绘制阳台砖块
 * 包含主体砖块、纹理和顶部装饰
 */
const drawBalcony = () => {
  // 主体砖块
  ctx.fillStyle = '#B8860B';
  ctx.beginPath();
  ctx.rect(balconyX, balconyY, brickWidth, brickHeight);
  ctx.fill();

  // 砖块纹理
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 1;
  
  // 横向砖块纹理
  for (let i = 0; i <= brickHeight; i += 20) {
    ctx.beginPath();
    ctx.moveTo(balconyX, balconyY + i);
    ctx.lineTo(balconyX + brickWidth, balconyY + i);
    ctx.stroke();
  }

  // 竖向砖块纹理
  for (let i = 0; i <= brickWidth; i += 40) {
    ctx.beginPath();
    ctx.moveTo(balconyX + i, balconyY);
    ctx.lineTo(balconyX + i, balconyY + brickHeight);
    ctx.stroke();
  }

  // 阳台顶部装饰
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.rect(balconyX - 10, balconyY - 5, brickWidth + 20, 10);
  ctx.fill();
};

/**
 * 绘制小鸟
 * @param {number} x - 小鸟X坐标
 * @param {number} y - 小鸟Y坐标
 * @param {number} direction - 小鸟朝向角度
 */
const drawBird = (x, y, direction) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(direction);

  // 添加轻微的上下晃动效果
  const bobAmount = Math.sin(wingAngle * 0.5) * 2;
  ctx.translate(0, bobAmount);

  // 绘制身体 - 更扁平的椭圆
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.ellipse(0, 0, 25, 12, 0, 0, Math.PI * 4);
  ctx.fill();

  // 绘制尾部 - 更扁平的形状
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.save();
  ctx.translate(-20, 0);
  ctx.rotate(Math.PI / 6); // 30度角
  ctx.moveTo(0, 0);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 8);
  ctx.lineTo(0, 4);
  ctx.fill();
  ctx.restore();

  // 绘制翅膀 - 更简约的形状
  const wingOffset = Math.sin(wingAngle) * 8;
  ctx.fillStyle = '#66BB6A';
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(-15, -8 + wingOffset);
  ctx.lineTo(-12, 0);
  ctx.lineTo(0, 0);
  ctx.fill();

  // 绘制眼睛 - 更有神的效果
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(19, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1A237E';
  ctx.beginPath();
  ctx.arc(19.5, -2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // 眼睛高光
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(20, -2.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // 绘制喙 - 更自然的形状
  const beakGradient = ctx.createLinearGradient(24, 0, 30, 0);
  beakGradient.addColorStop(0, '#FFB300');
  beakGradient.addColorStop(1, '#FF8F00');
  ctx.fillStyle = beakGradient;
  ctx.beginPath();
  ctx.moveTo(24, -1.5);
  ctx.quadraticCurveTo(27, -0.5, 30, 0);
  ctx.quadraticCurveTo(27, 0.5, 24, 1.5);
  ctx.quadraticCurveTo(23, 0, 24, -1.5);
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

/**
 * 绘制云朵
 * @param {number} x - 云朵X坐标
 * @param {number} y - 云朵Y坐标
 * @param {number} size - 云朵大小
 */
const drawCloud = (x, y, size) => {
  ctx.fillStyle = '#ECF0F1';
  const circles = [
    { x: x, y: y, r: size },
    { x: x + size * 0.5, y: y - size * 0.2, r: size * 0.7 },
    { x: x + size, y: y, r: size * 0.8 },
    { x: x + size * 0.4, y: y + size * 0.2, r: size * 0.6 }
  ];
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.fill();
  });
};

/**
 * 绘制太阳
 * 包含太阳主体和光芒效果
 */
const drawSun = () => {
  const sunX = 100;
  const sunY = 100;
  
  // 绘制太阳主体
  ctx.fillStyle = '#F1C40F';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
  ctx.fill();
  
  // 绘制光芒
  ctx.strokeStyle = '#F1C40F';
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(sunX + Math.cos(angle) * 35, sunY + Math.sin(angle) * 35);
    ctx.lineTo(sunX + Math.cos(angle) * 45, sunY + Math.sin(angle) * 45);
    ctx.stroke();
  }
};

/**
 * 动画循环函数
 * 负责清除画布、重绘场景和更新小鸟位置
 */
const animate = () => {
  if (!isAnimating.value) return;

  // 清除画布
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  // 绘制背景元素
  drawSun();
  drawCloud(200, 150, 30);
  drawCloud(500, 100, 40);
  drawBalcony();

  // 更新小鸟位置和姿态
  angle += 0.02;
  wingAngle += 0.2;

  // 计算小鸟的自然飞行轨迹
  const horizontalSpeed = 10; // 水平飞行速度
  const verticalSpeed = 0.5; // 垂直上升速度
  const maxHeight = 200; // 最大上升高度
  
  // 计算水平位置
  const maxDistance = 400; // 最大水平飞行距离
  const horizontalProgress = Math.min(angle * horizontalSpeed * 5, maxDistance);
  const x = birdStartX + horizontalProgress;
  
  // 计算垂直位置，使用平滑的上升曲线
  const heightProgress = Math.min(angle / 10, 1); // 限制上升进度
  const smoothHeight = (1 - Math.cos(heightProgress * Math.PI)) / 2; // 平滑过渡
  const y = birdStartY - smoothHeight * maxHeight;
  
  // 计算自然的倾斜角度
  const tiltAngle = -Math.PI / 6 * smoothHeight; // 最大倾斜角度为30度
  
  // 绘制风的效果
  const drawWind = (strength) => {
    const windLines = 8; // 风线条数量
    const maxLength = 180; // 最大线条长度
    
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < windLines; i++) {
      const y = 100 + (i * 30);
      const length = maxLength * (0.5 + Math.random() * 0.5);
      const wave = Math.sin(Date.now() * 0.003 + i) * 10;
      
      ctx.beginPath();
      ctx.moveTo(balconyX + brickWidth + 50, y + wave);
      ctx.lineTo(balconyX + brickWidth + 50 - length, y);
      ctx.stroke();
    }
  };

  // 绘制小鸟，添加自然的倾斜效果
  ctx.save();
  if (x == 600) {
    drawWind()
  }
  ctx.translate(x, y);
  ctx.rotate(tiltAngle);
  
  // 添加轻微的上下晃动
  const bobAmount = Math.sin(wingAngle * 0.3) * 2;
  ctx.translate(0, bobAmount);
  
  drawBird(0, 0, 0);
  ctx.restore();

  // 继续动画循环
  animationFrameId = requestAnimationFrame(animate);
};

/**
 * 开始动画
 * 初始化状态并启动动画循环
 */
const startAnimation = () => {
  isAnimating.value = true;
  angle = 0;
  animate();
};

/**
 * 停止动画
 * 清理动画状态和取消动画帧
 */
const stopAnimation = () => {
  isAnimating.value = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};

// 组件生命周期钩子
onMounted(() => {
  // 初始化画布
  const canvas = canvasRef.value;
  ctx = canvas.getContext('2d');
  
  // 绘制初始场景
  drawBalcony();
  drawBird(birdStartX, birdStartY, 0);
});

// 组件卸载时清理资源
onUnmounted(() => {
  stopAnimation();
});
</script>

<style scoped>
/* 画布容器样式 */
.canvas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* 画布样式 */
canvas {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f5f5f5;
}

/* 控制按钮容器样式 */
.controls {
  display: flex;
  gap: 10px;
}
</style>