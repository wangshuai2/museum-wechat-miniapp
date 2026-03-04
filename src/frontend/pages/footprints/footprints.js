// pages/footprints/footprints.js
const { get } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    footprints: [],
    stats: {
      museumCount: 0,
      totalVisits: 0,
      recentVisit: '--'
    },
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      footprints: []
    })
    
    this.loadFootprints().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = app.isLoggedIn()
    
    this.setData({ isLoggedIn })

    if (isLoggedIn) {
      this.loadFootprints()
    } else {
      this.setData({
        footprints: [],
        loading: false,
        stats: {
          museumCount: 0,
          totalVisits: 0,
          recentVisit: '--'
        }
      })
    }
  },

  // 加载足迹数据
  async loadFootprints() {
    if (this.data.loading) return
    
    this.setData({ loading: true })

    try {
      const result = await get('/footprints/my', {
        page: this.data.page,
        pageSize: this.data.pageSize
      }, { showLoading: false })

      // 处理数据
      const footprints = result.list || []
      const stats = {
        museumCount: result.museumCount || footprints.length,
        totalVisits: result.totalVisits || footprints.length,
        recentVisit: footprints.length > 0 ? this.formatRecentTime(footprints[0].visitTime) : '--'
      }

      this.setData({
        footprints: this.data.page === 1 ? footprints : [...this.data.footprints, ...footprints],
        stats,
        hasMore: footprints.length >= this.data.pageSize,
        loading: false,
        page: this.data.page + 1
      })
    } catch (error) {
      console.error('加载足迹失败:', error)
      
      // 使用模拟数据
      const mockData = this.getMockData()
      const footprints = mockData.footprints
      const stats = {
        museumCount: mockData.museumCount,
        totalVisits: mockData.totalVisits,
        recentVisit: footprints.length > 0 ? this.formatRecentTime(footprints[0].visitTime) : '--'
      }

      this.setData({
        footprints: this.data.page === 1 ? footprints : [...this.data.footprints, ...footprints],
        stats,
        hasMore: false,
        loading: false
      })
    }
  },

  // 格式化最近时间
  formatRecentTime(time) {
    if (!time) return '--'
    
    const visitDate = new Date(time)
    const now = new Date()
    const diffDays = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
    return `${Math.floor(diffDays / 365)}年前`
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadFootprints()
    }
  },

  // 跳转登录
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转博物馆详情
  goToMuseumDetail(e) {
    const { id } = e.currentTarget.dataset
    if (id) {
      wx.navigateTo({
        url: `/pages/museum-detail/museum-detail?id=${id}`
      })
    }
  },

  // 探索博物馆
  goToExplore() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 模拟数据
  getMockData() {
    return {
      museumCount: 5,
      totalVisits: 8,
      footprints: [
        {
          _id: '1',
          museumId: '1',
          museumName: '中国国家博物馆',
          museumImage: '',
          visitTime: '2024-03-15 14:30',
          rating: 5,
          visitDuration: 180,
          exhibitsVisited: 6
        },
        {
          _id: '2',
          museumId: '2',
          museumName: '故宫博物院',
          museumImage: '',
          visitTime: '2024-03-10 09:00',
          rating: 5,
          visitDuration: 240,
          exhibitsVisited: 8
        },
        {
          _id: '3',
          museumId: '3',
          museumName: '上海博物馆',
          museumImage: '',
          visitTime: '2024-03-05 10:00',
          rating: 4,
          visitDuration: 120,
          exhibitsVisited: 4
        },
        {
          _id: '4',
          museumId: '4',
          museumName: '南京博物院',
          museumImage: '',
          visitTime: '2024-02-28 13:30',
          rating: 4,
          visitDuration: 150,
          exhibitsVisited: 5
        },
        {
          _id: '5',
          museumId: '5',
          museumName: '陕西历史博物馆',
          museumImage: '',
          visitTime: '2024-02-20 09:30',
          rating: 5,
          visitDuration: 200,
          exhibitsVisited: 7
        }
      ]
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '博物馆导览 - 我的参观足迹',
      path: '/pages/index/index'
    }
  }
})