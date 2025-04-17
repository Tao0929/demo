import axios from 'axios';
interface TranslationMap {
    [key: string]: string | TranslationMap;
}
const DEEPSEEK_API_KEY = '**************************@@@'; // 需要替换为你的 DeepSeek API key
// 将嵌套对象扁平化为待翻译的文本数组
function flattenTranslationObject(obj: TranslationMap): string[] {
    const texts: string[] = [];
    
    function traverse(current: TranslationMap) {
        for (const key in current) {
            const value = current[key];
            if (typeof value === 'string' && /[\u4e00-\u9fa5]/.test(value)) {
                texts.push(value);
            } else if (typeof value === 'object') {
                traverse(value as TranslationMap);
            }
        }
    }
    
    traverse(obj);
    return texts;
}

// 使用翻译结果重建原始结构
function rebuildTranslationObject(obj: TranslationMap, translations: string[],): TranslationMap {
    let index = 0;
    const result: TranslationMap = {};
    
    function traverse(current: TranslationMap, target: TranslationMap) {
        for (const key in current) {
            const value = current[key];
            if (typeof value === 'string' && /[\u4e00-\u9fa5]/.test(value)) {
                target[key] = translations[index++];
            } else if (typeof value === 'object') {
                target[key] = {};
                traverse(value as TranslationMap, target[key] as TranslationMap);
            } else {
                target[key] = value;
            }
        }
    }
    
    traverse(obj, result);
    return result;
}

async function translateAPI(texts: string[], targetLang: string) {
    // 预处理：移除文本中的换行符
    const processedTexts = texts.map(text => text.replace(/\n/g, ' '));
    
    const messages = [{
        role: 'user',
        content: `请将以下内容翻译为${targetLang}，翻译语义切近于物联网行业,按顺序返回翻译结果，每个翻译结果占一行（请不要在翻译结果中使用换行符）：\n${processedTexts.join('\n')}`
    }];

    try {
        const response = await axios.post(
            'https://api.deepseek.com/chat/completions',
            {
                model: 'deepseek-chat',
                messages,
                temperature: 1.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        const result = response.data.choices[0].message.content.trim();
        console.log({result, targetLang});
        // 将结果按行分割，并确保每个翻译项都是单行文本
        const translatedTexts = result.split('\n').map((text: string) => text.replace(/\n/g, ' ').trim());
        return translatedTexts.length === texts.length ? translatedTexts : texts.map(() => '');
    } catch (error: any) {
        console.error('翻译失败:', error.response?.data || error.message);
        return texts.map(() => ''); // 失败时返回空值数组
    }
}

// 示例使用
export const  batchTranslate = async (sourceObj: TranslationMap, langCode: string): Promise<TranslationMap> => {
    console.log({sourceObj})
    // 1. 扁平化对象，获取所有需要翻译的文本
    const textsToTranslate = flattenTranslationObject(sourceObj);
    console.log({textsToTranslate, langCode})
    // 2. 这里需要调用实际的翻译API进行批量翻译
    const translations = await translateAPI(textsToTranslate, langCode);
    
    // 3. 使用翻译结果重建对象
    return rebuildTranslationObject(sourceObj, translations);
}