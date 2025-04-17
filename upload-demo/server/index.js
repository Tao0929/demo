import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 存储文件的目录
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const TEMP_DIR = path.join(__dirname, '../temp');

// 确保上传目录存在
[UPLOAD_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 设置CORS头
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 中间件配置
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 * 1024 }, // 50GB
    useTempFiles: true,
    tempFileDir: TEMP_DIR
}));

// API路由

// 检查文件是否已存在（用于秒传）
app.post('/demo/check-file', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { hash, fileName } = req.body;
    const fileExt = path.extname(fileName);
    const storedFileName = `${hash}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, storedFileName);
    res.json({ exists: fs.existsSync(filePath) });
});

// 获取已上传的分片信息
app.post('/demo/upload-info', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { hash } = req.body;
    const chunkDir = path.join(TEMP_DIR, hash);
    
    if (!fs.existsSync(chunkDir)) {
        return res.json({ uploadedChunks: [] });
    }

    const uploadedChunks = fs.readdirSync(chunkDir)
        .map(name => parseInt(name))
        .filter(name => !isNaN(name));

    res.json({ uploadedChunks });
});

// 上传分片
app.post('/demo/upload-chunk', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { hash, chunkIndex } = req.body;
    const chunk = req.files.file;
    const chunkDir = path.join(TEMP_DIR, hash);

    // 确保分片目录存在
    if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir, { recursive: true });
    }

    // 移动分片到临时目录
    const chunkPath = path.join(chunkDir, chunkIndex);
    chunk.mv(chunkPath, err => {
        if (err) {
            console.error('分片上传失败:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: '分片上传成功' });
    });
});

// 合并分片
app.post('/demo/merge', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let writeStream = null;
    try {
        const { hash, fileName } = req.body;
        const chunkDir = path.join(TEMP_DIR, hash);
        const fileExt = path.extname(fileName);
        const storedFileName = `${hash}${fileExt}`;
        const filePath = path.join(UPLOAD_DIR, storedFileName);

        // 确保分片目录存在
        if (!fs.existsSync(chunkDir)) {
            return res.status(400).json({ error: '没有找到分片文件' });
        }

        // 获取所有分片
        const chunks = fs.readdirSync(chunkDir)
            .map(name => parseInt(name))
            .filter(name => !isNaN(name))
            .sort((a, b) => a - b);

        // 创建写入流
        writeStream = fs.createWriteStream(filePath);

        // 按顺序合并分片
        for (const index of chunks) {
            const chunkPath = path.join(chunkDir, index.toString());
            const chunkData = await fs.promises.readFile(chunkPath);
            await new Promise((resolve, reject) => {
                writeStream.write(chunkData, err => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        // 关闭写入流
        await new Promise(resolve => writeStream.end(resolve));

        // 递归删除目录内的所有文件和子目录
        const deleteFolderRecursive = async (folderPath) => {
            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath);
                for (const file of files) {
                    const curPath = path.join(folderPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        await deleteFolderRecursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                }
                try {
                    fs.rmdirSync(folderPath);
                } catch (err) {
                    if (err.code === 'ENOTEMPTY') {
                        // 如果目录非空，等待一段时间后重试
                        await new Promise(resolve => setTimeout(resolve, 100));
                        await deleteFolderRecursive(folderPath);
                    } else {
                        throw err;
                    }
                }
            }
        };

        // 清理分片目录
        await deleteFolderRecursive(chunkDir);

        // 创建文件名到hash的映射文件，包含扩展名信息
        const mappingPath = path.join(UPLOAD_DIR, 'fileMapping.json');
        let mapping = {};
        if (fs.existsSync(mappingPath)) {
            mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
        }
        mapping[fileName] = {
            hash: hash,
            extension: fileExt,
            storedFileName: storedFileName
        };
        fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

        res.json({ message: '文件合并成功' });
    } catch (error) {
        // 确保在发生错误时关闭写入流
        if (writeStream) {
            writeStream.end();
        }
        console.error('文件合并失败:', error);
        res.status(500).json({ error: '文件合并失败: ' + error.message });
    }
});

// 获取文件列表
app.post('/demo/files-list', (req, res) => {
    try {
        const mappingPath = path.join(UPLOAD_DIR, 'fileMapping.json');
        if (!fs.existsSync(mappingPath)) {
            return res.json([]);
        }

        const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
        const files = [];
        for (const [fileName, fileInfo] of Object.entries(mapping)) {
            const filePath = path.join(UPLOAD_DIR, fileInfo.storedFileName);
            try {
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    files.push({
                        fileName,
                        size: stats.size,
                        uploadTime: stats.mtime,
                        hash: fileInfo.hash
                    });
                }
            } catch (err) {
                console.error(`获取文件信息失败: ${fileName}`, err);
                // 继续处理下一个文件
                continue;
            }
        }

        res.json(files);
    } catch (error) {
        console.error('获取文件列表失败:', error);
        res.status(500).json({ error: '获取文件列表失败' });
    }
});

// 下载文件
app.get('/demo/download/:hash', (req, res) => {
    try {
        const { hash } = req.params;
        const mappingPath = path.join(UPLOAD_DIR, 'fileMapping.json');
        const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
        
        // 查找对应的文件信息
        const fileEntry = Object.entries(mapping).find(([_, info]) => info.hash === hash);
        if (!fileEntry) {
            return res.status(404).json({ error: '文件不存在' });
        }

        const [originalFileName, fileInfo] = fileEntry;
        const filePath = path.join(UPLOAD_DIR, fileInfo.storedFileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '文件不存在' });
        }

        // 设置响应头
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(originalFileName)}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // 创建文件读取流并传输
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('文件下载失败:', error);
        res.status(500).json({ error: '文件下载失败' });
    }
});

// 删除文件
app.post('/demo/delete-file', (req, res) => {
    try {
        const { hash } = req.body;
        
        const mappingPath = path.join(UPLOAD_DIR, 'fileMapping.json');
        const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
        
        // 查找对应的文件信息
        const fileEntry = Object.entries(mapping).find(([_, info]) => info.hash === hash);
        if (!fileEntry) {
            return res.status(404).json({ error: '文件不存在' });
        }

        const [originalFileName, fileInfo] = fileEntry;
        const filePath = path.join(UPLOAD_DIR, fileInfo.storedFileName);
        const tempDir = path.join(TEMP_DIR, hash);

        // 删除临时目录（如果存在）
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }

        // 删除上传的文件（如果存在）
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 更新mapping文件
        delete mapping[originalFileName];
        fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

        res.json({ message: '文件删除成功' });
    } catch (error) {
        console.error('文件删除失败:', error);
        res.status(500).json({ error: '文件删除失败' });
    }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        console.log('----进入静态资源中间件')
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});