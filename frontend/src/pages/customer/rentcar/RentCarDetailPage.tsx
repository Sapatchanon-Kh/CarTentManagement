import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Image,
  Button,
  Divider,
  Form,
  Modal,
  message,
} from "antd";
import { PushpinOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAuth } from "../../../hooks/useAuth";
import CusRentDateRange from "../../../components/CusRentDateRange";

import type { CarInfo } from "../../../interface/Car";
import { getCarByID } from "../../../services/carService";

const { Title } = Typography;

const RentCarDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [form] = Form.useForm();

  const [car, setCar] = useState<CarInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [rentModalVisible, setRentModalVisible] = useState(false);
  const [selectedRentRange, setSelectedRentRange] = useState<dayjs.Dayjs[]>([]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        if (!id) return;
        const data = await getCarByID(Number(id));
        setCar(data);
      } catch (error) {
        console.error(error);
        message.error("ไม่สามารถโหลดข้อมูลรถได้");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
    window.scrollTo({ top: 0 });
  }, [id]);

  useEffect(() => {
    if (user && location.state?.openModal === "rent") {
      setRentModalVisible(true);
      navigate(location.pathname, { replace: true });
    }
  }, [user, location, navigate]);

  useEffect(() => {
    if (rentModalVisible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [rentModalVisible]);

  if (loading) return <div>กำลังโหลดข้อมูลรถ...</div>;
  if (!car) return <div>ไม่พบรถที่ต้องการ</div>;

  const handleFormSubmit = (values: any) => {
    if (!values.rentRange || values.rentRange.length === 0) {
      if (!user) {
        navigate("/login", { state: { from: location.pathname, openModal: "rent" } });
      }
      message.error("โปรดเลือกช่วงเวลาที่ต้องการเช่า");
      return;
    }
    setSelectedRentRange(values.rentRange);
    setRentModalVisible(true);
  };

  const handleConfirmRent = () => {
    setRentModalVisible(false);
    message.success("ยืนยันการสั่งเช่าแล้ว กำลังพาไปหน้าชำระเงิน...");
    navigate("/payment");
  };

  const baseUrl = "http://localhost:8080/images/cars/";
  const mainCar = car.pictures?.[0]?.path || "";
  const thumbnails = car.pictures?.slice(1, 5) || [];

  const rentPricePerDay = car.rent_list?.[0]?.rent_price || car.purchasePrice;

  return (
    <div className={`page-container ${rentModalVisible ? "blurred" : ""}`}
      style={{ backgroundColor: "#000", minHeight: "100vh", padding: "20px", transition: "filter 0.3s ease" }}>
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card bordered={false} style={{ backgroundColor: "#1a1a1a", borderRadius: 12, border: "2px solid gold" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
            <Image src={mainCar ? `${baseUrl}${mainCar}` : ""} alt="car-main" style={{ borderRadius: "12px", marginBottom: "10px" }} />
            <Row gutter={8}>
              {thumbnails.map((thumb, i) => (
                <Col span={6} key={i}>
                  <Image src={`${baseUrl}${thumb.path}`} alt={`car-${i}`} style={{ borderRadius: "8px" }} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} style={{ backgroundColor: "#1a1a1a", color: "white", borderRadius: 12, border: "2px solid gold" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
            <Title level={3} style={{ color: "gold" }}>{car.brand?.brandName} {car.model?.modelName} ปี {car.yearManufacture}</Title>
            <Title level={2} style={{ color: "white", marginTop: "-10px" }}>฿ {rentPricePerDay.toLocaleString()}/วัน</Title>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />
            <div style={{ color: "#fff", lineHeight: "1.8em" }}>
              <p>ยี่ห้อ: {car.brand?.brandName}</p>
              <p>รุ่น: {car.model?.modelName}</p>
              <p>ปี: {car.yearManufacture}</p>
              <p>เลขไมล์: {car.mileage?.toLocaleString()} กม.</p>
              <p>สี: {car.color}</p>
            </div>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />
            <div style={{ color: "#fff", lineHeight: "1.8em" }}>
              <Title level={4} style={{ color: "gold", marginTop: "-10px" }}>ติดต่อพนักงาน</Title>
              <p>ชื่อ: {car.employee?.name} </p>
              <p>เบอร์โทร: {car.employee?.phone}</p>
            </div>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />
            <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
              <Form.Item name="rentRange" label={<span style={{ color: "white", fontWeight: "bold" }}>เลือกช่วงเช่า</span>}
                rules={[{ required: true, message: "โปรดเลือกช่วงเวลาที่ต้องการเช่า" }]}>
                <CusRentDateRange />
              </Form.Item>
              <Button icon={<PushpinOutlined />} block htmlType="submit"
                style={{ backgroundColor: "gold", color: "black", fontWeight: "bold", border: "2px solid gold", borderRadius: "10px" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "black"; e.currentTarget.style.color = "gold"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "gold"; e.currentTarget.style.color = "black"; }}>
                สั่งเช่า
              </Button>
            </Form>

            <Modal title={<span style={{ color: '#f1d430ff' }}>ยืนยันคำสั่งเช่า</span>}
              open={rentModalVisible}
              onCancel={() => setRentModalVisible(false)}
              width={600}
              centered
              maskClosable={false}
              footer={[
                <Button key="back" onClick={() => setRentModalVisible(false)}
                  style={{ backgroundColor: "gold", color: "black", fontWeight: "bold", border: "2px solid gold", borderRadius: "10px" }}>
                  ยกเลิก
                </Button>,
                <Button key="submit" onClick={handleConfirmRent}
                  style={{ backgroundColor: "gold", color: "black", fontWeight: "bold", border: "2px solid gold", borderRadius: "10px" }}>
                  ยืนยัน
                </Button>,
              ]}>
              <div style={{ color: 'black' }}>
                <p>ชื่อ-นามสกุล : </p>
                <p>รถยนต์ : {car.brand?.brandName} {car.model?.modelName} ปี {car.yearManufacture}</p>
                {selectedRentRange.length === 2 && (() => {
                  const startDate = selectedRentRange[0];
                  const endDate = selectedRentRange[1];
                  const days = endDate.diff(startDate, "day") + 1;
                  const totalPrice = days * rentPricePerDay;
                  return (
                    <>
                      <p>วันเริ่ม: {startDate.format("DD/MM/YYYY")}</p>
                      <p>วันสิ้นสุด: {endDate.format("DD/MM/YYYY")}</p>
                      <p>จำนวนวัน: {days} วัน</p>
                      <p>ราคา: {totalPrice.toLocaleString()} บาท</p>
                    </>
                  );
                })()}
              </div>
            </Modal>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RentCarDetailPage;
