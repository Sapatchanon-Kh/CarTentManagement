export type Sex = "" | "male" | "female" | "other";
export type JobType = "" | "Full-time" | "Part-time" | "Contract";

export interface Employee {
  employeeID: number;
  profileImage: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  sex: Sex;
  birthday?: string;  // ✅ ใช้ string (YYYY-MM-DD)
  position: string;
  jobType: JobType;
  totalSales: string;
}
