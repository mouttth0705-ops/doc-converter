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
 * 更新Roxy平台账号预览
 */
function updateRoxyPreview(headerInfo, dataLine) {
    const previewSection = document.getElementById('roxyPreview');
    
    if (!headerInfo || !headerInfo.headers || headerInfo.headers.length === 0) {
        // 没有标题，隐藏预览
        previewSection.style.display = 'none';
        return;
    }
    
    // 解析数据行
    let parts = [];
    if (dataLine.includes('---')) {
        parts = dataLine.split('---');
    } else if (dataLine.includes('|')) {
        parts = dataLine.split('|');
    } else if (dataLine.includes(':')) {
        parts = dataLine.split(':');
    }
    
    parts = parts.map(part => part.trim()).filter(part => part);
    
    // 创建字段映射
    const dataMap = {};
    headerInfo.headers.forEach((header, index) => {
        if (index < parts.length) {
            dataMap[header.toLowerCase()] = parts[index];
        }
    });
    
    // 查找账号、密码、Cookie字段
    let account = '';
    let password = '';
    let twoFA = '';
    let notes = '';
    
    // 匹配账号字段
    for (let key in dataMap) {
        if (key.includes('账号') || key.includes('用户名') || key.includes('username') || key.includes('user')) {
            account = dataMap[key];
            break;
        }
    }
    
    // 匹配密码字段
    for (let key in dataMap) {
        if (key.includes('密码') || key.includes('password') || key.includes('pass')) {
            password = dataMap[key];
            break;
        }
    }
    
    // 匹配2FA字段
    for (let key in dataMap) {
        if (key.includes('2fa') || key.includes('二次验证') || key.includes('双重验证')) {
            twoFA = dataMap[key];
            break;
        }
    }
    
    // 匹配Cookie字段
    let cookie = '';
    for (let key in dataMap) {
        if (key.includes('cookie') || key.includes('cookies')) {
            cookie = dataMap[key];
            break;
        }
    }
    
    // 其他字段作为备注
    const usedKeys = new Set();
    if (account) {
        for (let key in dataMap) {
            if (dataMap[key] === account) usedKeys.add(key);
        }
    }
    if (password) {
        for (let key in dataMap) {
            if (dataMap[key] === password) usedKeys.add(key);
        }
    }
    if (twoFA) {
        for (let key in dataMap) {
            if (dataMap[key] === twoFA) usedKeys.add(key);
        }
    }
    if (cookie) {
        for (let key in dataMap) {
            if (dataMap[key] === cookie) usedKeys.add(key);
        }
    }
    
    const otherFields = [];
    headerInfo.headers.forEach((header, index) => {
        if (!usedKeys.has(header.toLowerCase()) && index < parts.length) {
            otherFields.push(`${header}: ${parts[index]}`);
        }
    });
    notes = otherFields.join('\n');
    
    // 更新预览
    document.getElementById('previewAccount').value = account;
    document.getElementById('previewPassword').value = password;
    document.getElementById('preview2FA').value = twoFA;
    document.getElementById('previewCookie').value = cookie;
    document.getElementById('previewNotes').value = notes;
    
    // 显示预览（默认展开）
    previewSection.style.display = 'block';
    const previewContent = document.getElementById('roxyPreviewContent');
    previewContent.classList.remove('collapsed');
    document.getElementById('previewToggleIcon').textContent = '▼';
}

/**
 * 切换Roxy预览的展开/收起状态
 */
function toggleRoxyPreview() {
    const previewContent = document.getElementById('roxyPreviewContent');
    const toggleIcon = document.getElementById('previewToggleIcon');
    
    if (previewContent.classList.contains('collapsed')) {
        // 展开
        previewContent.classList.remove('collapsed');
        toggleIcon.textContent = '▼';
    } else {
        // 收起
        previewContent.classList.add('collapsed');
        toggleIcon.textContent = '▶';
    }
}

/**
 * 执行实际的转换操作（支持批量处理）
 */
