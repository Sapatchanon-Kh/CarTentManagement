// src/interface/Customer.ts
import type dayjs from "dayjs";

export interface Customer {
    ID: number; // เปลี่ยนจาก string เป็น number
    first_name: string;
    last_name: string;
    Password: string;
    Email: string;
    phone: string;
    Birthday: dayjs.Dayjs;
}