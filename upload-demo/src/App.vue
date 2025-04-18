<template>
  <div class="app-container">
    <el-tabs v-model="type">
      <el-tab-pane label="上传组件" name="upload"></el-tab-pane>
      <el-tab-pane label="canvans画画组件" name="canvas"></el-tab-pane>
      <el-tab-pane label="自定义按钮组件-保留@click事件" name="btns"></el-tab-pane>
      <el-tab-pane label="PermissionAndRole" name="PermissionAndRole"></el-tab-pane>
      <el-tab-pane label="PermissionAndRoleCard" name="PermissionAndRoleCard"></el-tab-pane>
    </el-tabs>
    <!-- 上传组件 -->
    <el-card class="upload-card" v-if="type == 'upload'">
      <template #header>
        <div class="card-header">
          <h2>文件上传示例</h2>
        </div>
      </template>
      <UploadFile @upload-success="handleUploadSuccess" />
      <FileList ref="fileListRef" />
    </el-card>
    <!-- canvas 组件 -->
    <el-card class="upload-card" v-if="type == 'canvas'">
      <template #header>
        <div class="card-header">
          <h2>canvas</h2>
        </div>
      </template>
      <PrototypeVisualization />
    </el-card>
    <!-- 自定义按钮组件 - 如何保留组件原有的事件 -->
    <el-card class="upload-card" v-if="type == 'btns'">
      <template #header>
        <div class="card-header">
          <h2>base-btns</h2>
        </div>
      </template>
      <!-- 自定义按钮组件 - @click 事件 -->
      <BaseButton
        label="提交表单"
        type="primary"
        @click="handleSubmit"
      />
      <BaseButton :loading="baseLoading" @click="baseLoadinghandler" label="loading按钮">
        <template #loading>
          <span class="custom-loading">⏳...</span>
        </template>
      </BaseButton>
    </el-card>
    <!-- PremissionAndRole.vue -->
    <el-card class="upload-card" v-if="type == 'PermissionAndRole'">
      <template #header>
        <div class="card-header">
          <h2>PermissionAndRole</h2>
        </div>
      </template>
      <!-- 自定义按钮组件 - @click 事件 -->
      <PermissionAndRole :initialPermissions="initialPermissionsData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UploadFile from './components/UploadFile.vue';
import FileList from './components/FileList.vue';
import PrototypeVisualization from './components/PrototypeVisualization.vue';
import BaseButton from './components/BaseButton.vue';
import PermissionAndRole from './components/PermissionAndRole.vue';

const initialPermissionsData = ['1814231274299858946', '1809053516761776130', 'permission_1825732902106435586']

const fileListRef = ref(null);
const baseLoading = ref(false)

const baseLoadinghandler = () => {
  baseLoading.value = true
  setTimeout(() => {
    baseLoading.value = false
    console.log('点击了按钮')
  }, 1000)
  
}
const type = ref('btns');

const handleUploadSuccess = () => {
    console.log('上传成功 - 刷新列表')
  fileListRef.value?.fetchFiles();
};

/** 测试 */
const handleSubmit = (event, ...rest) => {
  console.log('提交表单', event, rest)
}


</script>

<style>
.app-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.upload-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: #303133;
}
</style>