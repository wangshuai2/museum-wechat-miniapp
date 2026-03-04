// pages/notes/notes.js
const { get } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    notes: [],
    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    limit: 10,
    total: 0,
    
    // 筛选相关
    showFilter: false,
    museums: [],
    selectedMuseumId: '',
    selectedMuseumName: '全部博物馆',
    
    // 统计
    statistics: null
  },

  onLoad() {
    this.loadMuseums()
    this.loadNotes()
    this.loadStatistics()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.refreshNotes()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshNotes()
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreNotes()
    }
  },

  // 刷新笔记列表
  async refreshNotes() {
    this.setData({ 
      page: 1, 
      hasMore: true,
      refreshing: true 
    })
    
    try {
      await this.loadNotes()
    } finally {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    }
  },

  // 加载笔记列表
  async loadNotes() {
    const { page, limit, selectedMuseumId } = this.data
    
    try {
      this.setData({ loading: page === 1 })
      
      const params = {
        page,
        limit
      }
      
      if (selectedMuseumId) {
        params.museumId = selectedMuseumId
      }
      
      const result = await get('/notes/my', params)
      
      const newNotes = result.list || []
      const notes = page === 1 ? newNotes : [...this.data.notes, ...newNotes]
      
      this.setData({
        notes,
        total: result.total || 0,
        hasMore: newNotes.length >= limit,
        loading: false
      })
      
    } catch (error) {
      console.error('加载笔记失败:', error)
      
      // 使用模拟数据
      this.loadMockNotes()
    }
  },

  // 加载模拟数据
  loadMockNotes() {
    const mockNotes = [
      {
        _id: '1',
        museumId: 'm1',
        museumName: '故宫博物院',
        museumImage: '/assets/images/museum-1.jpg',
        exhibitId: 'e1',
        exhibitName: '太和殿',
        title: '第一次参观故宫',
        content: '故宫的宏伟令人震撼，太和殿的金碧辉煌让我印象深刻。建议早点去，人少一些...',
        images: ['/assets/images/museum-1.jpg'],
        tags: ['历史', '建筑'],
        visibility: 'private',
        likeCount: 0,
        createdAt: '2026-03-04T09:30:00Z'
      },
      {
        _id: '2',
        museumId: 'm2',
        museumName: '国家博物馆',
        museumImage: '/assets/images/museum-2.jpg',
        exhibitId: 'e2',
        exhibitName: '后母戊鼎',
        title: '国宝级青铜器',
        content: '终于见到了课本上的后母戊鼎，实物比照片更加震撼，精美的纹饰展现了古代工匠的高超技艺...',
        images: ['/assets/images/museum-2.jpg', '/assets/images/museum-3.jpg'],
        tags: ['青铜器', '国宝'],
        visibility: 'public',
        likeCount: 12,
        createdAt: '2026-03-02T14:20:00Z'
      },
      {
        _id: '3',
        museumId: 'm3',
        museumName: '上海博物馆',
        museumImage: '/assets/images/museum-3.jpg',
        title: '陶瓷艺术之旅',
        content: '上海博物馆的陶瓷馆非常值得一看，从唐三彩到青花瓷，展现了中华陶瓷艺术的精粹...',
        images: [],
        tags: ['陶瓷', '艺术'],
        visibility: 'private',
        likeCount: 0,
        createdAt: '2026-02-28T10:15:00Z'
      }
    ]
    
    this.setData({
      notes: mockNotes,
      total: mockNotes.length,
      hasMore: false,
      loading: false
    })
  },

  // 加载更多
  async loadMoreNotes() {
    if (this.data.loadingMore || !this.data.hasMore) return
    
    this.setData({ 
      loadingMore: true,
      page: this.data.page + 1 
    })
    
    try {
      await this.loadNotes()
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  // 加载博物馆列表（用于筛选）
  async loadMuseums() {
    try {
      const result = await get('/museums', { limit: 100 })
      
      this.setData({
        museums: result.list || []
      })
    } catch (error) {
      console.error('加载博物馆列表失败:', error)
      
      // 模拟数据
      this.setData({
        museums: [
          { _id: 'm1', name: '故宫博物院' },
          { _id: 'm2', name: '国家博物馆' },
          { _id: 'm3', name: '上海博物馆' }
        ]
      })
    }
  },

  // 加载统计信息
  async loadStatistics() {
    try {
      const result = await get('/notes/statistics')
      
      this.setData({
        statistics: result
      })
    } catch (error) {
      console.error('加载统计信息失败:', error)
      
      // 模拟数据
      this.setData({
        statistics: {
          totalNotes: 25,
          totalWords: 12500,
          totalImages: 45,
          museumCount: 8
        }
      })
    }
  },

  // 显示筛选弹窗
  showFilterModal() {
    this.setData({ showFilter: true })
  },

  // 隐藏筛选弹窗
  hideFilterModal() {
    this.setData({ showFilter: false })
  },

  // 选择博物馆筛选
  selectMuseum(e) {
    const { id, name } = e.currentTarget.dataset
    
    this.setData({
      selectedMuseumId: id || '',
      selectedMuseumName: name || '全部博物馆',
      showFilter: false
    })
    
    // 重新加载笔记
    this.refreshNotes()
  },

  // 跳转到笔记详情
  goToNoteDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/note-detail/note-detail?id=${id}`
    })
  },

  // 跳转到创建笔记
  goToCreateNote() {
    wx.navigateTo({
      url: '/pages/note-edit/note-edit'
    })
  },

  // 预览图片
  previewImage(e) {
    const { url, urls } = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的博物馆笔记',
      path: '/pages/notes/notes'
    }
  }
})