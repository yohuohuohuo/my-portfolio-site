import axios from 'axios';
import { createContext } from 'react';
import { BaseApi } from '../const';

export const AxiosContext = createContext<any>(null);

export const axiosInstance = axios.create({
  baseURL: BaseApi,
});
axiosInstance.interceptors.request.use((config) => {
  const serviceMap = {
    internal: '',
    external: BaseApi,
  };

  // 根据请求路径前缀匹配服务
  if (config.url) {
    if (config.url.startsWith('/internal')) {
      config.baseURL = serviceMap.internal;
      config.url = config.url.replace(`/internal`, ''); // 移除前缀
    }
  }

  return config;
});
axiosInstance.interceptors.response.use((response) => {
  if (response.status !== 200) {
    return { code: response.status, msg: response.statusText || 'Internet Error' };
  }
  return response.data;
});

export const AxiosInstanceProvider = ({ children }: any) => {
  return <AxiosContext.Provider value={axiosInstance}>{children}</AxiosContext.Provider>;
};
