// 核心转换功能

/**
 * 智能检测文本中的标题行和其他说明
 * 标题行通常包含多个用分隔符分隔的字段名
 */
function detectHeaders(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let headerInfo = null;
    let dataLineIndex = -1;
    let otherNotes = [];
    
    // 第一步：找到标题行和数据行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 检测包含分隔符的行
        if (line.includes('|') || line.includes('---') || line.includes(':')) {
            let separator = '';
            let parts = [];
            
            if (line.includes('|')) {
                separator = '|';
                parts = line.split('|');
            } else if (line.includes('---')) {
                separator = '---';
                parts = line.split('---');
            } else if (line.includes(':')) {
                separator = ':';
                parts = line.split(':');
            }
            
            // 清理并过滤部分
            parts = parts.map(p => p.trim()).filter(p => p);
            
            // 如果有多个部分（至少2个），且每个部分都比较短（可能是标题）
            if (parts.length >= 2 && parts.every(p => p.length < 50)) {
                if (!headerInfo) {
                    // 第一个符合条件的是标题行
                    headerInfo = {
                        headers: parts,
                        separator: separator,
                        originalLine: line,
                        lineIndex: i
                    };
                } else if (dataLineIndex === -1) {
                    // 第二个符合条件的是数据行
                    dataLineIndex = i;
                    break;
                }
            }
        }
    }
    
    // 第二步：提取其他说明（不是标题行也不是数据行的文本）
    if (headerInfo) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // 跳过标题行和数据行
            if (i === headerInfo.lineIndex || i === dataLineIndex) {
                continue;
            }
            // 跳过包含分隔符的行（可能是其他数据）
            if (line.includes('|') || line.includes('---') || line.includes(':')) {
                continue;
            }
            // 收集其他说明文本
            if (line.length > 0) {
                otherNotes.push(line);
            }
        }
    }
    
    if (headerInfo) {
        headerInfo.otherNotes = otherNotes;
    }
    
    return headerInfo;
}

/**
 * 显示其他说明
 */
function displayNotes(notes) {
    const notesSection = document.getElementById('notesSection');
    const notesText = document.getElementById('notesText');
    
    if (notes && notes.length > 0) {
        notesText.innerHTML = notes.map(note => `<p>${escapeHtml(note)}</p>`).join('');
        notesSection.style.display = 'block';
    } else {
        notesSection.style.display = 'none';
    }
}

/**
 * 转义HTML特殊字符
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 切换其他说明的展开/收起
 */
function toggleNotes() {
    const notesContent = document.getElementById('notesContent');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (notesContent.style.display === 'none') {
        notesContent.style.display = 'block';
        toggleIcon.textContent = '▼';
    } else {
        notesContent.style.display = 'none';
        toggleIcon.textContent = '▶';
    }
}

/**
 * 自动识别标题并填充到输入框
 */
function autoDetectHeaders() {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
        showToast('请先输入文本！', 'warning');
        return;
    }
    
    const headerInfo = detectHeaders(inputText);
    
    if (headerInfo) {
        const headerText = headerInfo.headers.join(' | ');
        document.getElementById('headerInput').value = headerText;
        updateHeaderCount();
        
        // 显示其他说明
        if (headerInfo.otherNotes && headerInfo.otherNotes.length > 0) {
            displayNotes(headerInfo.otherNotes);
            showToast(`已识别标题和 ${headerInfo.otherNotes.length} 条说明！`, 'success');
        } else {
            displayNotes([]);
            showToast('已自动识别标题！', 'success');
        }
    } else {
        displayNotes([]);
        showToast('未检测到标题字段，请手动输入', 'info');
    }
}

/**
 * 清空标题输入框
 */
function clearHeaders() {
    document.getElementById('headerInput').value = '';
    updateHeaderCount();
    showToast('已清空标题', 'info');
}

/**
 * 更新标题计数显示
 */
function updateHeaderCount() {
    const headerInput = document.getElementById('headerInput').value.trim();
    const countElement = document.getElementById('headerCount');
    
    if (!headerInput) {
        countElement.textContent = '未设置标题';
        countElement.style.color = '#999';
        return;
    }
    
    // 检测分隔符并计算字段数
    let count = 0;
    if (headerInput.includes('|')) {
        count = headerInput.split('|').filter(h => h.trim()).length;
    } else if (headerInput.includes('---')) {
        count = headerInput.split('---').filter(h => h.trim()).length;
    } else if (headerInput.includes(':')) {
        count = headerInput.split(':').filter(h => h.trim()).length;
    } else {
        count = 1;
    }
    
    countElement.textContent = `已设置 ${count} 个字段`;
    countElement.style.color = '#667eea';
}

/**
 * 从标题输入框解析标题
 */
