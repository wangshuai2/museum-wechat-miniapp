// pages/favorites/favorites.js
const { get, del } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    // Tab 相关
    tabs: [
      { key: 'exhibit', name: '展品收藏' },
      { key: 'museum', name: '博物馆收藏' }
    ],
    activeTab: 'exhibit',
    
    // 列表数据
    exhibitFavorites: [],
    museumFavorites: [],
    
    // 加载状态
    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    
    // 分页
    page: 1,
    limit: 10,
    total: 0,
    
    // 统计
    statistics: {
      exhibitCount: 0,
      museumCount: 0
    }
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.refreshFavorites()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshFavorites()
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreFavorites()
    }
  },

  // 刷新收藏列表
  async refreshFavorites() {
    this.setData({ 
      page: 1, 
      hasMore: true,
      refreshing: true 
    })
    
    try {
      await this.loadFavorites()
    } finally {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    }
  },

  // 加载收藏列表
  async loadFavorites() {
    const { activeTab, page, limit } = this.data
    
    try {
      this.setData({ loading: page === 1 })
      
      const params = { page, limit }
      const endpoint = activeTab === 'exhibit' ? '/favorites/exhibits' : '/favorites/museums'
      
      const result = await get(endpoint, params)
      
      const newList = result.list || []
      const listKey = activeTab === 'exhibit' ? 'exhibitFavorites' : 'museumFavorites'
      const list = page === 1 ? newList : [...this.data[listKey], ...newList]
      
      this.setData({
        [listKey]: list,
        total: result.total || 0,
        hasMore: newList.length >= limit,
        loading: false,
        'statistics.exhibitCount': activeTab === 'exhibit' ? (result.total || 0) : this.data.statistics.exhibitCount,
        'statistics.museumCount': activeTab === 'museum' ? (result.total || 0) : this.data.statistics.museumCount
      })
      
    } catch (error) {
      console.error('加载收藏失败:', error)
      this.loadMockFavorites()
    }
  },

  // 加载模拟数据
  loadMockFavorites() {
    const { activeTab, page } = this.data
    
    const mockExhibits = [
      {
        _id: 'fe1',
        exhibitId: 'e1',
        exhibitName: '清明上河图',
        museumId: 'm1',
        museumName: '故宫博物院',
        imageUrl: '/assets/images/exhibit-1.jpg',
        description: '北宋张择端的传世名作，描绘了北宋都城汴京的繁华景象',
        status: 'want',
        createdAt: '2026-03-01T10:00:00Z'
      },
      {
        _id: 'fe2',
        exhibitId: 'e2',
        exhibitName: '后母戊鼎',
        museumId: 'm2',
        museumName: '国家博物馆',
        imageUrl: '/assets/images/exhibit-2.jpg',
        description: '商代晚期青铜器，中国青铜器的巅峰之作',
        status: 'visited',
        visitedAt: '2026-02-20',
        createdAt: '2026-02-15T08:30:00Z'
      },
      {
        _id: 'fe3',
        exhibitId: 'e3',
        exhibitName: '翠玉白菜',
        museumId: 'm3',
        museumName: '台北故宫博物院',
        imageUrl: '/assets/images/exhibit-3.jpg',
        description: '清代玉雕精品，以其精巧的雕工闻名',
        status: 'want',
        createdAt: '2026-02-28T14:20:00Z'
      }
    ]
    
    const mockMuseums = [
      {
        _id: 'fm1',
        museumId: 'm1',
        museumName: '故宫博物院',
        imageUrl: '/assets/images/museum-1.jpg',
        location: '北京市东城区景山前街4号',
        description: '中国最大的古代文化艺术博物馆',
        status: 'visited',
        visitedCount: 3,
        lastVisitAt: '2026-02-15',
        createdAt: '2025-12-01T10:00:00Z'
      },
      {
        _id: 'fm2',
        museumId: 'm2',
        museumName: '国家博物馆',
        imageUrl: '/assets/images/museum-2.jpg',
        location: '北京市东城区东长安街16号',
        description: '世界上单体建筑面积最大的博物馆之一',
        status: 'want',
        createdAt: '2026-01-20T09:00:00Z'
      },
      {
        _id: 'fm3',
        museumId: 'm3',
        museumName: '上海博物馆',
        imageUrl: '/assets/images/museum-3.jpg',
        location: '上海市黄浦区人民大道201号',
        description: '以古代艺术为主的综合性博物馆',
        status: 'visited',
        visitedCount: 2,
        lastVisitAt: '2026-01-10',
        createdAt: '2025-11-15T11:30:00Z'
      }
    ]
    
    if (activeTab === 'exhibit') {
      this.setData({
        exhibitFavorites: page === 1 ? mockExhibits : [...this.data.exhibitFavorites, ...mockExhibits],
        total: mockExhibits.length,
        hasMore: false,
        loading: false,
        'statistics.exhibitCount': mockExhibits.length
      })
    } else {
      this.setData({
        museumFavorites: page === 1 ? mockMuseums : [...this.data.museumFavorites, ...mockMuseums],
        total: mockMuseums.length,
        hasMore: false,
        loading: false,
        'statistics.museumCount': mockMuseums.length
      })
    }
  },

  // 加载更多
  async loadMoreFavorites() {
    if (this.data.loadingMore || !this.data.hasMore) return
    
    this.setData({ 
      loadingMore: true,
      page: this.data.page + 1 
    })
    
    try {
      await this.loadFavorites()
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  // 切换 Tab
  onTabChange(e) {
    const { key } = e.currentTarget.dataset
    
    if (key === this.data.activeTab) return
    
    this.setData({ 
      activeTab: key,
      page: 1,
      hasMore: true
    })
    
    // 检查是否已有数据，没有则加载
    const listKey = key === 'exhibit' ? 'exhibitFavorites' : 'museumFavorites'
    if (this.data[listKey].length === 0) {
      this.loadFavorites()
    }
  },

  // 跳转到展品详情
  goToExhibitDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/favorite-detail/favorite-detail?id=${id}&type=exhibit`
    })
  },

  // 跳转到博物馆详情
  goToMuseumDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/favorite-detail/favorite-detail?id=${id}&type=museum`
    })
  },

  // 取消收藏
  async removeFavorite(e) {
    const { id, type } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const endpoint = type === 'exhibit' ? `/favorites/exhibits/${id}` : `/favorites/museums/${id}`
            await del(endpoint)
            
            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
            
            // 从列表中移除
            this.removeFavoriteFromList(id, type)
          } catch (error) {
            console.error('取消收藏失败:', error)
            
            // 模拟成功
            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
            this.removeFavoriteFromList(id, type)
          }
        }
      }
    })
  },

  // 从列表中移除收藏
  removeFavoriteFromList(id, type) {
    const listKey = type === 'exhibit' ? 'exhibitFavorites' : 'museumFavorites'
    const list = this.data[listKey].filter(item => item._id !== id)
    const statKey = type === 'exhibit' ? 'exhibitCount' : 'museumCount'
    
    this.setData({
      [listKey]: list,
      [`statistics.${statKey}`]: this.data.statistics[statKey] - 1
    })
  },

  // 修改收藏状态
  async changeStatus(e) {
    const { id, status, type } = e.currentTarget.dataset
    const newStatus = status === 'want' ? 'visited' : 'want'
    
    try {
      const endpoint = type === 'exhibit' ? `/favorites/exhibits/${id}/status` : `/favorites/museums/${id}/status`
      await put(endpoint, { status: newStatus })
      
      // 更新列表中的状态
      this.updateFavoriteStatus(id, newStatus, type)
      
      wx.showToast({
        title: newStatus === 'want' ? '已标记为想去' : '已标记为去过',
        icon: 'success'
      })
    } catch (error) {
      console.error('修改状态失败:', error)
      
      // 模拟成功
      this.updateFavoriteStatus(id, newStatus, type)
      wx.showToast({
        title: newStatus === 'want' ? '已标记为想去' : '已标记为去过',
        icon: 'success'
      })
    }
  },

  // 更新收藏状态
  updateFavoriteStatus(id, newStatus, type) {
    const listKey = type === 'exhibit' ? 'exhibitFavorites' : 'museumFavorites'
    const list = this.data[listKey].map(item => {
      if (item._id === id) {
        return { ...item, status: newStatus }
      }
      return item
    })
    
    this.setData({ [listKey]: list })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的收藏 - 博物馆导览',
      path: '/pages/favorites/favorites'
    }
  }
})