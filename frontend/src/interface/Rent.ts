// src/interface/Rent.ts

import type { Dayjs } from 'dayjs';

// src/interface/Rent.ts

// ✅ เพิ่ม interface DateforRent ไว้ในไฟล์นี้เลย
export interface DateforRent {
  ID: number;
  open_date: string;
  close_date: string;
  rent_price: number;
}

// ✅ แก้ไข interface RentList ให้ตรงกับ Backend
export interface RentList {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  car_id: number;
  status: string;
  manager_id: number;
  employee_id: number;
  // rent_able_dates ใน Backend มีโครงสร้างที่ซับซ้อนกว่า
  // แต่จาก controller เราจะรับข้อมูลที่ถูก map แล้ว
  // ดังนั้นโครงสร้างนี้จะขึ้นอยู่กับ response ที่แท้จริงจาก API
  rent_able_dates?: DateforRent[];
  rent_contracts?: any[];
}

export interface RentPeriod {
  rent_price: number;
  rent_start_date: string;
  rent_end_date: string;
}

export interface CarResponse {
  ID: number;
  rent_list: RentPeriod[];
}

export interface RentPeriod {
  id?: number;                 // ID ของ DateforRent
  rent_price: number;          // ราคาต่อวัน
  rent_start_date: string;     // วันที่เริ่มเช่า (YYYY-MM-DD)
  rent_end_date: string;       // วันที่สิ้นสุดเช่า (YYYY-MM-DD)
  temp?: boolean;              // ช่วงชั่วคราวใน frontend
}

export interface RentPeriodWithRange extends RentPeriod {
  range: [Dayjs | null, Dayjs | null]; // สำหรับ RangePicker
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
