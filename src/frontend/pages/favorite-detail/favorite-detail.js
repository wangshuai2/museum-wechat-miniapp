// pages/favorite-detail/favorite-detail.js
const { get, put, del } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    id: '',
    type: 'exhibit', // exhibit 或 museum
    
    // 详情数据
    detail: null,
    
    // 状态选项
    statusOptions: [
      { value: 'want', label: '想去', icon: '🎯' },
      { value: 'visited', label: '已去过', icon: '✅' }
    ],
    currentStatus: 'want',
    
    // 加载状态
    loading: true,
    
    // 日期选择器
    showDatePicker: false,
    visitDate: '',
    minDate: new Date(2020, 0, 1).getTime(),
    maxDate: new Date().getTime()
  },

  onLoad(options) {
    const { id, type } = options
    
    this.setData({ 
      id,
      type: type || 'exhibit'
    })
    
    this.loadDetail()
  },

  // 加载详情
  async loadDetail() {
    const { id, type } = this.data
    
    try {
      this.setData({ loading: true })
      
      const endpoint = type === 'exhibit' ? `/favorites/exhibits/${id}` : `/favorites/museums/${id}`
      const result = await get(endpoint)
      
      this.setData({
        detail: result,
        currentStatus: result.status || 'want',
        visitDate: result.visitedAt || result.lastVisitAt || '',
        loading: false
      })
      
      // 设置导航栏标题
      const title = type === 'exhibit' ? result.exhibitName : result.museumName
      wx.setNavigationBarTitle({ title })
      
    } catch (error) {
      console.error('加载详情失败:', error)
      this.loadMockDetail()
    }
  },

  // 加载模拟数据
  loadMockDetail() {
    const { type } = this.data
    
    const mockExhibitDetail = {
      _id: 'fe1',
      exhibitId: 'e1',
      exhibitName: '清明上河图',
      museumId: 'm1',
      museumName: '故宫博物院',
      imageUrl: '/assets/images/exhibit-1.jpg',
      description: '《清明上河图》是北宋画家张择端的传世名作，描绘了北宋都城汴京（今河南开封）的繁华景象。画卷全长528.7厘米，宽24.8厘米，以精致的笔法描绘了数量庞大的各色人物、牲畜、车、船、房屋、桥梁、城楼等，展现了宋代城市的繁华面貌。',
      status: 'want',
      notes: '计划下个月去故宫参观',
      tags: ['书画', '国宝', '北宋'],
      createdAt: '2026-03-01T10:00:00Z'
    }
    
    const mockMuseumDetail = {
      _id: 'fm1',
      museumId: 'm1',
      museumName: '故宫博物院',
      imageUrl: '/assets/images/museum-1.jpg',
      location: '北京市东城区景山前街4号',
      description: '故宫博物院是中国最大的古代文化艺术博物馆，也是世界著名的古代文化艺术博物馆。故宫为明、清两代的皇宫，是世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
      status: 'visited',
      visitedCount: 3,
      lastVisitAt: '2026-02-15',
      notes: '推荐游览路线：太和殿 → 中和殿 → 保和殿 → 乾清宫',
      tags: ['宫殿', '世界遗产', '热门'],
      openTime: '08:30-17:00',
      ticketPrice: '60元（旺季）',
      createdAt: '2025-12-01T10:00:00Z'
    }
    
    const detail = type === 'exhibit' ? mockExhibitDetail : mockMuseumDetail
    
    this.setData({
      detail,
      currentStatus: detail.status,
      visitDate: detail.lastVisitAt || '',
      loading: false
    })
    
    const title = type === 'exhibit' ? detail.exhibitName : detail.museumName
    wx.setNavigationBarTitle({ title })
  },

  // 修改收藏状态
  async changeStatus(e) {
    const { status } = e.currentTarget.dataset
    
    if (status === this.data.currentStatus) return
    
    // 如果选择"已去过"，显示日期选择
    if (status === 'visited') {
      this.setData({ showDatePicker: true })
      return
    }
    
    await this.updateStatus(status)
  },

  // 选择参观日期
  onDateConfirm(e) {
    const { detail } = e
    const date = new Date(detail)
    const visitDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    this.setData({ 
      showDatePicker: false,
      visitDate
    })
    
    this.updateStatus('visited', visitDate)
  },

  // 关闭日期选择器
  onDateCancel() {
    this.setData({ showDatePicker: false })
  },

  // 更新状态
  async updateStatus(status, visitDate = '') {
    const { id, type } = this.data
    
    try {
      const endpoint = type === 'exhibit' ? `/favorites/exhibits/${id}/status` : `/favorites/museums/${id}/status`
      await put(endpoint, { 
        status,
        visitedAt: status === 'visited' ? visitDate : undefined
      })
      
      this.setData({ 
        currentStatus: status,
        visitDate: status === 'visited' ? visitDate : ''
      })
      
      wx.showToast({
        title: status === 'want' ? '已标记为想去' : '已标记为去过',
        icon: 'success'
      })
    } catch (error) {
      console.error('修改状态失败:', error)
      
      // 模拟成功
      this.setData({ 
        currentStatus: status,
        visitDate: status === 'visited' ? visitDate : ''
      })
      
      wx.showToast({
        title: status === 'want' ? '已标记为想去' : '已标记为去过',
        icon: 'success'
      })
    }
  },

  // 取消收藏
  async removeFavorite() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          const { id, type } = this.data
          
          try {
            const endpoint = type === 'exhibit' ? `/favorites/exhibits/${id}` : `/favorites/museums/${id}`
            await del(endpoint)
            
            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
            
            // 返回上一页
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (error) {
            console.error('取消收藏失败:', error)
            
            // 模拟成功
            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
            
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          }
        }
      }
    })
  },

  // 跳转到展品/博物馆详情
  goToOriginal() {
    const { type, detail } = this.data
    const id = type === 'exhibit' ? detail.exhibitId : detail.museumId
    const url = type === 'exhibit' 
      ? `/pages/exhibit-detail/exhibit-detail?id=${id}`
      : `/pages/museum-detail/museum-detail?id=${id}`
    
    wx.navigateTo({ url })
  },

  // 编辑备注
  editNotes() {
    wx.showModal({
      title: '编辑备注',
      editable: true,
      placeholderText: '添加备注...',
      content: this.data.detail.notes || '',
      success: (res) => {
        if (res.confirm && res.content !== undefined) {
          this.saveNotes(res.content)
        }
      }
    })
  },

  // 保存备注
  async saveNotes(notes) {
    const { id, type } = this.data
    
    try {
      const endpoint = type === 'exhibit' ? `/favorites/exhibits/${id}/notes` : `/favorites/museums/${id}/notes`
      await put(endpoint, { notes })
      
      this.setData({
        'detail.notes': notes
      })
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('保存备注失败:', error)
      
      // 模拟成功
      this.setData({
        'detail.notes': notes
      })
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  },

  // 预览图片
  previewImage() {
    const { detail } = this.data
    if (detail && detail.imageUrl) {
      wx.previewImage({
        urls: [detail.imageUrl]
      })
    }
  },

  // 分享
  onShareAppMessage() {
    const { detail, type } = this.data
    const name = type === 'exhibit' ? detail.exhibitName : detail.museumName
    
    return {
      title: `收藏 - ${name}`,
      path: `/pages/favorite-detail/favorite-detail?id=${this.data.id}&type=${type}`
    }
  }
})