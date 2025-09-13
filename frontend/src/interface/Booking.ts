export interface Booking {
    ID: number;

    SaleListID: number;
    SaleList?: unknown| null;

    CustomerID: number;
    Customer?: unknown | null;
}