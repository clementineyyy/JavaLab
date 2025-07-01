// 统一API调用路径
const API_BASE_URL = 'http://localhost:3000/api';

// 统一API错误处理
export async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API错误 (${endpoint}):`, error);
    throw error;
  }
}

// 在本地存储与远程数据之间自动同步
export function setupDataSync(dataType, fetchFunction, interval = 60000) {
  // 初始加载
  fetchFunction().then(data => {
    localStorage.setItem(dataType, JSON.stringify(data));
    console.log(`${dataType}数据已从服务器加载`);
  }).catch(error => {
    console.warn(`无法从服务器加载${dataType}数据:`, error);
  });

  // 定时同步
  setInterval(() => {
    fetchFunction().then(data => {
      localStorage.setItem(dataType, JSON.stringify(data));
    }).catch(error => {
      console.warn(`数据同步失败:`, error);
    });
  }, interval);
}