// src/service/carService.ts
import axios from 'axios';
import type { CarInfo, CarPicture, SaleInfo, RentInfo, Brand, CarModel, SubModel,Employee,CarType} from '../interface/Car';

const API_URL = "http://localhost:8080/cars";

export const getCarById = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// ดึงรถทั้งหมด
export async function getAllCars(): Promise<CarInfo[]> {
  const res = await fetch(`${API_URL}`);
  if (!res.ok) throw new Error(`Failed to fetch cars: ${res.statusText}`);
  const data = await res.json();
  return data.map(mapBackendCarToFrontend);
}

// ดึงรถตาม ID
export async function getCarByID(id: number): Promise<CarInfo> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch car by ID: ${res.statusText}`);
  const data = await res.json();
  return mapBackendCarToFrontend(data);
}

// map JSON backend → CarInfo
// map JSON backend → CarInfo
export function mapBackendCarToFrontend(data: any): CarInfo {
  // Map pictures
  const pictures: CarPicture[] = (data.pictures || []).map((p: any) => ({
    ID: p.ID,
    path: p.path,
    title: p.title,
    car_id: p.car_id,
  }));

  // Map sale_list
  const saleList: SaleInfo[] = (data.sale_list || []).map((s: any) => ({
    ID: s.id,
    car_id: data.id,
    sale_price: s.sale_price,
    manager_id: s.manager_id ?? 0, // เผื่อ backend ยังไม่ได้ส่ง
    employee_id: s.employee_id,
    description: s.description,
    status: s.sale_status,
    car: undefined, // ป้องกัน loop
  }));

  // Map rent_list
  const rentList: RentInfo[] = (data.rent_list || []).map((r: any) => ({
    rent_price: r.rent_price,
    rent_start_date: r.rent_start_date,
    rent_end_date: r.rent_end_date,
  }));

  // Map employee (เลือกจาก sale_list อันแรกก่อน)
  let employee: Employee | undefined = undefined;
  if (data.sale_list && data.sale_list.length > 0) {
    employee = {
      name: data.sale_list[0].employee_name,
      phone: data.sale_list[0].employee_phone,
    };
  }

  // Map brand, model, submodel
  const brand: Brand | undefined = data.cardetail?.brand
    ? {
        ID: data.cardetail.brand.ID,
        brandName: data.cardetail.brand.brand_name,
      }
    : undefined;

  const model: CarModel | undefined = data.cardetail?.model
    ? {
        ID: data.cardetail.model.ID,
        modelName: data.cardetail.model.ModelName,
        brandID: data.cardetail.model.brandId,
      }
    : undefined;

  const submodel: SubModel | undefined = data.cardetail?.submodel
    ? {
        ID: data.cardetail.submodel.ID,
        submodelName: data.cardetail.submodel.SubModelName,
        carModelID: data.cardetail.submodel.CarModelID,
      }
    : undefined;

  return {
    ID: data.id,
    carName: data.car_name,
    yearManufacture: data.year_manufacture,
    purchasePrice: data.purchase_price,
    startUseDate: data.purchase_date,
    color: data.color,
    mileage: data.mileage,
    condition: data.condition,
    pictures,
    sale_list: saleList,
    rent_list: rentList,
    brand,
    model,
    submodel,
    employee,
  };
}