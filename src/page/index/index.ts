import { initLoading, startLoading, endLoading } from '@/component/loading';
import { initToast, showToast, hiddenToast } from '@/component/toast';

import './index.scss';

initToast({ duration: 2000 });
initLoading();
startLoading();

setTimeout(() => {
  endLoading();
}, 1000);

setTimeout(() => {
  showToast('hello world');

  setTimeout(() => {
    hiddenToast();
  }, 1000);
}, 1500);
