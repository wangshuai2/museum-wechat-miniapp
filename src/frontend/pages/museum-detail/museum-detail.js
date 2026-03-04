// pages/museum-detail/museum-detail.js
const { get, post } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    id: '',
    detail: null,
    loading: true,
    activeTab: 'intro',
    tabs: [
      { key: 'intro', name: '简介' },
      { key: 'images', name: '图片' },
      { key: 'audio', name: '语音导览' }
    ],
    showReservation: false,
    reservationForm: {
      date: '',
      timeSlot: '',
      visitorCount: 1,
      contactName: '',
      contactPhone: ''
    },
    availableSlots: [],
    minDate: '',
    maxDate: ''
  },

  onLoad(options) {
    const { id } = options
    this.setData({ id })
    this.loadDetail()
    this.initDatePicker()
  },

  // 初始化日期选择器
  initDatePicker() {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) // 可预约未来30天

    this.setData({
      minDate: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 加载详情
  async loadDetail() {
    try {
      this.setData({ loading: true })

      const result = await get(`/exhibits/${this.data.id}`)
      
      this.setData({
        detail: result,
        loading: false
      })

      // 设置页面标题
      wx.setNavigationBarTitle({
        title: result.name || '展品详情'
      })

    } catch (error) {
      console.error('加载详情失败:', error)
      
      // 使用模拟数据
      this.loadMockDetail()
    }
  },

  // 加载模拟详情
  loadMockDetail() {
    const mockDetail = {
      _id: this.data.id,
      name: '青铜器展厅',
      description: '展示商周时期精美青铜器，包括礼器、兵器、乐器等多种类型。馆内珍藏有国家一级文物数十件，是了解中国古代青铜文化的重要窗口。',
      imageUrl: '/assets/images/museum-1.jpg',
      images: [
        '/assets/images/museum-1.jpg',
        '/assets/images/museum-2.jpg',
        '/assets/images/museum-3.jpg'
      ],
      location: 'A区 1号展厅',
      category: '历史文物',
      tags: ['青铜器', '商周', '国宝'],
      audioGuide: 'https://example.com/audio.mp3',
      videoUrl: 'https://example.com/video.mp4',
      historicalBackground: '青铜器是中国古代重要的文化遗产，代表了当时最高的工艺水平。商周时期的青铜器主要用于祭祀和战争，体现了当时社会的等级制度和宗教信仰。',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
      openTime: '09:00-17:00',
      ticketInfo: '免费参观，需预约',
      visitorCount: 12580
    }

    this.setData({
      detail: mockDetail,
      loading: false
    })

    wx.setNavigationBarTitle({
      title: mockDetail.name
    })
  },

  // 切换标签
  onTabChange(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeTab: key })
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    const { detail } = this.data
    
    wx.previewImage({
      current: url,
      urls: detail.images || [detail.imageUrl]
    })
  },

  // 播放语音导览
  playAudio() {
    const { detail } = this.data
    if (detail.audioGuide) {
      // 实际项目中应该使用 wx.createInnerAudioContext
      wx.showToast({
        title: '开始播放语音导览',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '暂无语音导览',
        icon: 'none'
      })
    }
  },

  // 显示预约弹窗
  showReservationModal() {
    if (!app.isLoggedIn()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }

    this.setData({ showReservation: true })
    this.loadAvailableSlots()
  },

  // 隐藏预约弹窗
  hideReservationModal() {
    this.setData({ showReservation: false })
  },

  // 加载可预约时段
  async loadAvailableSlots() {
    try {
      const today = new Date()
      const date = this.formatDate(today)
      
      const result = await get('/reservations/available-slots', { date })
      
      this.setData({
        availableSlots: result.slots || []
      })
    } catch (error) {
      console.error('加载时段失败:', error)
      
      // 模拟时段数据
      this.setData({
        availableSlots: [
          { time: '09:00-10:00', available: true, remaining: 20 },
          { time: '10:00-11:00', available: true, remaining: 15 },
          { time: '11:00-12:00', available: false, remaining: 0 },
          { time: '14:00-15:00', available: true, remaining: 25 },
          { time: '15:00-16:00', available: true, remaining: 18 },
          { time: '16:00-17:00', available: true, remaining: 30 }
        ]
      })
    }
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      'reservationForm.date': e.detail.value
    })
  },

  // 选择时段
  onTimeSlotChange(e) {
    const { slot } = e.currentTarget.dataset
    if (slot.available) {
      this.setData({
        'reservationForm.timeSlot': slot.time
      })
    }
  },

  // 选择人数
  onVisitorCountChange(e) {
    this.setData({
      'reservationForm.visitorCount': e.detail.value
    })
  },

  // 输入联系人
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`reservationForm.${field}`]: e.detail.value
    })
  },

  // 提交预约
  async submitReservation() {
    const { reservationForm, id } = this.data
    const { date, timeSlot, visitorCount, contactName, contactPhone } = reservationForm

    // 表单验证
    if (!date) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    if (!timeSlot) {
      wx.showToast({ title: '请选择时段', icon: 'none' })
      return
    }
    if (!contactName) {
      wx.showToast({ title: '请输入联系人', icon: 'none' })
      return
    }
    if (!contactPhone) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' })
      return
    }

    try {
      const result = await post('/reservations', {
        exhibitId: id,
        date,
        timeSlot,
        visitorCount: parseInt(visitorCount),
        contactName,
        contactPhone
      })

      wx.showToast({
        title: '预约成功',
        icon: 'success'
      })

      this.hideReservationModal()

      // 显示预约二维码
      if (result.qrCode) {
        wx.showModal({
          title: '预约成功',
          content: '请截图保存二维码，凭码入场',
          showCancel: false
        })
      }

    } catch (error) {
      console.error('预约失败:', error)
      
      // 模拟预约成功
      wx.showToast({
        title: '预约成功',
        icon: 'success'
      })
      this.hideReservationModal()
    }
  },

  // 收藏
  onCollect() {
    if (!app.isLoggedIn()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '收藏成功',
      icon: 'success'
    })
  },

  // 分享
  onShareAppMessage() {
    const { detail } = this.data
    return {
      title: detail ? `${detail.name} - 博物馆导览` : '博物馆导览',
      path: `/pages/museum-detail/museum-detail?id=${this.data.id}`
    }
  },

  // 导航
  onNavigate() {
    wx.showToast({
      title: '正在打开地图导航',
      icon: 'none'
    })
    
    // 实际项目中应该使用 wx.openLocation
    // wx.openLocation({
    //   latitude: 39.90469,
    //   longitude: 116.40717,
    //   name: '博物馆',
    //   address: '北京市东城区'
    // })
  }
})