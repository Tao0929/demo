<template>
  <div class="app-container">
    <el-card class="upload-card" v-if="type == 'upload'">
      <template #header>
        <div class="card-header">
          <h2>文件上传示例</h2>
        </div>
      </template>
      <UploadFile @upload-success="handleUploadSuccess" />
      <FileList ref="fileListRef" />
    </el-card>
    <el-card class="upload-card" v-if="type == 'canvas'">
      <template #header>
        <div class="card-header">
          <h2>canvas</h2>
        </div>
      </template>
      <PrototypeVisualization />
    </el-card>
    <el-card class="upload-card" v-if="type == 'btns'">
      <template #header>
        <div class="card-header">
          <h2>base-btns</h2>
        </div>
      </template>
      <BaseButton
        label="提交表单"
        type="primary"
        @click="handleSubmit"
      />
      <BaseButton :loading="true" @click="() => {
        console.log('点击了按钮')
      }">
        <template #loading>
          <span class="custom-loading">⏳ 加载中...</span>
        </template>
      </BaseButton>
    </el-card>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import UploadFile from './components/UploadFile.vue';
import FileList from './components/FileList.vue';
import PrototypeVisualization from './components/PrototypeVisualization.vue';
import BaseButton from './components/BaseButton.vue';

const fileListRef = ref(null);
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