function parseHeadersFromInput() {
    const headerInput = document.getElementById('headerInput').value.trim();
    
    if (!headerInput) {
        return null;
    }
    
    let separator = '';
    let headers = [];
    
    if (headerInput.includes('|')) {
        separator = '|';
        headers = headerInput.split('|');
    } else if (headerInput.includes('---')) {
        separator = '---';
        headers = headerInput.split('---');
    } else if (headerInput.includes(':')) {
        separator = ':';
        headers = headerInput.split(':');
    } else {
        // 如果没有分隔符，假设只有一个标题
        headers = [headerInput];
        separator = '|';
    }
    
    headers = headers.map(h => h.trim()).filter(h => h);
    
    if (headers.length === 0) {
        return null;
    }
    
    return {
        headers: headers,
        separator: separator
    };
}

/**
 * 转换为分行格式
 * 支持 |、--- 和 : 分隔符
 */
function convertToLines() {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
        showToast('请先输入文本！', 'warning');
        return;
    }

    // 从标题输入框获取标题
    const headerInfo = parseHeadersFromInput();
    
    // 执行转换
    performConversion(inputText, headerInfo);
}

/**
 * 执行实际的转换操作（支持批量处理）
 */
function performConversion(inputText, headerInfo) {
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length === 0) {
        setOutput('', false);
        showToast('输入为空！', 'warning');
        return;
    }
    
    // 找出所有包含分隔符的数据行
    const dataLines = lines.filter(line => 
        line.includes('|') || line.includes('---') || line.includes(':')
    );
    
    if (dataLines.length === 0) {
        // 如果没有分隔符，保持原样
        setOutput(inputText, false);
        showToast('转换成功！已转换为分行格式', 'success');
        return;
    }
    
    // 批量处理每一行数据
    const results = [];
    let processedCount = 0;
    
    for (const dataLine of dataLines) {
        // 检测并处理不同的分隔符
        let parts = [];
        if (dataLine.includes('---')) {
            parts = dataLine.split('---');
        } else if (dataLine.includes('|')) {
            parts = dataLine.split('|');
        } else if (dataLine.includes(':')) {
            parts = dataLine.split(':');
        }
        
        // 清理部分
        parts = parts.map(part => part.trim()).filter(part => part);
        
        // 跳过空行或只有一个部分的行（可能是标题行）
        if (parts.length <= 1) {
            continue;
        }
        
        // 如果有标题信息，添加标题
        if (headerInfo && headerInfo.headers.length > 0) {
            const headers = headerInfo.headers;
            const formattedParts = parts.map((part, index) => {
                if (index < headers.length) {
                    return `${headers[index]}：${part}`;
                } else {
                    return part;
                }
            });
            results.push(formattedParts.join('\n'));
            results.push(''); // 添加空行分隔不同记录
        } else {
            // 没有标题，直接分行
            results.push(parts.join('\n'));
            results.push(''); // 添加空行分隔不同记录
        }
        
        processedCount++;
    }
    
    // 移除最后的空行
    if (results.length > 0 && results[results.length - 1] === '') {
        results.pop();
    }
    
    const finalResult = results.join('\n');
    setOutput(finalResult, headerInfo && headerInfo.headers.length > 0);
    
    if (processedCount > 1) {
        showToast(`转换成功！已处理 ${processedCount} 条记录`, 'success');
    } else if (processedCount === 1) {
        showToast('转换成功！', 'success');
    } else {
        showToast('未找到有效数据！', 'warning');
    }
}

// 当前选中的分隔符（默认为竖线）
let currentSeparator = '|';

/**
 * 处理文件上传
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // 检查文件类型
    if (!file.name.endsWith('.txt')) {
        showToast('请上传 .txt 文件！', 'warning');
        event.target.value = ''; // 清空文件选择
        return;
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        showToast('文件太大！请上传小于 5MB 的文件', 'warning');
        event.target.value = '';
        return;
    }
    
    // 读取文件内容
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('inputText').value = content;
        showToast(`已成功加载文件：${file.name}`, 'success');
        event.target.value = ''; // 清空文件选择，允许重复上传同一文件
    };
    
    reader.onerror = function() {
        showToast('文件读取失败！', 'error');
        event.target.value = '';
    };
    
    reader.readAsText(file, 'UTF-8');
}

/**
 * 切换分隔符菜单显示
 */
function toggleSeparatorMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('separatorMenu');
    menu.classList.toggle('show');
}

/**
 * 选择分隔符
 */
