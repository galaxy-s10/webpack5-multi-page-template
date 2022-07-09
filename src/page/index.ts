import { startLoading, endLoading } from '@/component/loading';
import { showVersion } from '@/model/showVersion';
import '@/css/index.scss';
showVersion();
startLoading();
setTimeout(() => {
  endLoading();
}, 1000);
console.log('index页面');
