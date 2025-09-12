package entity

type CarResponse struct {
	ID              uint         `json:"id"`
	CarName         string       `json:"car_name"`
	YearManufacture int          `json:"year_manufacture"`
	Color           string       `json:"color"`
	Mileage         int          `json:"mileage"`
	Condition       string       `json:"condition"`
	SaleList        []SaleEntry  `json:"sale_list"`
	RentList        []RentPeriod `json:"rent_list"`
	Pictures        []CarPicture `json:"pictures"`
	Status          string       `json "status"`
}

type SaleEntry struct {
	SalePrice float64 `json:"sale_price"`
}

type RentPeriod struct {
	ID            uint    `json:"id"` // DateforRent.ID
	RentPrice     float64 `json:"rent_price"`
	RentStartDate string  `json:"rent_start_date"`
	RentEndDate   string  `json:"rent_end_date"`
	Status        string  `json:"period_status"` // เพิ่ม status
}
