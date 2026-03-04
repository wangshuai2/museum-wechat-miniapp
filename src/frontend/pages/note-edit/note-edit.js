// pages/note-edit/note-edit.js
const { get, post, put, upload } = require('../../utils/request')

const app = getApp()

Page({
  data: {
    // 编辑模式
    isEdit: false,
    noteId: '',
    
    // 关联信息
    museumId: '',
    museumName: '',
    exhibitId: '',
    exhibitName: '',
    
    // 表单数据
    title: '',
    content: '',
    images: [],
    tags: [],
    visibility: 'private',
    
    // 标签相关
    showTagInput: false,
    newTag: '',
    suggestedTags: ['青铜器', '书画', '陶瓷', '玉器', '国宝', '历史', '艺术', '建筑', '文化', '文物'],
    
    // 图片上传
    maxImages: 9,
    uploading: false,
    
    // 保存状态
    saving: false
  },

  onLoad(options) {
    const { id, museumId, museumName, exhibitId, exhibitName } = options
    
    if (id) {
      // 编辑模式
      this.setData({ 
        isEdit: true, 
        noteId: id 
      })
      this.loadNoteDetail(id)
    } else {
      // 新建模式
      this.setData({
        museumId: museumId || '',
        museumName: museumName ? decodeURIComponent(museumName) : '',
        exhibitId: exhibitId || '',
        exhibitName: exhibitName ? decodeURIComponent(exhibitName) : ''
      })
    }
  },

  // 加载笔记详情（编辑模式）
  async loadNoteDetail(id) {
    try {
      const result = await get(`/notes/${id}`)
      
      this.setData({
        title: result.title || '',
        content: result.content || '',
        images: result.images || [],
        tags: result.tags || [],
        visibility: result.visibility || 'private',
        museumId: result.museumId || '',
        museumName: result.museumName || '',
        exhibitId: result.exhibitId || '',
        exhibitName: result.exhibitName || ''
      })
      
      // 设置标题
      wx.setNavigationBarTitle({
        title: '编辑笔记'
      })
      
    } catch (error) {
      console.error('加载笔记详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 输入标题
  onTitleInput(e) {
    const value = e.detail.value
    if (value.length > 100) {
      wx.showToast({
        title: '标题最多100字',
        icon: 'none'
      })
      return
    }
    this.setData({ title: value })
  },

  // 输入内容
  onContentInput(e) {
    const value = e.detail.value
    if (value.length > 5000) {
      wx.showToast({
        title: '内容最多5000字',
        icon: 'none'
      })
      return
    }
    this.setData({ content: value })
  },

  // 选择图片
  chooseImage() {
    const { images, maxImages, uploading } = this.data
    
    if (uploading) {
      wx.showToast({
        title: '正在上传...',
        icon: 'none'
      })
      return
    }
    
    const remaining = maxImages - images.length
    if (remaining <= 0) {
      wx.showToast({
        title: `最多上传${maxImages}张图片`,
        icon: 'none'
      })
      return
    }
    
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath)
        this.uploadImages(tempFiles)
      }
    })
  },

  // 上传图片
  async uploadImages(filePaths) {
    this.setData({ uploading: true })
    
    wx.showLoading({
      title: '上传中...',
      mask: true
    })
    
    try {
      const uploadPromises = filePaths.map(filePath => 
        upload('/upload', filePath)
      )
      
      const results = await Promise.all(uploadPromises)
      const newUrls = results.map(r => r.url)
      
      this.setData({
        images: [...this.data.images, ...newUrls]
      })
      
      wx.hideLoading()
      
    } catch (error) {
      console.error('上传图片失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
    } finally {
      this.setData({ uploading: false })
    }
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: this.data.images
    })
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const images = [...this.data.images]
          images.splice(index, 1)
          this.setData({ images })
        }
      }
    })
  },

  // 显示标签输入
  showTagInputModal() {
    this.setData({ showTagInput: true, newTag: '' })
  },

  // 隐藏标签输入
  hideTagInputModal() {
    this.setData({ showTagInput: false })
  },

  // 输入新标签
  onTagInput(e) {
    const value = e.detail.value
    if (value.length > 10) {
      wx.showToast({
        title: '标签最多10字',
        icon: 'none'
      })
      return
    }
    this.setData({ newTag: value })
  },

  // 添加标签
  addTag() {
    const { newTag, tags } = this.data
    
    if (!newTag.trim()) {
      wx.showToast({
        title: '请输入标签',
        icon: 'none'
      })
      return
    }
    
    if (tags.includes(newTag.trim())) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      })
      return
    }
    
    if (tags.length >= 5) {
      wx.showToast({
        title: '最多添加5个标签',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      tags: [...tags, newTag.trim()],
      showTagInput: false,
      newTag: ''
    })
  },

  // 添加推荐标签
  addSuggestedTag(e) {
    const { tag } = e.currentTarget.dataset
    const { tags } = this.data
    
    if (tags.includes(tag)) {
      return
    }
    
    if (tags.length >= 5) {
      wx.showToast({
        title: '最多添加5个标签',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      tags: [...tags, tag]
    })
  },

  // 删除标签
  deleteTag(e) {
    const { index } = e.currentTarget.dataset
    const tags = [...this.data.tags]
    tags.splice(index, 1)
    this.setData({ tags })
  },

  // 切换可见性
  toggleVisibility(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ visibility: type })
  },

  // 保存笔记
  async saveNote() {
    const { isEdit, noteId, title, content, images, tags, visibility, museumId, exhibitId, saving } = this.data
    
    if (saving) return
    
    // 验证
    if (!content.trim()) {
      wx.showToast({
        title: '请输入笔记内容',
        icon: 'none'
      })
      return
    }
    
    this.setData({ saving: true })
    
    wx.showLoading({
      title: '保存中...',
      mask: true
    })
    
    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        images,
        tags,
        visibility
      }
      
      // 添加关联信息（新建模式）
      if (!isEdit && museumId) {
        data.museumId = museumId
      }
      if (!isEdit && exhibitId) {
        data.exhibitId = exhibitId
      }
      
      let result
      if (isEdit) {
        result = await put(`/notes/${noteId}`, data)
      } else {
        result = await post('/notes', data)
      }
      
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      
    } catch (error) {
      console.error('保存笔记失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ saving: false })
    }
  },

  // 分享
  onShareAppMessage() {
    const { museumName, exhibitName } = this.data
    let title = '博物馆笔记'
    if (museumName) {
      title = `${museumName}笔记`
    }
    return {
      title,
      path: '/pages/notes/notes'
    }
  }
})