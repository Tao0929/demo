<template>
  <div class="app-container">
    <!-- 3D场景容器 -->
    <div class="scene-container" ref="sceneContainer"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <el-card class="panel-card">
        <template #header>
          <div class="panel-header">
            <h3>场景控制</h3>
          </div>
        </template>
        
        <!-- 场景控制选项 -->
        <div class="control-options">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-button type="primary" @click="toggleCameraMode">
                {{ isOrbitMode ? '第一人称视角' : '轨道控制模式' }}
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="success" @click="resetCamera">重置视角</el-button>
            </el-col>
          </el-row>
          
          <!-- 环境监测数据 -->
          <div class="monitor-data">
            <h4>环境监测</h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-statistic title="甲烷浓度" :value="1.2" :precision="2">
                  <template #suffix>%</template>
                </el-statistic>
              </el-col>
              <el-col :span="12">
                <el-statistic title="温度" :value="26.5" :precision="1">
                  <template #suffix>℃</template>
                </el-statistic>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 加载遮罩 -->
    <div class="loading-overlay" v-if="isLoading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import Stats from 'stats.js';
import { gsap } from 'gsap';

// 场景状态
const isLoading = ref(true);
const isOrbitMode = ref(true);
const sceneContainer = ref(null);

// Three.js 相关变量
let scene, camera, renderer, controls;
let orbitControls, pointerControls;
let stats;

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 10);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  sceneContainer.value.appendChild(renderer.domElement);

  // 创建控制器
  orbitControls = new OrbitControls(camera, renderer.domElement);
  pointerControls = new PointerLockControls(camera, renderer.domElement);

  // 添加性能监控
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // 添加地面
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.8,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 添加一些测试用的立方体
  const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.set(0, 1, 0);
  box.castShadow = true;
  scene.add(box);

  // 开始动画循环
  animate();
  
  // 延迟关闭加载遮罩
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  stats.begin();
  renderer.render(scene, camera);
  stats.end();
};

// 切换相机控制模式
const toggleCameraMode = () => {
  isOrbitMode.value = !isOrbitMode.value;
  if (isOrbitMode.value) {
    orbitControls.enabled = true;
    pointerControls.unlock();
  } else {
    orbitControls.enabled = false;
    pointerControls.lock();
  }
};

// 重置相机位置
const resetCamera = () => {
  gsap.to(camera.position, {
    x: 5,
    y: 5,
    z: 10,
    duration: 1,
    ease: 'power2.inOut'
  });
  if (isOrbitMode.value) {
    orbitControls.reset();
  }
};

// 窗口大小变化处理
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// 生命周期钩子
onMounted(() => {
  initScene();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (stats?.dom && stats.dom.parentNode) {
    stats.dom.parentNode.removeChild(stats.dom);
  }
});
</script>

<style>
.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.scene-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.control-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  z-index: 100;
}

.panel-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #303133;
}

.control-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.monitor-data {
  margin-top: 20px;
}

.monitor-data h4 {
  margin: 0 0 10px 0;
  color: #606266;
}

.loading-icon {
  font-size: 24px;
  margin-right: 10px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>