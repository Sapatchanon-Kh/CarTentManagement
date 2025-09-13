package controllers

import (
	"net/http"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PickupDeliveryController struct {
	DB *gorm.DB
}

func NewPickupDeliveryController(db *gorm.DB) *PickupDeliveryController {
	return &PickupDeliveryController{DB: db}
}

// POST /pickup-deliveries
func (controller *PickupDeliveryController) CreatePickupDelivery(c *gin.Context) {
	var payload struct {
		CustomerID          uint      `json:"CustomerID"`
		EmployeeID          uint      `json:"EmployeeID"`
		TypeInformationID   uint      `json:"TypeInformationID"`
		SalesContractNumber uint      `json:"SalesContractNumber"`
		PickupDate          time.Time `json:"PickupDate"`
		Address             string    `json:"Address"`
		Province            string    `json:"Province"`
		District            string    `json:"District"`
		Subdistrict         string    `json:"Subdistrict"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	var provinceID, districtID, subDistrictID *uint

	// --- vvvvv --- START: แก้ไขชื่อคอลัมน์ในการค้นหา --- vvvvv ---
	if payload.Province != "" {
		var province entity.Province
		if err := controller.DB.Where("province_name = ?", payload.Province).First(&province).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Province not found"})
			return
		}
		provinceID = &province.ID
	}

	if payload.District != "" && provinceID != nil {
		var district entity.District
		if err := controller.DB.Where("district_name = ? AND province_id = ?", payload.District, *provinceID).First(&district).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "District not found"})
			return
		}
		districtID = &district.ID
	}

	if payload.Subdistrict != "" && districtID != nil {
		var subDistrict entity.SubDistrict
		if err := controller.DB.Where("sub_district_name = ? AND district_id = ?", payload.Subdistrict, *districtID).First(&subDistrict).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "SubDistrict not found"})
			return
		}
		subDistrictID = &subDistrict.ID
	}
	// --- ^^^^^ --- END: จบส่วนที่แก้ไข --- ^^^^^ ---

	var salesContract entity.SalesContract
	if err := controller.DB.Where("id = ?", payload.SalesContractNumber).First(&salesContract).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "SalesContract not found for the given contract ID"})
		return
	}

	newPickupDelivery := entity.PickupDelivery{
		CustomerID:        payload.CustomerID,
		EmployeeID:        payload.EmployeeID,
		TypeInformationID: payload.TypeInformationID,
		SalesContractID:   salesContract.ID,
		DateTime:          payload.PickupDate,
		Address:           payload.Address,
		ProvinceID:        provinceID,
		DistrictID:        districtID,
		SubDistrictID:     subDistrictID,
		Status:            "รอดำเนินการ",
	}

	if err := controller.DB.Create(&newPickupDelivery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": newPickupDelivery})
}


// GET /pickup-deliveries
func (controller *PickupDeliveryController) GetPickupDeliveries(c *gin.Context) {
	var pickupDeliveries []entity.PickupDelivery
	if err := controller.DB.Preload("Customer").Preload("Employee").Preload("TypeInformation").Preload("SalesContract").Preload("Province").Preload("District").Preload("SubDistrict").Find(&pickupDeliveries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pickupDeliveries})
}

// GET /pickup-deliveries/:id
func (controller *PickupDeliveryController) GetPickupDeliveryByID(c *gin.Context) {
	id := c.Param("id")
	var pickupDelivery entity.PickupDelivery
	if err := controller.DB.Preload("Customer").
		Preload("Employee"). 
		Preload("TypeInformation").
		Preload("SalesContract").
		Preload("Province").
		Preload("District").
		Preload("SubDistrict").
		First(&pickupDelivery, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "PickupDelivery not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pickupDelivery})
}

// GET /pickup-deliveries/employee/:employeeID
func (controller *PickupDeliveryController) GetPickupDeliveriesByEmployeeID(c *gin.Context) {
	employeeID := c.Param("employeeID")
	var pickupDeliveries []entity.PickupDelivery
	if err := controller.DB.Preload("Customer").
		Preload("Employee").
		Preload("TypeInformation").
		Preload("SalesContract").
		Preload("Province").
		Preload("District").
		Preload("SubDistrict").
		Where("employee_id = ?", employeeID).
		Find(&pickupDeliveries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pickupDeliveries})
}

// GET /pickup-deliveries/customer/:customerID
func (controller *PickupDeliveryController) GetPickupDeliveriesByCustomerID(c *gin.Context) {
	customerID := c.Param("customerID")
	var pickupDeliveries []entity.PickupDelivery
	if err := controller.DB.Preload("Customer").Preload("Employee").Preload("TypeInformation").Preload("SalesContract").Preload("Province").Preload("District").Preload("SubDistrict").Where("customer_id = ?", customerID).Find(&pickupDeliveries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pickupDeliveries})
}

// PUT /pickup-deliveries/:id
func (controller *PickupDeliveryController) UpdatePickupDelivery(c *gin.Context) {
	id := c.Param("id")
	var pickupDelivery entity.PickupDelivery
	if err := controller.DB.First(&pickupDelivery, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "PickupDelivery not found"})
		return
	}
	// รับ Payload สำหรับอัปเดต
	var payload struct {
		EmployeeID          uint      `json:"EmployeeID"`
		TypeInformationID   uint      `json:"TypeInformationID"`
		SalesContractNumber uint      `json:"SalesContractNumber"`
		PickupDate          time.Time `json:"PickupDate"`
		Address             string    `json:"Address"`
		Province            string    `json:"Province"`
		District            string    `json:"District"`
		Subdistrict         string    `json:"Subdistrict"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}
	
	// --- vvvvv --- START: แก้ไขชื่อคอลัมน์ในการค้นหา --- vvvvv ---
	var provinceID, districtID, subDistrictID *uint
	if payload.Province != "" {
		var province entity.Province
		if err := controller.DB.Where("province_name = ?", payload.Province).First(&province).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Province not found"})
			return
		}
		provinceID = &province.ID
	}
	if payload.District != "" && provinceID != nil {
		var district entity.District
		if err := controller.DB.Where("district_name = ? AND province_id = ?", payload.District, *provinceID).First(&district).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "District not found"})
			return
		}
		districtID = &district.ID
	}
	if payload.Subdistrict != "" && districtID != nil {
		var subDistrict entity.SubDistrict
		if err := controller.DB.Where("sub_district_name = ? AND district_id = ?", payload.Subdistrict, *districtID).First(&subDistrict).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "SubDistrict not found"})
			return
		}
		subDistrictID = &subDistrict.ID
	}
	// --- ^^^^^ --- END: จบส่วนที่แก้ไข --- ^^^^^ ---

	// ค้นหาสัญญา
	var salesContract entity.SalesContract
	if err := controller.DB.Where("id = ?", payload.SalesContractNumber).First(&salesContract).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "SalesContract not found for the given contract ID"})
		return
	}

	// อัปเดตข้อมูลใน object ที่ดึงมา
	pickupDelivery.EmployeeID = payload.EmployeeID
	pickupDelivery.TypeInformationID = payload.TypeInformationID
	pickupDelivery.SalesContractID = salesContract.ID
	pickupDelivery.DateTime = payload.PickupDate
	pickupDelivery.Address = payload.Address
	pickupDelivery.ProvinceID = provinceID
	pickupDelivery.DistrictID = districtID
	pickupDelivery.SubDistrictID = subDistrictID

	// บันทึกข้อมูลที่อัปเดตลง DB
	if err := controller.DB.Save(&pickupDelivery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pickupDelivery})
}

// PATCH /pickup-deliveries/:id/status
func (controller *PickupDeliveryController) UpdatePickupDeliveryStatus(c *gin.Context) {
	id := c.Param("id")
	var pickupDelivery entity.PickupDelivery
	if err := controller.DB.First(&pickupDelivery, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "PickupDelivery not found"})
		return
	}

	var statusUpdate struct {
		Status string `json:"pickup_delivery_status"`
	}
	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pickupDelivery.Status = statusUpdate.Status
	if err := controller.DB.Save(&pickupDelivery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	var updatedPickupDelivery entity.PickupDelivery
	if err := controller.DB.Preload("Customer").
		Preload("Employee").
		Preload("TypeInformation").
		Preload("SalesContract").
		Preload("Province").
		Preload("District").
		Preload("SubDistrict").
		First(&updatedPickupDelivery, id).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"data": pickupDelivery})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": updatedPickupDelivery})
}

// DELETE /pickup-deliveries/:id
func (controller *PickupDeliveryController) DeletePickupDelivery(c *gin.Context) {
	id := c.Param("id")
	if err := controller.DB.Delete(&entity.PickupDelivery{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "PickupDelivery deleted successfully"})
}