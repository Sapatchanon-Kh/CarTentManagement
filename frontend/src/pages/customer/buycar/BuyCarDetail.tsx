import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Card, Typography, Image, Button, Divider, Space, Modal, message } from "antd";
import { ShoppingCartOutlined, PushpinOutlined } from "@ant-design/icons";

import { getCarByID  } from "../../../services/carService";
import { createSalesContract } from "../../../services/salesContractService";
// เพิ่มบรรทัดนี้เข้าไป
import { createBooking } from "../../../services/bookingServices.ts";
import { getSaleListByCarAndPrice } from "../../../services/saleService"; // ✅ เพิ่มการ import service ใหม่
import type { CarInfo } from "../../../interface/Car";
import { useAuth } from "../../../hooks/useAuth";
import { buyCar } from "../../../services/salesContractService";

const { Title, Paragraph } = Typography;

const BuyCarDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const [car, setCar] = useState<CarInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [buy, setBuy] = useState(false);
  const [book, setBook] = useState(false);

  const isAnyModalOpen = buy || book;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

useEffect(() => {
  const fetchCar = async () => {
    try {
      // ✅ เพิ่ม parseInt เพื่อแปลง id เป็น number
      if (id) {
        const data = await getCarByID(parseInt(id, 10)); 
        setCar(data);
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

  useEffect(() => {
    if (user && location.state?.openModal === "buy") {
      setBuy(true);
      navigate(location.pathname, { replace: true });
    }
  }, [user, location, navigate]);

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

  const handleConfirmBuy = async () => {
  if (!user?.ID || !token || !car || !id) {
    message.error("ข้อมูลไม่ครบถ้วน หรือไม่พบผู้ใช้งาน ไม่สามารถสร้างสัญญาได้");
    return;
  }
   try {
        // ✅ เรียกใช้ service buyCar ใหม่
        // เราส่งแค่ carID และ customerID ไปก็พอ
        await buyCar(parseInt(id, 10), user.ID, token);

        setBuy(false);
        setBook(false);
        message.success("ซื้อรถสำเร็จ! กำลังพาไปหน้าชำระเงิน...");
        navigate("/payment");

    } catch (error) {
        console.error("Failed to buy car:", error);
        message.error("เกิดข้อผิดพลาดในการซื้อรถ");
    }

  try {
    const price = parseFloat(car.sale_list?.[0]?.sale_price.toString() || '0');
    const saleListData = await getSaleListByCarAndPrice(parseInt(id, 10), price);

    // ✅ แก้ไขตรงนี้
    if (!saleListData?.ID || !saleListData?.employeeID) { 
      message.error("ไม่พบข้อมูล Sale List ที่ถูกต้อง");
      return;
    }

    const contractData = {
      SaleListID: saleListData.ID,
      // ✅ และแก้ไขตรงนี้
      EmployeeID: saleListData.employeeID, 
      CustomerID: user.ID,
    };
    

    await createSalesContract(contractData, token);
    setBuy(false);
    setBook(false);
    message.success("สร้างสัญญาซื้อขายสำเร็จ กำลังพาไปหน้าชำระเงิน...");
    navigate("/payment");
  } catch (error) {
    console.error("Failed to create sales contract:", error);
    message.error("เกิดข้อผิดพลาดในการสร้างสัญญาซื้อขาย");
  }
};

// 🗑️ หมายเหตุ: ฟังก์ชัน handleConfirmLike เดิมถูกลบออกไป
  const handleLikeClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname, openModal: "book" } });
    } else {
      setBook(true);
    }
  };

  const handleConfirmLike = async () => {
    // ✅ 1. ตรวจสอบข้อมูลให้ครบถ้วน โดยเฉพาะ sale_list
    if (!user?.ID || !token || !car?.sale_list?.[0]?.ID) {
      message.error("ข้อมูลไม่ครบถ้วน ไม่สามารถทำรายการได้");
      return;
    }
    try {
      // ✅ 2. ดึง ID จาก sale_list[0] ซึ่งก็คือ SaleListID
      const saleListId = car.sale_list[0].ID;

      // ✅ 3. เรียกใช้ service createBooking โดยส่ง saleListId และ user.ID
      await createBooking(saleListId, user.ID, token);
      
      setBook(false);
      message.success("บันทึกรถที่ถูกใจสำเร็จ!");
      navigate("/buycar");
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      // ✅ 4. แสดง error message ที่ได้รับมาจาก service
      const errorMessage = error.message || "เกิดข้อผิดพลาดในการบันทึก";
      message.error(errorMessage);
    }
  };

//   const handleConfirmLike = async () => {
//   if (!user?.ID || !token || !car?.sale_list?.[0]?.ID) {
//     message.error("ข้อมูลไม่ครบถ้วน ไม่สามารถทำรายการได้");
//     return;
//   }
//   try {
//     const saleListId = car.sale_list[0].ID;

//     await createBooking(saleListId, user.ID, token);

