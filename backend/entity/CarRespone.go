package entity

import (
	"time"
)

type CarResponse struct {
	ID              uint         `json:"id"`
	CarName         string       `json:"car_name"`
	YearManufacture int          `json:"year_manufacture"`
	Color           string       `json:"color"`
	PurchasePrice   float64      `json:"purchase_price"`
	PurchaseDate    time.Time    `json:"purchase_date"`
	Mileage         int          `json:"mileage"`
	Condition       string       `json:"condition"`
	SaleList        []SaleEntry  `json:"sale_list"`
	RentList        []RentPeriod `json:"rent_list"`
	Pictures        []CarPicture `json:"pictures"`
	Detail          DetailFilter `json:"cardetail"`
}

type SaleEntry struct {
	ID            uint    `json:"id"`
	Status        string  `json:"sale_status"`
	Description   string  `json:"description"`
	SalePrice     float64 `json:"sale_price"`
	EmployeeName  string  `json:"employee_name"`
	EmployeePhone string  `json:"employee_phone"` // เพิ่มเบอร์โทร
}
type RentPeriod struct {
	ID            uint    `json:"id"` // DateforRent.ID
	RentPrice     float64 `json:"rent_price"`
	RentStartDate string  `json:"rent_start_date"`
	RentEndDate   string  `json:"rent_end_date"`
	Status        string  `json:"period_status"`
	Description   string  `json:"description"`
}

type DetailFilter struct {
	Brand    Brand    `json:"brand"`
	Model    CarModel `json:"model"`
	SubModel SubModel `json:"submodel"`
}
