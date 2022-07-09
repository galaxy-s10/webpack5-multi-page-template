import { zepto } from '@/model/zepto';
import './index.scss';

const loadingEle = zepto('#loading-wrap');

// 默认loading的颜色是skyblue
export const setLoadingColor = (color = 'skyblue') =>
  loadingEle.css('--color', color);

export const startLoading = () => loadingEle.css('display', 'block');
export const endLoading = () => loadingEle.css('display', 'none');
