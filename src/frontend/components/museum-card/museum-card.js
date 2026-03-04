// components/museum-card/museum-card.js
Component({
  properties: {
    // 展品数据
    data: {
      type: Object,
      value: {}
    },
    // 是否显示标签
    showTags: {
      type: Boolean,
      value: true
    },
    // 卡片样式：horizontal（横向） / vertical（纵向）
    layout: {
      type: String,
      value: 'horizontal'
    }
  },

  data: {},

  methods: {
    // 点击卡片
    onTap() {
      const { data } = this.properties
      this.triggerEvent('tap', { id: data._id, data })
    },

    // 预览图片
    onPreviewImage(e) {
      const { url } = e.currentTarget.dataset
      const { data } = this.properties
      
      wx.previewImage({
        current: url,
        urls: [data.imageUrl]
      })
    },

    // 收藏
    onCollect(e) {
      const { data } = this.properties
      this.triggerEvent('collect', { id: data._id, data })
    },

    // 分享
    onShare(e) {
      const { data } = this.properties
      this.triggerEvent('share', { id: data._id, data })
    }
  }
})