import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { batchTranslate } from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_PATH = path.resolve(__dirname, '..');

/** 创建命令行交互界面 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/** 递归获取目录下所有 ts 文件 */ 
async function getAllTsFiles(dir: string): Promise<string[]> {
    const files = await fs.promises.readdir(dir);
    const tsFiles: string[] = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.promises.stat(fullPath);

        if (stat.isDirectory()) {
            const subFiles = await getAllTsFiles(fullPath);
            tsFiles.push(...subFiles);
        } else if (file === 'zh-CN.ts') {
            tsFiles.push(fullPath);
        }
    }

    return tsFiles;
}

/** 处理单个文件的翻译 */
async function translateFile(zhFilePath: string, langCode: string) {
    const content = await fs.promises.readFile(zhFilePath, 'utf-8');
    
    // 判断是否为 page 目录下的文件
    const isPageFile = zhFilePath.includes(path.join('page', ''));
    
    if (isPageFile) {
        // 处理 page 目录下的文件
        const lines = content.split('\n');
        const objectName = path.basename(path.dirname(zhFilePath)); // 获取目录名作为对象名
        
        // 找到对象初始化的行
        const initLine = lines.find(line => line.includes(`t.${objectName} = {}`));
        if (!initLine) return;

        // 构建对象
        const resultObj: any = {};
        resultObj[objectName] = {};
        
        // 提取所有属性赋值
        const regex = new RegExp(`t\\.${objectName}\\.(\\w+)\\s*=\\s*"([^"]+)"`, 'g');
        let match;
        while ((match = regex.exec(content)) !== null) {
            const [, key, value] = match;
            resultObj[objectName][key] = value;
        }

        // 翻译内容
        const translatedContent = await batchTranslate(resultObj, langCode);
        
        // 生成新文件内容
        const newContent = [
            `import { IObject } from "@/types/interface";`,
            `const t: IObject = {};`,
            `t.${objectName} = {};`
        ];

        // 添加翻译后的属性
        Object.entries(translatedContent[objectName]).forEach(([key, value]) => {
            newContent.push(`t.${objectName}.${key} = "${value}";`);
        });

        newContent.push('export default t;');
        
        // 写入新文件
        const newFilePath = zhFilePath.replace('zh-CN.ts', `${langCode}.ts`);
        await fs.promises.writeFile(newFilePath, newContent.join('\n'));
    } else {
        // 处理 lang 目录下的文件
        const match = content.match(/export\s+default\s+({[\s\S]*})/);
        if (!match) return;

        const zhContent = eval('(' + match[1] + ')');
        const translatedContent = await batchTranslate(zhContent, langCode);
        
        const newFilePath = zhFilePath.replace('zh-CN.ts', `${langCode}.ts`);
        const fileContent = `export default ${JSON.stringify(translatedContent, null, 4)}`;
        await fs.promises.writeFile(newFilePath, fileContent);
    }
}

export async function addNewLanguage() {
    try {
        // 询问用户新语言信息
        const langName = await new Promise(resolve => {
            rl.question('请输入要添加的语言中文名称（如：英语）: ', resolve);
        });
        
        const langCode: string = await new Promise(resolve => {
            rl.question('请输入对应的语言代码（如：en-US）: ', resolve);
        });

        console.log('开始翻译...');

        // 获取所有需要处理的文件
        const langFiles = await getAllTsFiles(path.join(BASE_PATH, 'lang'));
        const pageFiles = await getAllTsFiles(path.join(BASE_PATH, 'page'));
        const allFiles = [...langFiles, ...pageFiles];

        // 处理所有文件
        for (const file of allFiles) {
            console.log(`正在处理: ${file}`);
            await translateFile(file, langCode);
        }

        // 更新 index.ts
        const indexPath = path.join(BASE_PATH, 'index.ts');
        let indexContent = await fs.promises.readFile(indexPath, 'utf-8');

        // 添加导入语句
        const importStatement = `import ${langCode}Locale from './lang/${langCode}'\n`;
        indexContent = indexContent.replace(
            /(import.*from.*\n)(?!import)/,
            `$1${importStatement}`
        );

        // 添加到 messages 对象
        const messagesAddition = `    ${langCode}: {\n        ...${langCode}Locale\n    },\n`;
        indexContent = indexContent.replace(
            /(const messages = {\n)([^}]*)(\n})/,
            `$1$2    ${messagesAddition}$3`
        );

        // 更新 vantLocales 函数
        const vantLocalesAddition = `    } else if (lang === '${langCode}') {\n        Locale.use(lang, ${langCode}Locale)`;
        indexContent = indexContent.replace(
            /(function vantLocales.*?\{[\s\S]*?)(}\n)/,
            `$1${vantLocalesAddition}\n    $2`
        );

        await fs.promises.writeFile(indexPath, indexContent);

        console.log(`成功添加新语言 ${langName}(${langCode})！`);
    } catch (error) {
        console.error('发生错误:', error);
    } finally {
        rl.close();
    }
}

export default addNewLanguage;
addNewLanguage();