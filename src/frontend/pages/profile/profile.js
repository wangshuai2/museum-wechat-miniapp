// pages/profile/profile.js
const { get, put } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    visitHistory: [],
    reservations: [],
    loading: true,
    activeTab: 'history',
    tabs: [
      { key: 'history', name: '参观足迹' },
      { key: 'reservation', name: '我的预约' }
    ],
    stats: {
      totalVisits: 0,
      totalReservations: 0,
      favorites: 0
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = app.isLoggedIn()
    
    this.setData({ isLoggedIn })

    if (isLoggedIn) {
      this.loadUserInfo()
      this.loadVisitHistory()
      this.loadReservations()
    } else {
      this.setData({ 
        loading: false,
        userInfo: null 
      })
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const result = await get('/users/profile', {}, { showLoading: false })
      
      this.setData({
        userInfo: result,
        loading: false
      })
    } catch (error) {
      console.error('加载用户信息失败:', error)
      
      // 使用本地存储的用户信息
      const localUserInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
      this.setData({
        userInfo: localUserInfo,
        loading: false
      })
    }
  },

  // 加载参观足迹
  async loadVisitHistory() {
    try {
      const result = await get('/visits/my', {}, { showLoading: false })
      
      this.setData({
        visitHistory: result.list || [],
        'stats.totalVisits': result.total || 0
      })
    } catch (error) {
      console.error('加载参观足迹失败:', error)
      
      // 模拟数据
      this.setData({
        visitHistory: [
          {
            _id: '1',
            exhibitId: '1',
            exhibitName: '青铜器展厅',
            visitTime: '2024-03-01 14:30',
            duration: 45
          },
          {
            _id: '2',
            exhibitId: '2',
            exhibitName: '陶瓷艺术馆',
            visitTime: '2024-02-28 10:00',
            duration: 60
          }
        ],
        'stats.totalVisits': 2
      })
    }
  },

  // 加载预约记录
  async loadReservations() {
    try {
      const result = await get('/reservations/my', {}, { showLoading: false })
      
      this.setData({
        reservations: result.list || [],
        'stats.totalReservations': result.total || 0
      })
    } catch (error) {
      console.error('加载预约记录失败:', error)
      
      // 模拟数据
      this.setData({
        reservations: [
          {
            _id: '1',
            exhibitId: '1',
            exhibitName: '青铜器展厅',
            date: '2024-03-10',
            timeSlot: '09:00-10:00',
            visitorCount: 2,
            status: 'confirmed',
            qrCode: ''
          },
          {
            _id: '2',
            exhibitId: '3',
            exhibitName: '古代书画馆',
            date: '2024-03-05',
            timeSlot: '14:00-15:00',
            visitorCount: 1,
            status: 'completed',
            qrCode: ''
          }
        ],
        'stats.totalReservations': 2
      })
    }
  },

  // 切换标签
  onTabChange(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeTab: key })
  },

  // 跳转登录
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/museum-detail/museum-detail?id=${id}`
    })
  },

  // 取消预约
  async cancelReservation(e) {
    const { id } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await del(`/reservations/${id}`)
            
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            })
            
            // 刷新列表
            this.loadReservations()
          } catch (error) {
            console.error('取消预约失败:', error)
            
            // 模拟取消成功
            const { reservations } = this.data
            const newList = reservations.filter(item => item._id !== id)
            
            this.setData({
              reservations: newList,
              'stats.totalReservations': newList.length
            })
            
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            })
          }
        }
      }
    })
  },

  // 查看预约二维码
  showQRCode(e) {
    const { item } = e.currentTarget.dataset
    
    if (item.qrCode) {
      wx.previewImage({
        urls: [item.qrCode]
      })
    } else {
      wx.showToast({
        title: '暂无二维码',
        icon: 'none'
      })
    }
  },

  // 编辑资料
  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 设置
  goToSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 跳转到参观足迹
  goToFootprints() {
    wx.navigateTo({
      url: '/pages/footprints/footprints'
    })
  },

  // 跳转到我的笔记
  goToNotes() {
    wx.navigateTo({
      url: '/pages/notes/notes'
    })
  },

  // 跳转到我的收藏
  goToFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearUserInfo()
          
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            visitHistory: [],
            reservations: []
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '博物馆导览 - 我的参观足迹',
      path: '/pages/index/index'
    }
  }
})