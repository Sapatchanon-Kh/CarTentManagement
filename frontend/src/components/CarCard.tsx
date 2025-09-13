// src/components/CarCard.tsx
import React, { useState, useRef } from "react";
import type { CarInfo } from "../interface/Car";
import {
  Card,
  Typography,
  Tag,
  Modal,
  Carousel,
  Button,
  Divider,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface CarCardProps {
  car: CarInfo;
  type: "sale" | "rent" | "noUse" | "saleView" | "rentView";
}

const CarCard: React.FC<CarCardProps> = ({ car, type }) => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const carouselRef = useRef<any>(null);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);
  const handlePrev = () => carouselRef.current?.prev();
  const handleNext = () => carouselRef.current?.next();

  // ดึงพนักงานจาก sale_list (แค่ตัวแรก)
  const employee =
    car.sale_list && car.sale_list.length > 0
      ? {
        name: car.employee?.name,
        phone: car.employee?.phone,
      }
      : null;

  // render เนื้อหาตาม type
  const renderContent = () => {
    switch (type) {
      
      
      case "sale":
  const saleId = car.sale_list?.[0]?.ID; // <-- ประกาศตัวแปรก่อนใช้
  const price = Number(car.sale_list?.[0]?.sale_price) || 0;
        return (
          <>
            <Tag color="green">รถสำหรับขาย</Tag>
            <Divider />
            <Text>ราคา: {car.sale_list?.[0]?.sale_price?.toLocaleString()} บาท</Text>
            <Divider />
            {employee && (
              <div>
                <Title level={5}>ติดต่อพนักงาน</Title>
                <p>ชื่อ: {employee.name || "-"}</p>
                <p>เบอร์: {employee.phone || "-"}</p>
              </div>
            )}
            <Divider />
            <Button type="primary" onClick={() => navigate(`/edit-sell/${saleId}`)}
               disabled={!saleId}>
              แก้ไขการขาย
            </Button>
          </>
        );

      case "rent":
        return (
          <>
            <Tag color="blue">รถสำหรับเช่า</Tag>
            <Divider />
            <Text>ค่าเช่า: {car.rent_list?.[0]?.rent_price?.toLocaleString()} บาท/วัน</Text>
            <Divider />
            <Button type="primary" onClick={() => navigate(`/add-rent/${car.ID}`)}>
              เพิ่มหรือแก้ไขการเช่า
            </Button>
          </>
        );

      case "noUse":
        return (
          <>
            <Tag color="red">ยังไม่ถูกใช้งาน</Tag>
            <Divider />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", width: "100%" }}>
            <Button type="primary" onClick={() => navigate(`/edit-car/${car.ID}`)}>
              แก้ไข
            </Button>
            <Button type="primary" onClick={() => navigate(`/add-rent/${car.ID}`)}>
              ปล่อยเช่า
            </Button>
             <Button type="primary" onClick={() => navigate(`/add-sell/${car.ID}`)}>
              ขาย
            </Button>
            </div>
          </>
        );

      case "saleView":
        return (
          <>
            <Text>ราคา: {car.sale_list?.[0]?.sale_price?.toLocaleString()} บาท</Text>
            <Divider />
            <Text>รายละเอียด: {car.sale_list?.[0]?.description}</Text>
            {employee && (
              <>
                <Divider />
                <Title level={5}></Title>
            
               <Button type="primary" onClick={() => navigate(`/buycar-details/${car.ID}`)}>
              ดูรายละเอียด
            </Button>
              </>
            )}
          </>
        );

      case "rentView":
        return (
          <>
            <Text>ค่าเช่า: {car.rent_list?.[0]?.rent_price?.toLocaleString()} บาท/วัน</Text>
            <br />
            <Text>
              ช่วงเวลา: {car.rent_list?.[0]?.rent_start_date} -{" "}
              {car.rent_list?.[0]?.rent_end_date}
            </Text>
            <Divider />
            <Button type="primary" onClick={() => navigate(`/rentcar-details/${car.ID}`)}>
              ดูรายละเอียด
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card
        hoverable
        style={{
          width: 340,
          margin: "10px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
        cover={
          <img
            alt={car.carName}
            src={`http://localhost:8080/images/cars/${car.pictures?.find((p) => p.title === "Main")?.path || ""}`}
            style={{ height: 200, objectFit: "cover" }}
            onClick={showModal}
          />
        }
      >
        <Title level={4}>{car.carName}</Title>
        <Text>ปี: {car.yearManufacture}</Text>
        <br />
        <Text>สี: {car.color}</Text>
        <br />
        <Text>ไมล์: {car.mileage?.toLocaleString()} km</Text>
        <br />
        <Text>สภาพ: {car.condition}</Text>
        <Divider />
        {renderContent()}
      </Card>

      {/* Modal ดูรูปทั้งหมด */}
      <Modal open={isModalVisible} onCancel={handleCancel} footer={null} width={800}>
        <Carousel ref={carouselRef}>
          {car.pictures?.map((pic, index) => (
            <div key={index}>
              <img
                src={`http://localhost:8080/images/cars/${pic.path}`}
                alt={pic.title || `Car ${index}`}
                style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
              />
            </div>
          ))}
        </Carousel>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <Button icon={<LeftOutlined />} onClick={handlePrev}>
            ก่อนหน้า
          </Button>
          <Button icon={<RightOutlined />} onClick={handleNext}>
            ถัดไป
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CarCard;
