import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const useGetGeolocation = (apiKey) => {

  // 存储位置信息
  const [position, setPosition] = useState(null);
  const [country, setCountry] = useState(null);
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);
  const [cityCode, setCityCode] = useState(null);
  const [district, setDistrict] = useState(null); 
  const [township, setTownship] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCityInfo = useCallback(async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://restapi.amap.com/v3/geocode/regeo`, {
        params: {
          key: apiKey,
          location: `${longitude},${latitude}`,
          extensions: 'all',
        },
      });
      setCountry(response.data.regeocode.addressComponent.country);
      setProvince(response.data.regeocode.addressComponent.province);
      setCity(response.data.regeocode.addressComponent.city);
      setCityCode(response.data.regeocode.addressComponent.citycode);
      setDistrict(response.data.regeocode.addressComponent.district);
      setTownship(response.data.regeocode.addressComponent.township);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          getCityInfo(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, [apiKey, getCityInfo]);


  return { position, country, province, city, cityCode, district, township, error, loading };
};

useGetGeolocation.propTypes = {
  apiKey: PropTypes.string
};

export default useGetGeolocation;