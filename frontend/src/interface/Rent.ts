// src/interface/Rent.ts
import type { Dayjs } from 'dayjs';

export interface RentPeriod {
  id?: number;
  rent_price: number;
  rent_start_date: string;
  rent_end_date: string;
  temp?: boolean;
  status?: string;
}

export interface RentPeriodWithRange extends RentPeriod {
  range?: [Dayjs | null, Dayjs | null]; // สำหรับ RangePicker
  status?: 'available' | 'booked';
  temp?: boolean;
}

export interface SaleEntry {
  sale_price: number;
}

export interface CarPicture {
  id: number;
  title: string;
  path: string;  // URL หรือ path ของรูป
}

export interface CarResponse {
  id: number;                  // id ของรถ
  car_name: string;            // ชื่อรถ
  year_manufacture: number;    // ปีผลิต
  color: string;               // สี
  mileage: number;             // ระยะทาง
  condition: string;           // สภาพรถ
  sale_list?: SaleEntry[] | null;   // optional เพราะ backend ส่ง null บางครั้ง
  rent_list: RentPeriod[];          // array ของช่วงเช่า
  pictures?: CarPicture[];          // optional array ของรูปภาพ
}
