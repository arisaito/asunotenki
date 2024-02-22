// MEMO: ブラウザの情報取得で使用するTSファイルです

export default class Info {

  isMobile: boolean
  W: number
  H: number

  constructor() {
    this.onResize()
    this.bindEvents()
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.onResize() })
  }

  onResize() {
    this.isMobile = window.matchMedia('(max-width: 767px)').matches
    this.W = window.innerWidth
    this.H = window.innerHeight
  }

}