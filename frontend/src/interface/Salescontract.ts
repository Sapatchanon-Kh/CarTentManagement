import type { SaleList } from "./Car";
import type { Employee } from "./Employee";

export interface SalesContract {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;

  SaleListID: number;
  SaleList?: SaleList | null;

  EmployeeID: number;
  Employee?: Employee | null;

  CustomerID: number;
  Customer?: unknown | null;

  InspectionAppointments?: unknown | null;
  Payment?: unknown | null;
}

export interface SaleListInfo {
  ID: number;
  EmployeeID: number;
}