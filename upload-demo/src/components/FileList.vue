<template>
  <div class="file-list-container">
    <el-table :data="files" stripe style="width: 100%">
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="formattedSize" label="文件大小" width="120" />
      <el-table-column prop="formattedTime" label="上传时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="downloadFile(row.hash)"
          >
            下载
          </el-button>
          <el-button
            type="danger"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除文件 "{{ deleteFile?.fileName }}" 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 状态变量
const files = ref([]);
const deleteDialogVisible = ref(false);
const deleteFile = ref(null);

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString();
};

// 获取文件列表
const fetchFiles = async () => {
  try {
    const response = await fetch('/demo/files-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: "{}"
    });
    if (!response.ok) throw new Error('获取文件列表失败');
    const data = await response.json();
    files.value = data.map(file => ({
      ...file,
      formattedSize: formatFileSize(file.size),
      formattedTime: formatTime(file.uploadTime)
    }));
  } catch (error) {
    console.error('获取文件列表失败:', error);
    ElMessage.error('获取文件列表失败');
  }
};

// 下载文件
const downloadFile = async (hash) => {
  try {
    window.location.href = `/demo/download/${hash}`;
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

// 处理删除点击
const handleDelete = (file) => {
  deleteFile.value = file;
  deleteDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
    console.log(deleteFile.value.hash)
  try {
    const response = await fetch('/demo/delete-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: deleteFile.value.hash })
    });

    if (!response.ok) throw new Error('删除文件失败');
    
    ElMessage.success('删除成功');
    deleteDialogVisible.value = false;
    await fetchFiles(); // 刷新文件列表
  } catch (error) {
    console.error('删除文件失败:', error);
    ElMessage.error('删除文件失败');
  }
};

// 组件挂载时获取文件列表
onMounted(() => {
  fetchFiles();
});

// 暴露方法给父组件
defineExpose({
  fetchFiles
});
</script>

<style scoped>
.file-list-container {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>