import interfaceImage from '../assets/interface.svg'
import quietImage from '../assets/quiet.svg'
import waveImage from '../assets/wave.svg'
import bookImage from '../assets/book.svg'
import avatar from '../assets/avatar.jpg'

export { avatar }
export const covers = [
  { id: 'interface', label: '蓝色雕塑', src: interfaceImage, alt: '展台上悬浮的蓝色环形雕塑' },
  { id: 'quiet', label: '安静空间', src: quietImage, alt: '阳光照入安静的混凝土空间' },
  { id: 'wave', label: '思考波浪', src: waveImage, alt: '黑色背景上起伏的银蓝色网格波浪' },
  { id: 'book', label: '离线阅读', src: bookImage, alt: '窗边木桌上摊开的一本书' },
]
export function coverFor(id) { return covers.find(cover => cover.id === id) || covers[0] }
