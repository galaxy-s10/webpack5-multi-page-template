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
  // document.body.appendChild(toastEle);
  // 使用appendChild追加到body底部的话，可能会把节点生成在script标签后面，
  // 如果script使用了src或者defer等标识了是异步的，即使节点在script后面也没事
  // 但是如果是script标签内联了代码，就可能会报错找不到节点
  document.body.insertBefore(toastEle, document.body.firstChild);
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
