/**
 * Storage Service - 封装 localStorage 读写逻辑
 * 为未来跨设备同步做准备
 */

/**
 * 生成存储 key
 * @param {Date} date - 日期对象
 * @returns {string} 存储 key，格式：study_data_YYYY_M_D
 */
function getStorageKey(date) {
    return `study_data_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
}

/**
 * 读取单个日期的数据
 * @param {Date} date - 日期对象
 * @returns {Object} 日期数据对象，包含 tasks, note, status, mood
 */
function getDayData(date) {
    const key = getStorageKey(date);
    const defaultData = {
        tasks: [],
        note: "",
        status: "planned",
        mood: ""
    };
    
    try {
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
        return defaultData;
    } catch (e) {
        console.error(`读取日期数据失败 (${key}):`, e);
        return defaultData;
    }
}

/**
 * 保存单个日期的数据
 * @param {Date} date - 日期对象
 * @param {Object} dayData - 日期数据对象
 */
function saveDayData(date, dayData) {
    const key = getStorageKey(date);
    try {
        localStorage.setItem(key, JSON.stringify(dayData));
    } catch (e) {
        console.error(`保存日期数据失败 (${key}):`, e);
        throw e;
    }
}

/**
 * 检查指定日期是否有数据
 * @param {Date} date - 日期对象
 * @returns {boolean} 是否有数据
 */
function hasDayData(date) {
    const key = getStorageKey(date);
    return localStorage.getItem(key) !== null;
}

/**
 * 获取指定月份的所有日期数据
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @returns {Object} 以日期为 key 的数据对象，例如：{ "1": {...}, "2": {...} }
 */
function loadMonthData(year, month) {
    const result = {};
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const key = getStorageKey(date);
        const data = localStorage.getItem(key);
        
        if (data) {
            try {
                result[day] = JSON.parse(data);
            } catch (e) {
                console.error(`解析日期数据失败 (${key}):`, e);
            }
        }
    }
    
    return result;
}

/**
 * 加载完整状态（所有日期的数据）
 * @returns {Object} 完整数据对象，格式：{ "study_data_YYYY_M_D": {...}, ... }
 */
function loadState() {
    const state = {};
    
    // 遍历所有 localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('study_data_')) {
            try {
                const value = localStorage.getItem(key);
                if (value) {
                    state[key] = JSON.parse(value);
                }
            } catch (e) {
                console.error(`加载状态失败 (${key}):`, e);
            }
        }
    }
    
    return state;
}

/**
 * 保存完整状态（所有日期的数据）
 * @param {Object} state - 完整数据对象，格式：{ "study_data_YYYY_M_D": {...}, ... }
 */
function saveState(state) {
    // 先清空所有 study_data_ 开头的 key
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('study_data_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 保存新状态
    Object.keys(state).forEach(key => {
        if (key.startsWith('study_data_')) {
            try {
                localStorage.setItem(key, JSON.stringify(state[key]));
            } catch (e) {
                console.error(`保存状态失败 (${key}):`, e);
            }
        }
    });
}

/**
 * 导出完整状态为 JSON 字符串
 * @returns {string} JSON 字符串
 */
function exportStateToJSON() {
    const state = loadState();
    return JSON.stringify(state, null, 2);
}

/**
 * 从 JSON 字符串导入状态
 * @param {string} jsonString - JSON 字符串
 * @param {string} mode - 导入模式："merge"（合并）或 "replace"（替换）
 */
function importStateFromJSON(jsonString, mode = "replace") {
    try {
        const importedState = JSON.parse(jsonString);
        
        if (mode === "replace") {
            // 替换模式：清空所有数据，导入新数据
            saveState(importedState);
        } else if (mode === "merge") {
            // 合并模式：保留现有数据，导入的数据覆盖相同 key
            const currentState = loadState();
            const mergedState = { ...currentState, ...importedState };
            saveState(mergedState);
        } else {
            throw new Error(`不支持的导入模式: ${mode}`);
        }
        
        return true;
    } catch (e) {
        console.error('导入状态失败:', e);
        throw e;
    }
}
