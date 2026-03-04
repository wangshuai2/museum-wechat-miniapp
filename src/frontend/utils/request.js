/**
 * request.js - 网络请求封装
 * 支持 GET/POST/PUT/DELETE
 * 自动添加 Token
 * 统一错误处理
 * 支持 Promise
 */

const app = getApp()

// 基础配置
const BASE_URL = 'http://localhost:3000/api/v1'
const TIMEOUT = 30000

/**
 * 核心请求方法
 * @param {Object} options 请求配置
 * @returns {Promise} 返回 Promise
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, header = {}, showLoading = true } = options
    
    // 显示加载提示
    if (showLoading) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    // 获取 token
    const token = app.globalData.token || wx.getStorageSync('token')
    
    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    }
    
    // 添加 Authorization
    if (token) {
      requestHeader['Authorization'] = `Bearer ${token}`
    }

    // 发起请求
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: requestHeader,
      timeout: TIMEOUT,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading()
        }
        
        const { statusCode, data: responseData } = res
        
        // HTTP 状态码判断
        if (statusCode >= 200 && statusCode < 300) {
          // 业务状态码判断
          if (responseData.code === 200) {
            resolve(responseData.data)
          } else {
            // 业务错误
            handleBusinessError(responseData)
            reject(responseData)
          }
        } else if (statusCode === 401) {
          // Token 过期或无效
          handleUnauthorized()
          reject({ code: 401, message: '登录已过期，请重新登录' })
        } else if (statusCode === 403) {
          wx.showToast({
            title: '没有权限访问',
            icon: 'none'
          })
          reject({ code: 403, message: '没有权限访问' })
        } else if (statusCode === 404) {
          wx.showToast({
            title: '资源不存在',
            icon: 'none'
          })
          reject({ code: 404, message: '资源不存在' })
        } else {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject({ code: statusCode, message: '网络请求失败' })
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading()
        }
        
        console.error('请求失败:', err)
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject({ code: -1, message: '网络连接失败', error: err })
      }
    })
  })
}

/**
 * 处理业务错误
 * @param {Object} error 错误信息
 */
const handleBusinessError = (error) => {
  const { code, message } = error
  
  // 根据错误码显示不同提示
  const errorMessages = {
    1001: '参数验证失败',
    1002: 'Token 无效',
    1003: 'Token 过期',
    1004: '权限不足',
    2001: '资源不存在',
    2002: '资源已存在',
    3001: '预约时段已满',
    3002: '预约时间已过',
    3003: '重复预约'
  }
  
  const errorMessage = errorMessages[code] || message || '操作失败'
  
  wx.showToast({
    title: errorMessage,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 处理未授权情况
 */
const handleUnauthorized = () => {
  // 清除用户信息
  const app = getApp()
  app.clearUserInfo()
  
  wx.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  })
  
  // 跳转到登录页
  setTimeout(() => {
    wx.redirectTo({
      url: '/pages/login/login'
    })
  }, 1500)
}

/**
 * GET 请求
 * @param {string} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST 请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 * @param {string} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise}
 */
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 上传文件
 * @param {string} url 上传地址
 * @param {string} filePath 本地文件路径
 * @param {Object} formData 其他表单数据
 * @returns {Promise}
 */
const upload = (url, filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token || wx.getStorageSync('token')
    
    wx.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name: 'file',
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data.data)
        } else {
          handleBusinessError(data)
          reject(data)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload
}