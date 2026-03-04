// pages/index/index.js
const { get } = require('../../utils/request')

Page({
  data: {
    searchValue: '',
    museumList: [],
    filteredList: [],
    loading: true,
    refreshing: false,
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
    categories: ['全部', '历史文物', '艺术珍品', '科技展品', '自然标本'],
    currentCategory: '全部'
  },

  onLoad() {
    this.loadMuseums()
  },

  onPullDownRefresh() {
    this.setData({ 
      refreshing: true,
      page: 1,
      hasMore: true 
    })
    this.loadMuseums().finally(() => {
      wx.stopPullDownRefresh()
      this.setData({ refreshing: false })
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  // 加载博物馆/展品列表
  async loadMuseums() {
    try {
      this.setData({ loading: true })
      
      const { page, limit, searchValue, currentCategory } = this.data
      const params = {
        page,
        limit,
        keyword: searchValue || undefined,
        category: currentCategory !== '全部' ? currentCategory : undefined
      }
      
      // 调用展品列表接口
      const result = await get('/exhibits', params, { showLoading: page === 1 })
      
      const list = result.list || []
      
      this.setData({
        museumList: list,
        filteredList: list,
        total: result.total || 0,
        hasMore: list.length >= limit,
        loading: false
      })
    } catch (error) {
      console.error('加载列表失败:', error)
      this.setData({ loading: false })
      
      // 使用模拟数据进行演示
      this.loadMockData()
    }
  },

  // 加载更多
  async loadMore() {
    if (!this.data.hasMore) return
    
    try {
      this.setData({ loading: true })
      
      const { page, limit, searchValue, currentCategory, museumList } = this.data
      const nextPage = page + 1
      
      const params = {
        page: nextPage,
        limit,
        keyword: searchValue || undefined,
        category: currentCategory !== '全部' ? currentCategory : undefined
      }
      
      const result = await get('/exhibits', params, { showLoading: false })
      const newList = result.list || []
      
      this.setData({
        museumList: [...museumList, ...newList],
        filteredList: [...museumList, ...newList],
        page: nextPage,
        hasMore: newList.length >= limit,
        loading: false
      })
    } catch (error) {
      console.error('加载更多失败:', error)
      this.setData({ loading: false })
    }
  },

  // 使用模拟数据（开发测试用）
  loadMockData() {
    const mockData = [
      {
        _id: '1',
        name: '青铜器展厅',
        description: '展示商周时期精美青铜器，包括礼器、兵器、乐器等多种类型',
        imageUrl: '/assets/images/museum-1.jpg',
        location: 'A区 1号展厅',
        category: '历史文物',
        tags: ['青铜器', '商周', '国宝']
      },
      {
        _id: '2',
        name: '陶瓷艺术馆',
        description: '珍藏历代瓷器精品，从唐三彩到明清官窑，展现中国陶瓷艺术的辉煌历程',
        imageUrl: '/assets/images/museum-2.jpg',
        location: 'B区 2号展厅',
        category: '艺术珍品',
        tags: ['陶瓷', '瓷器', '艺术品']
      },
      {
        _id: '3',
        name: '古代书画馆',
        description: '收藏历代名家书画作品，涵盖山水、人物、花鸟等多种题材',
        imageUrl: '/assets/images/museum-3.jpg',
        location: 'C区 1号展厅',
        category: '艺术珍品',
        tags: ['书画', '艺术', '收藏']
      },
      {
        _id: '4',
        name: '科技创新展',
        description: '展示中国古代科技成就与现代科技创新成果',
        imageUrl: '/assets/images/museum-4.jpg',
        location: 'D区 1号展厅',
        category: '科技展品',
        tags: ['科技', '创新', '互动']
      },
      {
        _id: '5',
        name: '自然历史馆',
        description: '探索生命起源与演化，展示珍稀动植物标本',
        imageUrl: '/assets/images/museum-5.jpg',
        location: 'E区 1号展厅',
        category: '自然标本',
        tags: ['自然', '生物', '标本']
      }
    ]
    
    this.setData({
      museumList: mockData,
      filteredList: mockData,
      total: mockData.length,
      hasMore: false,
      loading: false
    })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchValue: e.detail.value })
  },

  // 执行搜索
  onSearch() {
    this.setData({ page: 1, hasMore: true })
    this.loadMuseums()
  },

  // 清除搜索
  onClearSearch() {
    this.setData({ searchValue: '', page: 1, hasMore: true })
    this.loadMuseums()
  },

  // 切换分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ 
      currentCategory: category,
      page: 1,
      hasMore: true
    })
    this.loadMuseums()
  },

  // 跳转详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/museum-detail/museum-detail?id=${id}`
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '博物馆导览 - 发现精彩展品',
      path: '/pages/index/index'
    }
  }
})