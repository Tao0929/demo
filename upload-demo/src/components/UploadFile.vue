<template>
  <div class="upload-container">
    <el-upload
      class="upload-drop"
      drag
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处或 <em>点击上传</em>
      </div>
    </el-upload>

    <div v-if="currentFile" class="upload-info">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文件名">
          {{ currentFile.name }}
        </el-descriptions-item>
        <el-descriptions-item label="文件大小">
          {{ formatFileSize(currentFile.size) }}
        </el-descriptions-item>
        <el-descriptions-item label="文件类型">
          {{ currentFile.raw.type || '未知' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="progress-info">
        <el-progress
          :percentage="uploadProgress"
          :status="uploadStatus"
          :stroke-width="10"
        />
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>

      <div class="upload-controls">
        <el-button
          type="primary"
          :disabled="!currentFile || isUploading || isExist"
          @click="startUpload"
          v-if="!isUploading"
        >
          开始上传
        </el-button>
        <el-button
          type="warning"
          @click="pauseUpload"
          v-if="isUploading && !isPaused"
        >
          暂停
        </el-button>
        <el-button
          type="primary"
          @click="resumeUpload"
          v-if="isPaused"
        >
          继续
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="uploadMessage"
      :title="uploadMessage"
      :type="uploadMessageType"
      show-icon
      :closable="false"
      class="upload-message"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import SparkMD5 from 'spark-md5';

// 配置参数
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB分片大小
const MAX_CONCURRENT_UPLOADS = 3; // 最大并发上传数

// 状态变量
const currentFile = ref(null);
const uploadChunks = ref([]);
const uploadProgress = ref(0);
const isUploading = ref(false);
const isExist = ref(false);
const isPaused = ref(false);
const uploadMessage = ref('');
const uploadMessageType = ref('info');

// 计算属性
const uploadStatus = computed(() => {
  if (uploadProgress.value === 100) return 'success';
  if (isPaused.value) return 'warning';
  if (isUploading.value) return '';
  return 'info';
});

// 文件选择处理
const handleFileChange = async (file) => {
    console.log({file})
  if (!file) return;
  currentFile.value = file;
  uploadChunks.value = [];
  uploadProgress.value = 0;
  isPaused.value = false;
  isUploading.value = false;
  uploadMessage.value = '';

  // 计算文件hash用于秒传
  const fileHash = await calculateHash(file.raw);
  
  // 检查是否可以秒传
  try {
    const response = await fetch('/demo/check-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: fileHash, fileName: file.name })
    });
    const result = await response.json();

    if (result.exists) {
      showMessage('文件已存在，秒传成功！', 'success');
      uploadProgress.value = 100;
      isExist.value = true;
      return;
    }
    isExist.value = false;
    // 准备分片上传
    prepareUpload(file.raw, fileHash);
  } catch (error) {
    showMessage('文件检查失败：' + error.message, 'error');
  }
};

// 计算文件hash
const calculateHash = (file) => {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      spark.append(e.target.result);
      resolve(spark.end());
    };
  });
};

// 准备上传
const prepareUpload = (file, fileHash) => {
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  uploadChunks.value = Array.from({ length: chunks }, (_, index) => ({
    index,
    start: index * CHUNK_SIZE,
    end: Math.min((index + 1) * CHUNK_SIZE, file.size),
    status: 'pending'
  }));
  console.log(uploadChunks.value)
};

const emit = defineEmits(['upload-success']);

// 开始上传
const startUpload = async () => {
  if (!currentFile.value) return;
  
  isUploading.value = true;
  isPaused.value = false;
  uploadMessage.value = '';
  isExist.value = 'false'

  const file = currentFile.value.raw;
  const fileHash = await calculateHash(file);

  try {
    // 获取已上传的分片信息
    const response = await fetch('/demo/upload-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: fileHash })
    });
    const { uploadedChunks } = await response.json();

    // 更新分片状态
    uploadedChunks.forEach(index => {
      uploadChunks.value[index].status = 'uploaded';
    });
    updateProgress();

    // 获取待上传的分片
    const pendingChunks = uploadChunks.value
      .filter(chunk => chunk.status === 'pending');

    // 使用队列控制并发上传
    for (let i = 0; i < pendingChunks.length; i += MAX_CONCURRENT_UPLOADS) {
      if (isPaused.value) break;
      
      const chunksGroup = pendingChunks.slice(i, i + MAX_CONCURRENT_UPLOADS);
      await Promise.all(chunksGroup.map(chunk => uploadChunk(file, chunk, fileHash)));
    }
    
    if (!isPaused.value) {
      await mergeRequest(fileHash, file.name);
      showMessage('上传成功！', 'success');
      uploadProgress.value = 100;
      emit('upload-success'); // 触发上传成功事件
    }
  } catch (error) {
    showMessage('上传失败：' + error.message, 'error');
  } finally {
    isUploading.value = false;
  }
};

// 上传单个分片
const uploadChunk = async (file, chunk, fileHash) => {
  if (isPaused.value) return;
  
  const formData = new FormData();
  formData.append('file', file.slice(chunk.start, chunk.end));
  formData.append('hash', fileHash);
  formData.append('chunkIndex', chunk.index);
  formData.append('chunks', uploadChunks.value.length);

  try {
    const response = await fetch('/demo/upload-chunk', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('分片上传失败');
    
    chunk.status = 'uploaded';
    updateProgress();
  } catch (error) {
    chunk.status = 'error';
    throw error;
  }
};

// 请求合并分片
const mergeRequest = async (fileHash, fileName) => {
  const response = await fetch('/demo/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash: fileHash, fileName })
  });

  if (!response.ok) {
    throw new Error('文件合并失败');
  }
};

// 暂停上传
const pauseUpload = () => {
  isPaused.value = true;
  isUploading.value = false;
};

// 继续上传
const resumeUpload = () => {
  startUpload();
};

// 更新进度
const updateProgress = () => {
  const uploaded = uploadChunks.value.filter(chunk => chunk.status === 'uploaded').length;
  uploadProgress.value = Math.round((uploaded / uploadChunks.value.length) * 100);
};

// 显示消息
const showMessage = (message, type) => {
  uploadMessage.value = message;
  uploadMessageType.value = type;
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};
</script>

<style scoped>
.upload-container {
  padding: 20px;
}

.upload-drop {
  width: 100%;
}

.upload-info {
  margin-top: 20px;
}

.progress-info {
  margin: 20px 0;
  position: relative;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -25px;
}

.upload-controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.upload-message {
  margin-top: 20px;
}
</style>