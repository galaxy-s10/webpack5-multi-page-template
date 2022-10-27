import { startLoading, endLoading } from '@/component/loading';
import '@/css/index.scss';

startLoading();

setTimeout(() => {
  endLoading();
}, 1000);

console.log('index页面');
