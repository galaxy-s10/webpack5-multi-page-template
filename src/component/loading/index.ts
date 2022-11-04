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
  document.body.appendChild(loadingEle);
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