function performConversion(inputText, headerInfo) {
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length === 0) {
        setOutput('', false);
        showToast('输入为空！', 'warning');
        document.getElementById('roxyPreview').style.display = 'none';
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
    
    // 处理结果
    if (processedCount > 1) {
        // 批量记录，启用分页
        // 将结果按记录分组（每两个空行之间是一条记录）
        const records = [];
        let currentRecord = [];
        
        for (let i = 0; i < results.length; i++) {
            if (results[i] === '') {
                if (currentRecord.length > 0) {
                    records.push(currentRecord.join('\n'));
                    currentRecord = [];
                }
            } else {
                currentRecord.push(results[i]);
            }
        }
        
        // 添加最后一条记录
        if (currentRecord.length > 0) {
            records.push(currentRecord.join('\n'));
        }
        
        setOutput(records[0], headerInfo && headerInfo.headers.length > 0, records);
        showToast(`转换成功！已处理 ${processedCount} 条记录`, 'success');
        
        // 更新Roxy预览（显示第一条记录）
        if (dataLines.length > 0) {
            updateRoxyPreview(headerInfo, dataLines[0]);
        }
    } else if (processedCount === 1) {
        // 单条记录
        const finalResult = results.join('\n');
        setOutput(finalResult, headerInfo && headerInfo.headers.length > 0);
        showToast('转换成功！', 'success');
        
        // 更新Roxy预览
        if (dataLines.length > 0) {
            updateRoxyPreview(headerInfo, dataLines[0]);
        }
    } else {
        showToast('未找到有效数据！', 'warning');
        document.getElementById('roxyPreview').style.display = 'none';
    }
}

// 当前选中的分隔符（默认为竖线）
let currentSeparator = '|';

/**
 * 处理文件上传（支持批量）
 */
function handleFileUpload(event) {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
        return;
    }
    
    handleBatchDroppedFiles(files);
    
    // 清空文件选择，允许重复上传同一文件
    event.target.value = '';
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

// 存储所有记录
let allRecords = [];
let currentPage = 0;

/**
 * 设置输出文本并更新统计信息
 * @param {string} text - 输出文本
 * @param {boolean} hasHeaders - 是否包含标题
 * @param {Array} records - 所有记录数组（用于分页）
 */
function setOutput(text, hasHeaders = false, records = null) {
    const outputDisplay = document.getElementById('outputDisplayNew');
    
    if (!text) {
        outputDisplay.innerHTML = '<div class="output-placeholder-new">转换结果将显示在这里...</div>';
        updateStats('');
        hidePagination();
        return;
    }
    
    // 如果有多条记录，启用分页
    if (records && records.length > 1) {
        allRecords = records;
        currentPage = 0;
        showPagination(records.length);
        displayRecord(0);
    } else {
        // 单条记录或无记录，直接显示
        allRecords = [];
        hidePagination();
        renderOutputItems(text);
        updateStats(text);
    }
}

/**
 * 渲染输出项（标题+按钮形式）
 */
function renderOutputItems(text) {
    const outputDisplay = document.getElementById('outputDisplayNew');
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        outputDisplay.innerHTML = '<div class="output-placeholder-new">转换结果将显示在这里...</div>';
        return;
    }
    
    let html = '';
    lines.forEach((line, index) => {
        // 检查是否有标题（包含冒号）
        const colonIndex = line.indexOf('：');
        let label = '';
        let value = '';
        
        if (colonIndex > 0) {
            label = line.substring(0, colonIndex);
            value = line.substring(colonIndex + 1).trim();
        } else {
            label = `项 ${index + 1}`;
            value = line;
        }
        
        html += `
            <div class="output-item">
                <div class="output-item-label">${escapeHtml(label)}</div>
                <div class="output-item-content" onclick="copyLineValue(\`${escapeHtml(value).replace(/`/g, '\\`')}\`)" onmousemove="updateTooltipPosition(event)">
                    <div class="output-item-value">${escapeHtml(value)}</div>
                    <span class="output-copy-btn"></span>
                </div>
            </div>
        `;
    });
    
    outputDisplay.innerHTML = html;
}

