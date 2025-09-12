import axios from 'axios';
import type { CarInfo } from '../interface/Car';

const API_URL = 'http://localhost:8080/cars';
const IMAGE_BASE_URL = 'http://localhost:8080/images/cars';

export const fetchCars = async (): Promise<CarInfo[]> => {
  const response = await axios.get(API_URL);
  return response.data.map(mapCar);
};

export const fetchCarById = async (id: string | number): Promise<CarInfo> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return mapCar(response.data);
};

// ----------------- Mapper -----------------
const mapCar = (data: any): CarInfo => ({
  ID: data.ID,
  carName: data.car_name,
  yearManufacture: data.year_manufacture,
  purchasePrice: data.purchase_price,
  startUseDate: data.purchase_date,
  color: data.color,
  mileage: data.mileage,
  condition: data.condition,

  brand: data.detail?.Brand
    ? { ID: data.detail.Brand.ID, brandName: data.detail.Brand.brand_name }
    : undefined,

  model: data.detail?.CarModel
    ? { ID: data.detail.CarModel.ID, modelName: data.detail.CarModel.ModelName, brandID: data.detail.CarModel.brandId }
    : undefined,

  submodel: data.detail?.SubModel
    ? { ID: data.detail.SubModel.ID, submodelName: data.detail.SubModel.SubModelName, carModelID: data.detail.SubModel.CarModelID }
    : undefined,

  province: data.province ? { ID: data.province.ID, provinceName: data.province.province_name } : undefined,

  pictures: data.pictures?.map((p: any) => ({
    ID: p.ID,
    path: `${IMAGE_BASE_URL}/${p.path}`,
    title: p.title,
    car_id: p.car_id,
  })),

  sale_list: data.sale_list?.map((s: any) => ({ sale_price: s.sale_price })) || [],
  rent_list: data.rent_list?.map((r: any) => ({
    rent_price: r.rent_price,
    rent_start_date: r.rent_start_date,
    rent_end_date: r.rent_end_date,
  })) || [],
  
  employee: data.employee
    ? {
        ID: data.employee.ID,
        fristname: data.employee.firstName,
        lastname:data.employee.lastName,
        phone: data.employee.phone,
      }
    : undefined,
});
