// path: backend/services/booking_service.go

package services

import (
	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

type BookingService struct {
	db *gorm.DB
}

func NewBookingService(db *gorm.DB) *BookingService {
	return &BookingService{db: db}
}

func (s *BookingService) Create(booking *entity.Booking) error {
	return s.db.Create(booking).Error
}

func (s *BookingService) CheckExistingBooking(customerID uint, saleListID uint) (bool, error) {
	var count int64
	err := s.db.Model(&entity.Booking{}).
		Where("customer_id = ? AND sale_list_id = ?", customerID, saleListID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

