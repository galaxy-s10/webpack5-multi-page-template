import { startLoading, endLoading } from '@/component/loading';
import showProjectInfo from '@/model/showProjectInfo';
import '@/css/index.scss';
showProjectInfo();
startLoading();
setTimeout(() => {
  endLoading();
}, 1000);
console.log('index页面');
