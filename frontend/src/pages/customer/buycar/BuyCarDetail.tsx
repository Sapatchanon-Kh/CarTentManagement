import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Card, Typography, Image, Button, Divider, Space, Modal, message } from "antd";
import { ShoppingCartOutlined, PushpinOutlined } from "@ant-design/icons";

import { getCarByID } from "../../../services/carService"; // ✅ ใช้ service ของเรา
import type { CarInfo } from "../../../interface/Car";
import { useAuth } from "../../../hooks/useAuth";

const { Title, Paragraph } = Typography;

const BuyCarDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [car, setCar] = useState<CarInfo | null>(null); // ✅ ใช้ state แทน carList
  const [loading, setLoading] = useState(true);
  const [buy, setBuy] = useState(false);
  const [book, setBook] = useState(false);

  const isAnyModalOpen = buy || book;

  // Scroll top ทุกครั้งที่เข้าหน้า
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Fetch car จาก backend
  useEffect(() => {
    const fetchCar = async () => {
      try {
        if (id) {
          const data = await getCarByID(id);
          setCar(data);
          console.log(car);
        }
      } catch (error) {
        console.error("Fetch car error:", error);
        message.error("ไม่สามารถโหลดข้อมูลรถได้");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  // เปิด modal buy ถ้ามี user และ location state
  useEffect(() => {
    if (user && location.state?.openModal === "buy") {
      setBuy(true);
      navigate(location.pathname, { replace: true });
    }
  }, [user, location, navigate]);

  // ป้องกัน scroll เมื่อ modal เปิด
  useEffect(() => {
    if (isAnyModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isAnyModalOpen]);

  const handleBuyClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname, openModal: "buy" } });
    } else {
      setBuy(true);
    }
  };

  const handleConfirmBuy = () => {
    setBuy(false);
    message.success("ยืนยันการสั่งซื้อแล้ว กำลังพาไปหน้าชำระเงิน...");
    navigate("/payment");
  };

  if (loading) return <div>Loading...</div>;
  if (!car) return <div>ไม่พบรถที่ต้องการ</div>;


  const baseUrl = "http://localhost:8080/images/cars";

  const mainCarImage = car.pictures?.[0]?.path
    ? `${baseUrl}/${car.pictures[0].path}`
    : "";

  const thumbImages = car.pictures?.slice(1, 5).map(p => `${baseUrl}/${p.path}`) || [];

  return (
    <div className={`page-container ${isAnyModalOpen ? "blurred" : ""}`} style={{ backgroundColor: "#000", minHeight: "100vh", padding: "20px", transition: "filter 0.3s ease" }}>
      <Row gutter={16}>
        {/* ภาพใหญ่และภาพย่อย */}
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={{ backgroundColor: "#1a1a1a", borderRadius: 12, border: "2px solid gold", transition: "box-shadow 0.3s ease-in-out" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <Image src={mainCarImage} alt="car-main" style={{ borderRadius: "12px", marginBottom: "10px" }} />
            <Row gutter={8}>
              {thumbImages.map((thumb, i) => (
                <Col span={6} key={i}>
                  <Image src={thumb} alt={`car-${i}`} style={{ borderRadius: "8px" }} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* ข้อมูลด้านขวา */}
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderRadius: 12, border: "2px solid gold", transition: "box-shadow 0.3s ease-in-out" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <Title level={3} style={{ color: "gold" }}>
              {car.brand?.brandName} {car.model?.modelName} ปี {car.yearManufacture}
            </Title>
            <Title level={2} style={{ color: "white", marginTop: "-10px" }}>
              ฿ {car.sale_list?.[0]?.sale_price.toLocaleString()}
            </Title>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />

            <div style={{ color: "#fff", lineHeight: "1.8em" }}>
              <p>ยี่ห้อ : {car.brand?.brandName}</p>
              <p>รุ่น : {car.model?.modelName}</p>
              <p>ปี : {car.yearManufacture}</p>
              <p>เลขไมล์ : {car.mileage?.toLocaleString()} กม.</p>
              <p>สี : {car.color}</p>
            </div>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />

            <div style={{ color: "#fff", lineHeight: "1.8em" }}>
              <Title level={4} style={{ color: "gold", marginTop: "-10px" }}>ติดต่อพนักงาน</Title>
              <p>ชื่อ : {car.employee?.name}</p>
              <p>เบอร์โทร : {car.employee?.phone}</p>
            </div>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                icon={<PushpinOutlined />}
                block
                style={{ backgroundColor: "gold", color: "black", fontWeight: "bold", border: "2px solid gold", borderRadius: "10px", boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)" }}
                onClick={() => setBook(true)}
              >
                จอง
              </Button>

              <Modal
                title={<span style={{ color: '#f1d430ff' }}>ยืนยันคำสั่งการจอง</span>}
                open={book}
                onCancel={() => setBook(false)}
                getContainer={() => document.body}
                maskClosable={false}
                width={600}
                centered
                footer={[
                  <Button key="back" onClick={() => setBook(false)} style={{ backgroundColor: "gold", color: "black" }}>ยกเลิก</Button>,
                  <Button key="submit" onClick={handleConfirmBuy} style={{ backgroundColor: "gold", color: "black" }}>ยืนยัน</Button>
                ]}
              >
                <div style={{ color: 'white' }}>
                  <p>ชื่อ-นามสกุล : </p>
                  <p>รถยนต์ : {car.brand?.brandName} {car.model?.modelName} ปี {car.yearManufacture}</p>
                  <p>ราคา : {car.sale_list?.[0]?.sale_price.toLocaleString()} บาท</p>
                </div>
              </Modal>

              <Button
                icon={<ShoppingCartOutlined />}
                block
                style={{ backgroundColor: "gold", color: "black", fontWeight: "bold", border: "2px solid gold", borderRadius: "10px" }}
                onClick={handleBuyClick}
              >
                สั่งซื้อ
              </Button>

              <Modal
                title={<span style={{ color: '#f1d430ff' }}>ยืนยันคำสั่งซื้อ</span>}
                open={buy}
                onCancel={() => setBuy(false)}
                getContainer={() => document.body}
                maskClosable={false}
                width={600}
                centered
                footer={[
                  <Button key="back" onClick={() => setBuy(false)} style={{ backgroundColor: "gold", color: "black" }}>ยกเลิก</Button>,
                  <Button key="submit" onClick={handleConfirmBuy} style={{ backgroundColor: "gold", color: "black" }}>ยืนยัน</Button>
                ]}
              >
                <div style={{ color: 'black' }}>
                  <p>ชื่อ-นามสกุล : </p>
                  <p>รถยนต์ : {car.brand?.brandName} {car.model?.modelName} ปี {car.yearManufacture}</p>
                  <p>ราคา : {car.sale_list?.[0]?.sale_price.toLocaleString()} บาท</p>
                </div>
              </Modal>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: "20px", backgroundColor: "#1a1a1a", color: "white", borderRadius: 12, border: "2px solid gold" }}>
        <Title level={4} style={{ color: "gold" }}>รายละเอียด</Title>
        <Paragraph style={{ color: "#ccc" }}>
          {car.carName} ปี {car.yearManufacture}<br />
          {car.sale_list?.length ? car.sale_list[0].description : "ไม่มีรายละเอียด"}
        </Paragraph>
      </Card>
    </div>
  );
};

export default BuyCarDetailPage;