/**
 * 更新提示气泡位置（跟随鼠标）
 */
function updateTooltipPosition(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    event.currentTarget.style.setProperty('--mouse-x', `${x}px`);
}

/**
 * 复制单行的值
 */
function copyLineValue(value) {
    navigator.clipboard.writeText(value).then(() => {
        showToast('已复制！', 'success');
    }).catch(err => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('已复制！', 'success');
        } catch (e) {
            document.body.removeChild(textarea);
            showToast('复制失败', 'error');
        }
    });
}

/**
 * 显示指定页码的记录
 */
function displayRecord(pageIndex) {
    if (pageIndex < 0 || pageIndex >= allRecords.length) return;
    
    currentPage = pageIndex;
    renderOutputItems(allRecords[pageIndex]);
    updateStats(allRecords[pageIndex]);
    updatePaginationUI();
    
    // 更新记录信息
    const recordInfo = document.getElementById('recordInfo');
    recordInfo.style.display = 'inline';
    recordInfo.textContent = `记录 ${pageIndex + 1}/${allRecords.length}`;
}

/**
 * 显示分页器
 */
function showPagination(totalPages) {
    const paginationTabs = document.getElementById('paginationTabs');
    paginationTabs.style.display = 'flex';
    renderPagination(totalPages);
}

/**
 * 隐藏分页器
 */
function hidePagination() {
    const paginationTabs = document.getElementById('paginationTabs');
    paginationTabs.style.display = 'none';
    const recordInfo = document.getElementById('recordInfo');
    recordInfo.style.display = 'none';
}

/**
 * 渲染分页器
 */
