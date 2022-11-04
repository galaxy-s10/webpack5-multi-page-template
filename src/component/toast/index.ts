import './index.scss';

let toastEle: HTMLElement | null = null;
let containerEle: HTMLElement | null = null;
let timer: any = null;

interface IConfig {
  /** 持续时间，默认1000毫秒 */
  duration: number;
  /** 期间是否能点击,默认:false,不能点击 */
  allowClick?: boolean;
}
let config: IConfig = { duration: 1000, allowClick: false };

export const initToast = (initConfig?: IConfig) => {
  config = Object.assign(config, initConfig);
  toastEle = document.createElement('div');
  toastEle.id = 'toast-modal';
  toastEle.style.display = 'none';
  toastEle.style.pointerEvents = config?.allowClick ? 'none' : 'auto';
  containerEle = document.createElement('div');
  containerEle.className = 'container';
  toastEle.appendChild(containerEle);
  document.body.appendChild(toastEle);
};

export const showToast = (content: string, newConfig?: IConfig) => {
  if (!containerEle || !toastEle) {
    console.error('please initToast');
    return;
  }
  containerEle.innerHTML = content;
  toastEle.style.display = 'block';
  timer = setTimeout(() => {
    clearToast();
  }, newConfig?.duration || config.duration);
};

export const hiddenToast = () => {
  if (!containerEle || !toastEle) {
    console.error('please initToast');
    return;
  }
  containerEle.innerHTML = '';
  toastEle.style.display = 'none';
};

export const clearToast = () => {
  hiddenToast();
  clearTimeout(timer);
};
