// pages/login/login.js
const { post } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    mode: 'login', // login 或 register
    formData: {
      username: '',
      password: '',
      email: '',
      phone: ''
    },
    loading: false,
    passwordVisible: false
  },

  onLoad(options) {
    // 如果已登录，直接跳转首页
    if (app.isLoggedIn()) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 切换模式
  switchMode() {
    this.setData({
      mode: this.data.mode === 'login' ? 'register' : 'login',
      formData: {
        username: '',
        password: '',
        email: '',
        phone: ''
      }
    })
  },

  // 输入处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  // 切换密码可见性
  togglePassword() {
    this.setData({
      passwordVisible: !this.data.passwordVisible
    })
  },

  // 表单验证
  validateForm() {
    const { mode, formData } = this.data
    const { username, password, email, phone } = formData

    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return false
    }

    if (!password || password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return false
    }

    if (mode === 'register') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        wx.showToast({ title: '请输入正确的邮箱', icon: 'none' })
        return false
      }
    }

    return true
  },

  // 登录
  async handleLogin() {
    if (!this.validateForm()) return

    const { formData } = this.data

    try {
      this.setData({ loading: true })

      const result = await post('/auth/login', {
        username: formData.username,
        password: formData.password
      })

      // 保存用户信息
      app.setUserInfo({
        userId: result.userId,
        username: result.username
      }, result.token)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)

    } catch (error) {
      console.error('登录失败:', error)
      
      // 演示模式：模拟登录成功
      this.mockLogin()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 注册
  async handleRegister() {
    if (!this.validateForm()) return

    const { formData } = this.data

    try {
      this.setData({ loading: true })

      const result = await post('/auth/register', {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || undefined
      })

      // 保存用户信息
      app.setUserInfo({
        userId: result.userId
      }, result.token)

      wx.showToast({
        title: '注册成功',
        icon: 'success'
      })

      // 跳转首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)

    } catch (error) {
      console.error('注册失败:', error)
      
      // 演示模式：模拟注册成功
      this.mockLogin()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 模拟登录（开发测试用）
  mockLogin() {
    const { formData, mode } = this.data

    // 模拟用户数据
    const mockUser = {
      userId: 'mock_user_001',
      username: formData.username,
      email: formData.email || `${formData.username}@example.com`,
      avatar: '/assets/images/default-avatar.png'
    }

    app.setUserInfo(mockUser, 'mock_token_' + Date.now())

    wx.showToast({
      title: mode === 'login' ? '登录成功' : '注册成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  },

  // 微信登录
  async wxLogin() {
    try {
      // 获取微信登录code
      const { code } = await wx.login()
      
      wx.showLoading({ title: '登录中...' })

      // 这里应该调用后端接口进行微信登录
      // const result = await post('/auth/wx-login', { code })
      
      // 模拟微信登录
      setTimeout(() => {
        wx.hideLoading()
        
        const mockUser = {
          userId: 'wx_user_001',
          username: '微信用户',
          avatar: '/assets/images/default-avatar.png'
        }
        
        app.setUserInfo(mockUser, 'mock_wx_token_' + Date.now())
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      }, 1000)

    } catch (error) {
      wx.hideLoading()
      console.error('微信登录失败:', error)
      wx.showToast({
        title: '微信登录失败',
        icon: 'none'
      })
    }
  },

  // 提交表单
  handleSubmit() {
    const { mode } = this.data
    if (mode === 'login') {
      this.handleLogin()
    } else {
      this.handleRegister()
    }
  }
})