function renderPagination(totalPages) {
    const paginationTabs = document.getElementById('paginationTabs');
    let html = '';
    
    // 上一页按钮
    html += `<button class="page-nav" onclick="changePage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>◀</button>`;
    
    // 页码按钮（最多显示7个）
    const maxVisible = 7;
    let startPage = 0;
    let endPage = totalPages;
    
    if (totalPages > maxVisible) {
        // 当前页居中显示
        const half = Math.floor(maxVisible / 2);
        startPage = Math.max(0, currentPage - half);
        endPage = Math.min(totalPages, startPage + maxVisible);
        
        // 调整起始页
        if (endPage - startPage < maxVisible) {
            startPage = Math.max(0, endPage - maxVisible);
        }
    }
    
    // 第一页
    if (startPage > 0) {
        html += `<button class="page-tab" onclick="changePage(0)">1</button>`;
        if (startPage > 1) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    // 中间页码
    for (let i = startPage; i < endPage; i++) {
        const active = i === currentPage ? 'active' : '';
        html += `<button class="page-tab ${active}" onclick="changePage(${i})">${i + 1}</button>`;
    }
    
    // 最后一页
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="page-ellipsis">...</span>`;
        }
        html += `<button class="page-tab" onclick="changePage(${totalPages - 1})">${totalPages}</button>`;
    }
    
    // 下一页按钮
    html += `<button class="page-nav" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages - 1 ? 'disabled' : ''}>▶</button>`;
    
    paginationTabs.innerHTML = html;
}

/**
 * 更新分页UI
 */
function updatePaginationUI() {
    renderPagination(allRecords.length);
}

/**
 * 切换页码
 */
function changePage(pageIndex) {
    if (pageIndex >= 0 && pageIndex < allRecords.length) {
        displayRecord(pageIndex);
    }
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
 * 复制全部输出文本到剪贴板
 */
function copyAllOutput() {
    let outputText = '';
    
    // 如果有多条记录，复制所有记录
    if (allRecords.length > 1) {
        outputText = allRecords.join('\n\n');
    } else {
        // 从显示的输出项中提取文本
        const outputDisplay = document.getElementById('outputDisplayNew');
        const items = outputDisplay.querySelectorAll('.output-item');
        const lines = Array.from(items).map(item => {
            const label = item.querySelector('.output-item-label')?.textContent || '';
            const value = item.querySelector('.output-item-value')?.textContent || '';
            return `${label}：${value}`;
        });
        outputText = lines.join('\n');
    }
    
    if (!outputText) {
        showToast('没有可复制的内容！', 'warning');
        return;
    }

    navigator.clipboard.writeText(outputText).then(() => {
        if (allRecords.length > 1) {
            showToast(`已复制全部 ${allRecords.length} 条记录！`, 'success');
        } else {
            showToast('复制成功！', 'success');
        }
    }).catch(err => {
        // 降级方案：使用传统方法复制
        const textarea = document.createElement('textarea');
        textarea.value = outputText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            if (allRecords.length > 1) {
                showToast(`已复制全部 ${allRecords.length} 条记录！`, 'success');
            } else {
                showToast('复制成功！', 'success');
            }
        } catch (e) {
            document.body.removeChild(textarea);
            showToast('复制失败，请手动复制', 'error');
        }
    });
}

/**
 * 清空输入框
 */
function clearInput() {
    document.getElementById('inputText').value = '';
    const outputDisplay = document.getElementById('outputDisplayNew');
    outputDisplay.innerHTML = '<div class="output-placeholder-new">转换结果将显示在这里...</div>';
    document.getElementById('headerInput').value = '';
    displayNotes([]);
    updateStats('');
    updateHeaderCount();
    document.getElementById('roxyPreview').style.display = 'none';
    hidePagination();
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
    
    // 文件放下（支持批量）
    dropZone.addEventListener('drop', function(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleBatchDroppedFiles(files);
        }
    }, false);
}

/**
 * 处理批量拖拽上传的文件
 */
function handleBatchDroppedFiles(files) {
    const fileArray = Array.from(files);
    const txtFiles = fileArray.filter(file => file.name.endsWith('.txt'));
    
    if (txtFiles.length === 0) {
        showToast('未找到 .txt 文件！', 'warning');
        return;
    }
    
    // 过滤掉过大的文件
    const validFiles = txtFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
            showToast(`文件 ${file.name} 太大，已跳过`, 'warning');
            return false;
        }
        return true;
    });
    
    if (validFiles.length === 0) {
        showToast('所有文件都太大！请上传小于 5MB 的文件', 'warning');
        return;
    }
    
    // 清空输入框，准备接收新内容
    document.getElementById('inputText').value = '';
    
    // 批量读取文件
    let loadedCount = 0;
    validFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            const inputTextarea = document.getElementById('inputText');
            
            // 追加内容
            if (inputTextarea.value.trim()) {
                inputTextarea.value += '\n' + content;
            } else {
                inputTextarea.value = content;
            }
            
            loadedCount++;
            
            // 所有文件加载完成
            if (loadedCount === validFiles.length) {
                if (validFiles.length === 1) {
                    showToast(`已成功加载文件：${validFiles[0].name}`, 'success');
                } else {
                    showToast(`已成功加载 ${validFiles.length} 个文件`, 'success');
                }
            }
        };
        
        reader.onerror = function() {
            showToast(`文件 ${file.name} 读取失败！`, 'error');
        };
        
        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * 处理拖拽上传的文件（支持批量）
 */
function handleDroppedFile(file) {
    // 检查文件类型
    if (!file.name.endsWith('.txt')) {
        showToast('请上传 .txt 文件！', 'warning');
        return;
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        showToast(`文件 ${file.name} 太大！请上传小于 5MB 的文件`, 'warning');
        return;
    }
    
    // 读取文件内容
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        const inputTextarea = document.getElementById('inputText');
        
        // 如果输入框已有内容，追加新内容（用换行分隔）
        if (inputTextarea.value.trim()) {
            inputTextarea.value += '\n' + content;
        } else {
            inputTextarea.value = content;
        }
        
        showToast(`已加载文件：${file.name}`, 'success');
    };
    
    reader.onerror = function() {
        showToast(`文件 ${file.name} 读取失败！`, 'error');
    };
    
    reader.readAsText(file, 'UTF-8');
}

