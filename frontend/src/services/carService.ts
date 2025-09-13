// src/service/carService.ts

import type { CarInfo, CarPicture, SaleInfo, RentInfo, Brand, CarModel, SubModel, Employee } from '../interface/Car';

const API_URL = "/cars"; // ใช้ proxy ของ Vite

// ดึงรถทั้งหมด
export async function getAllCars(): Promise<CarInfo[]> {
  const res = await fetch(`${API_URL}/`);
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
export function mapBackendCarToFrontend(data: any): CarInfo {
  // pictures
  const pictures: CarPicture[] = (data.pictures || []).map((p: any) => ({
    ID: p.ID,
    path: p.path,
    title: p.title,
    car_id: p.car_id,
  }));

  // sale_list
  const sale_list: SaleInfo[] = (data.sale_list || []).map((s: any) => ({
    ID: s.id,
    car_id: data.id,
    sale_price: s.sale_price,
    description: s.description ?? '',
    manager_id: s.managerID ?? 0,
  }));

  // rent_list
  const rent_list: RentInfo[] = (data.rent_list || []).map((r: any) => ({
    rent_price: r.rent_price,
    rent_start_date: r.rent_start_date,
    rent_end_date: r.rent_end_date,
  }));

  // brand / model / submodel
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

  // type
  let type: 'sale' | 'rent' | 'noUse' = 'noUse';
  if ((sale_list?.length ?? 0) > 0) type = 'sale';
  else if ((rent_list?.length ?? 0) > 0) type = 'rent';

  // employee (เอาจาก SaleList ตัวแรก ถ้ามี)
  let employee: Employee | undefined;
  if (data.sale_list?.length) {
    const first = data.sale_list[0];
    employee = {
      name: first.employee_name,
      phone: first.employee_phone,
    };
  }

  return {
    ID: data.id,
    carName: data.car_name,
    yearManufacture: data.year_manufacture,
    purchasePrice: data.purchase_price,
    startUseDate: data.purchase_date ?? '',
    color: data.color,
    mileage: data.mileage ?? 0,
    condition: data.condition ?? '',
    type,
    sale_list,
    rent_list,
    pictures,
    brand,
    model,
    submodel,
    province: undefined,
    employee,
  };
}
