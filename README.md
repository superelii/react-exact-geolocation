# useGetGeolocation

## 介绍

`useGetGeolocation` 是一个自定义 React 钩子，旨在从浏览器的地理位置 API 获取地理位置数据，然后使用高德地图 API 根据经纬度坐标检索详细的地址信息。

## 安装

首先，确保你的项目中已经安装了 axios 和 prop-types。如果没有，你可以使用以下命令进行安装：

```bash
npm install axios prop-types

```
或者

```bash
yarn add axios prop-types

```
## 使用方法
### 导入Hook
在你的 React 组件中导入 useGetGeolocation：

```bash
import useGetGeolocation from 'react-exact-geolocation/useGetGeolocation';

```
### 使用钩子
调用 useGetGeolocation 并传递你的高德地图 API 密钥作为参数：

```bash
const apiKey = 'YOUR_AMAP_API_KEY'; // 替换为你的实际高德地图 API 密钥
const {
  position,
  country,
  province,
  city,
  district,
  township,
  error,
  loading
} = useGetGeolocation(apiKey);

```
### 参数
apiKey (字符串)：你的高德地图 API 密钥。



