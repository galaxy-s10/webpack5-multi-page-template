import { zepto } from '@/model/zepto';

export const myFetch = ({ type, url, data }) => {
  return new Promise((resolve, reject) => {
    zepto.ajax({
      type: type,
      url: url,
      data: data,
      success(res) {
        resolve(res);
      },
      error(err) {
        reject(err);
      },
    });
  });
};
