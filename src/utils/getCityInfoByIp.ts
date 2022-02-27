import axios from 'axios'
import config from '../config'

/* interface IReqData {
  address: string
  content: ICityInfo
  status: number
}

interface ICityInfo {
  address: string
  address_detail: IAddressDetail
  point: IPoint
}

interface IAddressDetail {
  adcode: string
  city: string
  city_code: string
  district: string
  province: string
  street: string
  street_number: string
}

interface IPoint {
  x: string
  y: string
} */

const {
  map: { url, ak, coor }
} = config

export default async function getCityInfoByIp(ip: string) {
  const reqUrl = `${url}?ak=${ak}&ip=${ip}&coor=${coor}`
  const cityInfo = await axios.get<any, any>(reqUrl)

  const {
    content: {
      address_detail: { city },
      point: { x, y }
    }
  } = cityInfo.data

  return {
    city: city.replace('市', ''),
    longitude: x,
    latitude: y
  }
}
