import './index.scss';

let loadingEle: HTMLElement | null = null;
let containerEle: HTMLElement | null = null;

interface IConfig {
  /** loading颜色,默认:skyblue */
  color?: string;
  /** loading期间是否能点击,默认:false,不能点击 */
  allowClick?: boolean;
}

let config: IConfig = { color: 'skyblue', allowClick: false };

export const initLoading = (initConfig?: IConfig) => {
  config = Object.assign(config, initConfig);
  loadingEle = document.createElement('div');
  loadingEle.id = 'loading-modal';
  loadingEle.setAttribute('style', `--color:${config?.color}`);
  loadingEle.style.display = 'none';
  loadingEle.style.pointerEvents = config?.allowClick ? 'none' : 'auto';
  containerEle = document.createElement('div');
  containerEle.className = 'container';
  loadingEle.appendChild(containerEle);
  // document.body.appendChild(loadingEle);
  // 使用appendChild追加到body底部的话，可能会把节点生成在script标签后面，
  // 如果script使用了src或者defer等标识了是异步的，即使节点在script后面也没事
  // 但是如果是script标签内联了代码，就可能会报错找不到节点
  document.body.insertBefore(loadingEle, document.body.firstChild);
};

export const startLoading = () => {
  if (!containerEle || !loadingEle) {
    console.error('please initLoading');
    return;
  }
  loadingEle.style.display = 'block';
};

export const endLoading = () => {
  if (!containerEle || !loadingEle) {
    console.error('please initLoading');
    return;
  }
  loadingEle.style.display = 'none';
};
