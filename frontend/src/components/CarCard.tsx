// src/components/CarCard.tsx
import React, { useState, useRef } from "react";
import type { CarInfo, CarType } from "../interface/Car";
import { Card, Typography, Modal, Carousel, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface CarCardProps {
  car: CarInfo;
  type: CarType;
}

const CarCard: React.FC<CarCardProps> = ({ car, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const carouselRef = useRef<any>(null);
  const navigate = useNavigate();

  const images = car.pictures?.map((p) => p.path) || [];

  const renderActions = () => {
    switch (type) {
      case "sale":
        return [
          <Button key="edit" type="link" onClick={() => navigate(`/edit-sell/${sale.ID}`)}>แก้ไข</Button>,
          <Button key="cancelSale" type="link" danger onClick={() => navigate(`/sell`)}>ยกเลิกการขาย</Button>,
        ];
      case "rent":
        return [
          <Button key="edit" type="link" onClick={() => navigate(`/edit-rent/${car.ID}`)}>แก้ไข</Button>,
          <Button key="addRent" type="link" onClick={() => navigate(`/add-rent/${car.ID}`)}>เพิ่มช่วงปล่อยเช่า</Button>,
        ];
      case "noUse":
        return [
          <Button key="edit" type="link" onClick={() => navigate(`/edit-car/${car.ID}`)}>แก้ไข</Button>,
          <Button key="setRent" type="link" onClick={() => navigate(`/add-rent/${car.ID}`)}>ปล่อยเช่า</Button>,
          <Button key="setSale" type="link" onClick={() => navigate(`/add-sell/${car.ID}`)}>ขาย</Button>,
        ];
      case "rentView":
        return [
          <Button key="detail" type="link" onClick={() => navigate(`/rentcar-details/${car.ID}`)}>รายละเอียด</Button>,
        ];
      case "saleView":
        return [
          <Button key="detail" type="link" onClick={() => navigate(`/buycar-details/${car.ID}`)}>รายละเอียด</Button>,
        ];
      default:
        return [];
    }
  };

  // ฟังก์ชันแสดงข้อมูลราคา / สถานะ ตาม type
  const renderInfo = () => {
    switch (type) {
      case "sale":
        return car.sale_list?.length ? (
          <Text>ราคาขาย: {car.sale_list[0].sale_price.toLocaleString()} บาท</Text>
        ) : null;
      case "rent":
        return car.rent_list?.length ? (
          <>
            <Text>ราคาเช่า: {car.rent_list[0].rent_price.toLocaleString()} บาท/วัน</Text>
            <br />
            <Text>เริ่มเช่า: {car.rent_list[0].rent_start_date}</Text>
          </>
        ) : null;
      case "noUse":
        return (
          <>
            {car.purchasePrice && <Text>ราคาซื้อ: {car.purchasePrice.toLocaleString()} บาท</Text>}
            <br />
          </>
        );
      case "rentView":
        return car.rent_list?.length ? (
          <>
            <Text strong>ราคาเช่า: {car.rent_list[0].rent_price.toLocaleString()} บาท/วัน</Text>
            <br />
            <Text>เริ่มเช่า: {car.rent_list[0].rent_start_date}</Text>
          </>
        ) : null;
      case "saleView":
        return car.sale_list?.length ? (
          <Text strong>ราคาขาย: {car.sale_list[0].sale_price.toLocaleString()} บาท</Text>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <Card
        hoverable
        style={{ width: 300, margin: 10 }}
        cover={
          images.length ? (
            <img
              alt={car.carName}
              src={images[0]}
              onClick={() => setIsOpen(true)}
              style={{ cursor: "pointer", objectFit: "cover", height: 180 }}
            />
          ) : null
        }
        actions={renderActions()}
      >
        <Title level={5}>{car.carName} ปี {car.yearManufacture}</Title>
        <Text>สภาพ: {car.condition}</Text>
        <br />
        {renderInfo()}
      </Card>

      <Modal open={isOpen} footer={null} onCancel={() => setIsOpen(false)} width={600}>
        <div style={{ position: "relative" }}>
          <Carousel ref={carouselRef} dots={false}>
            {images.map((img, idx) => (
              <div key={idx}>
                <img src={img} alt={`car-${idx}`} style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }} />
              </div>
            ))}
          </Carousel>
          <LeftOutlined onClick={() => carouselRef.current.prev()} style={{ position: "absolute", top: "50%", left: 0 }} />
          <RightOutlined onClick={() => carouselRef.current.next()} style={{ position: "absolute", top: "50%", right: 0 }} />
        </div>
      </Modal>
    </>
  );
};

export default CarCard;