//     setBook(false);
//     message.success("บันทึกรถที่ถูกใจสำเร็จ!");
//     navigate("/buycar");

//   } catch (error: any) {
//     console.error("Failed to create booking:", error);

//     // ✅ ตรวจสอบว่ามีการตอบกลับจาก backend ว่า duplicate หรือไม่
//     if (error.response?.status === 409 || error.response?.data?.error?.includes("already")) {
//       // 409 Conflict = ข้อมูลซ้ำ
//       message.warning("คุณเคยกดถูกใจรถคันนี้ไปแล้ว");
//       setBook(false);
//       navigate("/buycar");
//     } else {
//       const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึก";
//       message.error(errorMessage);
//     }
//   }
// };

  if (loading) return <div>Loading...</div>;
  if (!car) return <div>ไม่พบรถที่ต้องการ</div>;


  const baseUrl = "http://localhost:8080/images/cars/";
  const mainCar = car.pictures?.[0] ? `${baseUrl}${car.pictures[0].path}` : "";
  const thumbnails = car.pictures?.slice(1) || [];

  return (
    <div className={`page-container ${isAnyModalOpen ? "blurred" : ""}`}
      style={{ backgroundColor: "#000", minHeight: "100vh", padding: "20px", transition: "filter 0.3s ease" }}>
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              border: "2px solid gold",
              transition: "box-shadow 0.3s ease-in-out"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <Image src={mainCar} alt="car-main" style={{ borderRadius: "12px", marginBottom: "10px" }} />
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
                style={{
                  backgroundColor: "gold",
                  color: "black", fontWeight: "bold",
                  border: "2px solid gold",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "gold";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "gold";
                  e.currentTarget.style.color = "black";
                }}
                onClick={handleLikeClick}
              >
                ถูกใจ
              </Button>

              <Modal
                title={<span style={{ color: '#f1d430ff' }}>ยืนยันการกดถูกใจ</span>}
                open={book}
                onCancel={() => setBook(false)}
                getContainer={() => document.body}
                maskClosable={false}
                width={600}
                centered
                styles={{
                  body: {
                    backgroundColor: '#000000'
                  },
                  header: {
                    backgroundColor: '#000000',
                    borderBottom: '1px solid #000000'
                  },
                  footer: {
                    backgroundColor: '#000000',
                    borderTop: '1px solid #000000'
                  },
                  content: {
                    backgroundColor: '#000000',
                    border: '2px solid #f1d430ff',
                    borderRadius: '8px'
                  }
                }}
                footer={[
                  <Button
                    key="back"
                    onClick={() => setBook(false)}
                    style={{
                      backgroundColor: "gold",
                      color: "black",
                      fontWeight: "bold",
                      border: "2px solid gold",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "gold";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "gold";
                      e.currentTarget.style.color = "black";
                    }}
                  >
                    ยกเลิก
                  </Button>,
                  <Button
                    key="submit"
                    onClick={handleConfirmLike}
                    style={{
                      backgroundColor: "gold",
                      color: "black",
                      fontWeight: "bold",
                      border: "2px solid gold",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "gold";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "gold";
                      e.currentTarget.style.color = "black";
                    }}
                  >
                    ยืนยัน
                  </Button>,
                ]}
              >
                <div style={{ color: 'white' }}>
                  <p> รถยนต์ที่คุณถูกใจจะแสดงในหน้า </p>
                  <p>" ข้อมูลของฉัน "</p>
                </div>
              </Modal>

              <Button
                icon={<ShoppingCartOutlined />}
                block
                style={{
                  backgroundColor: "gold",
                  color: "black",
                  fontWeight: "bold",
                  border: "2px solid gold",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "gold";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "gold";
                  e.currentTarget.style.color = "black";
                }}
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
                styles={{
                  body: {
                    backgroundColor: '#000000'
                  },
                  header: {
                    backgroundColor: '#000000',
                    borderBottom: '1px solid #000000'
                  },
                  footer: {
                    backgroundColor: '#000000',
                    borderTop: '1px solid #000000'
                  },
                  content: {
                    backgroundColor: '#000000',
                    border: '2px solid #f1d430ff',
                    borderRadius: '8px'
                  }
                }}
                footer={[
                  <Button
                    key="back"
                    onClick={() => setBuy(false)}
                    style={{
                      backgroundColor: "gold",
                      color: "black",
                      fontWeight: "bold",
                      border: "2px solid gold",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "gold";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "gold";
                      e.currentTarget.style.color = "black";
                    }}
                  >
                    ยกเลิก
                  </Button>,
                  <Button
                    key="submit"
                    onClick={handleConfirmBuy}
                    style={{
                      backgroundColor: "gold",
                      color: "black",
                      fontWeight: "bold",
                      border: "2px solid gold",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "gold";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "gold";
                      e.currentTarget.style.color = "black";
                    }}
                  >
                    ยืนยัน
                  </Button>,
                ]}
              >
                <div style={{ color: 'white' }}>
                  <p>ชื่อ-นามสกุล : {user?.first_name} {user?.last_name}</p>
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