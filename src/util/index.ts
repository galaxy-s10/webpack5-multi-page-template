/**
 * 使用json进行深克隆
 */
export const deepCloneByJson = <T>(obj: T): T =>
  JSON.parse(JSON.stringify(obj));

/**
 * 深拷贝，解决循环引用
 */
export const deepClone = <T>(obj: T): T => {
  function clone(obj, hash) {
    const newobj = Array.isArray(obj) ? [] : {};
    hash = hash || new WeakMap();
    if (hash.has(obj)) {
      return hash.get(obj);
    }
    hash.set(obj, newobj);

    Object.keys(obj).forEach((i) => {
      if (obj[i] instanceof Object) {
        newobj[i] = clone(obj[i], hash);
      } else {
        newobj[i] = obj[i];
      }
    });
    return newobj;
  }
  return clone(obj, undefined);
};

/**
 * 深拷贝，解决循环引用。但不克隆key字段。
 */
export const deepCloneExclude = (obj, key) => {
  function clone(obj, hash) {
    const newobj = Array.isArray(obj) ? [] : {};
    hash = hash || new WeakMap();
    if (hash.has(obj)) {
      return hash.get(obj);
    }
    hash.set(obj, newobj);

    Object.keys(obj).forEach((i) => {
      if (i !== key) {
        if (obj[i] instanceof Object) {
          newobj[i] = clone(obj[i], hash);
        } else {
          newobj[i] = obj[i];
        }
      }
    });
    return newobj;
  }
  return clone(obj, undefined);
};

/**
 * 模拟ajax请求
 */
export const mockAjax = async (time = 1000) => {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          msg: '模拟ajax请求成功',
          data: { list: [1, 2, 3] },
        },
      });
    }, time);
  });
};

/**
 * 删除对象中值为: null, undefined, NaN, ''的属性
 */
export const deleteUselessObjectKey = <T>(obj: T): T => {
  // @ts-ignore
  Object.keys(obj).forEach((key) => {
    if ([null, undefined, NaN, ''].includes(obj[key])) {
      delete obj[key];
    }
  });
  return obj;
};

/**
 * 判断是否浏览器运行
 */
export const isBrowser = () =>
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

/**
 * 获取地址栏参数:
 * const query = getUrlQuery()
 */
export const getUrlQuery: any = () => {
  const url = decodeURI(decodeURI(window.location.href));
  const str = url.split('?')[1];
  const obj = {};
  if (str) {
    const keys = str.split('&');
    keys.forEach((item) => {
      const arr = item.split('=');
      obj[arr[0]] = arr[1];
    });
  }
  return obj;
};

/**
 * node:dom节点
 * sty:'x' | 'y' | 'z'| 'rotate'
 * 返回值: 对应的transform的translateX/Y/Z或者rotate值
 */
export const getTranslate = (
  node: HTMLElement,
  sty: 'x' | 'y' | 'z' | 'rotate'
) => {
  function getTranslate(node, sty) {
    // 获取transform值
    const translates = document
      .defaultView!.getComputedStyle(node, null)
      .transform.substring(7);
    const result = translates.match(/\(([^)]*)\)/); // 正则()内容
    const matrix = result ? result[1].split(',') : translates.split(',');
    if (sty == 'x' || sty == undefined) {
      return matrix.length > 6 ? parseFloat(matrix[12]) : parseFloat(matrix[4]);
    } else if (sty == 'y') {
      return matrix.length > 6 ? parseFloat(matrix[13]) : parseFloat(matrix[5]);
    } else if (sty == 'z') {
      return matrix.length > 6 ? parseFloat(matrix[14]) : 0;
    } else if (sty == 'rotate') {
      return matrix.length > 6
        ? getRotate([
            parseFloat(matrix[0]),
            parseFloat(matrix[1]),
            parseFloat(matrix[4]),
            parseFloat(matrix[5]),
          ])
        : getRotate(matrix);
    }
  }
  function getRotate(matrix) {
    const aa = Math.round((180 * Math.asin(matrix[0])) / Math.PI);
    const bb = Math.round((180 * Math.acos(matrix[1])) / Math.PI);
    const cc = Math.round((180 * Math.asin(matrix[2])) / Math.PI);
    const dd = Math.round((180 * Math.acos(matrix[3])) / Math.PI);
    let deg = 0;
    if (aa == bb || -aa == bb) {
      deg = dd;
    } else if (-aa + bb == 180) {
      deg = 180 + cc;
    } else if (aa + bb == 180) {
      deg = 360 - cc || 360 - dd;
    }
    return deg >= 360 ? 0 : deg;
  }
  return getTranslate(node, sty);
};

/**
 * 随机获取[n-m]之间的随机整数
 */
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 正则验证手机号、邮箱是否合法
 */
export const regVerify = (str: string, type: 'phone' | 'email') => {
  try {
    switch (type) {
      case 'email':
        // https://ihateregex.io/expr/email
        return /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(str);
      case 'phone':
        return /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(
          str
        );
    }
  } catch (error) {
    console.error(error);
  }
};
