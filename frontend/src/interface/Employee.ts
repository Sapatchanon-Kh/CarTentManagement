// src/interface/Employee.ts
export interface Employee {
  ID: number; // เปลี่ยนจาก id เป็น ID
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  profileImage: string;
  firstName: string;
  lastName: string;
  password?: string;
  email: string;
  phone: string;
  address: string;
  startDate: string;

  sex: Sex;

  position: string;
  jobType: string;
  salary: number; // <-- เพิ่ม salary
  totalSales: number;
  birthday: string; // <-- เพิ่ม birthday
  employeeID: string; // <-- เพิ่ม employeeID
}

// แก้ไขค่าใน Type 'Sex' ให้เป็นตัวพิมพ์เล็กทั้งหมด
export type Sex = 'male' | 'female' | 'other';