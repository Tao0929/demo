# 基于 Vue3 的高性能文件上传解决方案

一个功能完整、性能出色的文件上传组件，基于 Vue3 和 Element Plus 构建。支持大文件分片上传、断点续传和秒传功能，为用户提供流畅的文件上传体验。

## ✨ 特性

- 🚀 **大文件分片上传**：自动将大文件切片，分片并发上传，显著提升上传速度
- 🔄 **断点续传**：支持暂停/继续上传，意外中断后可从断点处恢复
- ⚡ **秒传功能**：基于文件 hash 检测，相同文件秒级上传
- 🎯 **上传进度**：精确的进度显示和状态反馈
- 🛡️ **可靠性**：完善的错误处理和状态管理
- 🎨 **优雅的 UI**：基于 Element Plus 的现代化界面设计

## 🛠️ 技术栈

- **前端框架**：Vue 3 + Vite
- **UI 组件库**：Element Plus
- **文件处理**：Spark-MD5（文件 hash 计算）
- **后端服务**：Express + express-fileupload

## 💡 核心功能实现

### 1. 分片上传

```javascript
// 配置分片大小
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

// 文件分片处理
const prepareUpload = (file, fileHash) => {
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  uploadChunks.value = Array.from({ length: chunks }, (_, index) => ({
    index,
    start: index * CHUNK_SIZE,
    end: Math.min((index + 1) * CHUNK_SIZE, file.size),
    status: 'pending'
  }));
};
```

### 2. 断点续传

- 支持暂停/继续上传操作
- 记录已上传分片信息
- 断点处继续上传

### 3. 秒传功能

- 使用 Spark-MD5 计算文件 hash
- 上传前检查文件是否已存在
- 秒级完成重复文件上传

## 🚀 快速开始

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **启动后端服务**
```bash
npm run server
```

## 📝 使用示例

```vue
<template>
  <UploadFile @upload-success="handleUploadSuccess" />
</template>

<script setup>
import UploadFile from './components/UploadFile.vue';

const handleUploadSuccess = () => {
  console.log('文件上传成功！');
};
</script>
```

## 🎯 特色亮点

1. **高性能**
   - 并发分片上传
   - 智能秒传判断
   - 优化的文件处理流程

2. **用户体验**
   - 直观的进度显示
   - 友好的操作反馈
   - 优雅的交互设计

3. **可靠性**
   - 完善的错误处理
   - 断点续传保障
   - 上传状态可控

## 🔮 后续规划

- [ ] 支持文件夹上传
- [ ] 添加上传队列管理
- [ ] 支持自定义分片大小
- [ ] 优化文件 hash 计算性能

## 📄 开源协议

MIT License