function selectSeparator(separator) {
    currentSeparator = separator;
    const menu = document.getElementById('separatorMenu');
    menu.classList.remove('show');
    
    // 更新所有选项的选中状态
    const options = document.querySelectorAll('.separator-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // 标记当前选中的选项
    event.target.closest('.separator-option').classList.add('selected');
    
    showToast(`已选择分隔符: ${getSeparatorName(separator)}`, 'info');
}

/**
 * 获取分隔符名称
 */
function getSeparatorName(separator) {
    const names = {
        '|': '竖线 |',
        '---': '三横线 ---',
        ':': '冒号 :'
    };
    return names[separator] || separator;
}

/**
 * 转换为压缩格式（单行）
 */
function convertToCompressed() {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
        showToast('请先输入文本！', 'warning');
        return;
    }

    const separatorType = currentSeparator;
    
    // 将多行文本按行分割
    const lines = inputText.split('\n')
        .map(line => line.trim())
        .filter(line => line); // 过滤空行

    if (lines.length === 0) {
        showToast('输入文本为空！', 'warning');
        return;
    }

    // 使用选定的分隔符连接
    let result;
    if (separatorType === '|') {
        result = lines.join(' | ');
    } else if (separatorType === '---') {
        result = lines.join('---');
    } else if (separatorType === ':') {
        result = lines.join(':');
    }

    setOutput(result);
    showToast('压缩成功！已转换为单行格式', 'success');
}

/**
 * 设置输出文本并更新统计信息
 * @param {string} text - 输出文本
 * @param {boolean} hasHeaders - 是否包含标题
 */
function setOutput(text, hasHeaders = false) {
    const outputTextarea = document.getElementById('outputText');
    
    if (!text) {
        outputTextarea.value = '';
        updateStats('');
        return;
    }
    
    outputTextarea.value = text;
    
    // 更新统计信息
    updateStats(text);
}

/**
 * 更新统计信息
 */
function updateStats(text) {
    if (!text) {
        document.getElementById('lineCount').textContent = '行数: 0';
        document.getElementById('charCount').textContent = '字符数: 0';
        return;
    }
    
    const lines = text.split('\n').filter(line => line.trim());
    const lineCount = lines.length;
    const charCount = text.length;
    
    document.getElementById('lineCount').textContent = `行数: ${lineCount}`;
    document.getElementById('charCount').textContent = `字符数: ${charCount}`;
}

/**
 * 复制输出文本到剪贴板
 */
function copyOutput() {
    const outputTextarea = document.getElementById('outputText');
    const outputText = outputTextarea.value.trim();
    
    if (!outputText) {
        showToast('没有可复制的内容！', 'warning');
        return;
    }

    navigator.clipboard.writeText(outputText).then(() => {
        showToast('复制成功！', 'success');
    }).catch(err => {
        // 降级方案：使用传统方法复制
        outputTextarea.select();
        try {
            document.execCommand('copy');
            showToast('复制成功！', 'success');
        } catch (e) {
            showToast('复制失败，请手动复制', 'error');
        }
    });
}

/**
 * 清空输入框
 */
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
    document.getElementById('headerInput').value = '';
    displayNotes([]);
    updateStats('');
    updateHeaderCount();
    showToast('已清空', 'info');
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 实时更新输入文本的统计信息
 */
document.getElementById('inputText').addEventListener('input', function() {
    // 可以在这里添加实时预览功能
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateStats('');
    updateHeaderCount();
    
    // 监听标题输入框变化
    const headerInput = document.getElementById('headerInput');
    if (headerInput) {
        headerInput.addEventListener('input', updateHeaderCount);
    }
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('separatorMenu');
        if (menu && !e.target.closest('.compress-button-wrapper')) {
            menu.classList.remove('show');
        }
    });
    
    // 设置默认选中的分隔符选项
    const defaultOption = document.querySelector('.separator-option');
    if (defaultOption) {
        defaultOption.classList.add('selected');
    }
    
    // 初始化拖拽上传
    initDragAndDrop();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter: 转换为分行
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convertToLines();
        }
        // Ctrl/Cmd + Shift + Enter: 压缩为单行
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            convertToCompressed();
        }
    });
});

/**
 * 初始化拖拽上传功能
 */
function initDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const dropOverlay = document.getElementById('dropOverlay');
    
    if (!dropZone || !dropOverlay) {
        return;
    }
    
    // 阻止默认拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // 拖拽进入
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, function() {
            dropZone.classList.add('drag-over');
            dropOverlay.classList.add('active');
        }, false);
    });
    
    // 拖拽离开
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, function() {
            dropZone.classList.remove('drag-over');
            dropOverlay.classList.remove('active');
        }, false);
    });
    
    // 文件放下
    dropZone.addEventListener('drop', function(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleDroppedFile(files[0]);
        }
    }, false);
}

/**
 * 处理拖拽上传的文件
 */
function handleDroppedFile(file) {
    // 检查文件类型
    if (!file.name.endsWith('.txt')) {
        showToast('请上传 .txt 文件！', 'warning');
        return;
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        showToast('文件太大！请上传小于 5MB 的文件', 'warning');
        return;
    }
    
    // 读取文件内容
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('inputText').value = content;
        showToast(`已成功加载文件：${file.name}`, 'success');
    };
    
    reader.onerror = function() {
        showToast('文件读取失败！', 'error');
    };
    
    reader.readAsText(file, 'UTF-8');
}

