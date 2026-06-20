export default defineAppConfig({
  pages: [
    'pages/inspection/index',
    'pages/photos/index',
    'pages/rectification/index',
    'pages/inspection-detail/index',
    'pages/photo-mark/index',
    'pages/rectification-detail/index',
    'pages/board/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E88E5',
    navigationBarTitleText: '模板支撑复核助手',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1E88E5',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/inspection/index',
        text: '今日检查'
      },
      {
        pagePath: 'pages/photos/index',
        text: '拍照记录'
      },
      {
        pagePath: 'pages/rectification/index',
        text: '整改清单'
      },
      {
        pagePath: 'pages/board/index',
        text: '闭环看板'
      }
    ]
  }
})
