import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Card, Typography, Image, Button, Divider, Space, Modal, message } from "antd";
import { ShoppingCartOutlined, PushpinOutlined } from "@ant-design/icons";

import { fetchCarById } from "../../../services/carService";
import { createSalesContract } from "../../../services/salesContractService";
import { getSaleListByCarAndPrice } from "../../../services/saleService"; // ✅ เพิ่มการ import service ใหม่
import type { CarInfo } from "../../../interface/Car";
import { useAuth } from "../../../hooks/useAuth";

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
        if (id) {
          const data = await fetchCarById(id);
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

  // ✅ แก้ไขฟังก์ชัน handleConfirmBuy เพื่อใช้ service ใหม่
  const handleConfirmBuy = async () => {
    if (!user || !token || !car || !id) {
      message.error("ข้อมูลไม่ครบถ้วน ไม่สามารถสร้างสัญญาได้");
      return;
    }

     try {
    // ✅ แก้ไขการเรียก service โดยแปลงค่า price เป็น float
    const price = parseFloat(car.sale_list?.[0]?.sale_price.toString() || '0');
    const saleListData = await getSaleListByCarAndPrice(id, price);

    if (!saleListData?.ID || !saleListData?.EmployeeID) {
      message.error("ไม่พบข้อมูล Sale List ที่ถูกต้อง");
      return;
    }

      // ✅ 2. ใช้ข้อมูลที่ค้นหาได้เพื่อสร้าง SalesContract
      const contractData = {
        SaleListID: saleListData.ID,
        EmployeeID: saleListData.EmployeeID,
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

  // const handleConfirmLike = async () => {
  //   if (!user || !token || !car || !id) {
  //     message.error("ข้อมูลไม่ครบถ้วน ไม่สามารถสร้างสัญญาได้");
  //     return;
  //   }

  //    try {
  //   // ✅ แก้ไขการเรียก service โดยแปลงค่า price เป็น float
  //   const price = parseFloat(car.sale_list?.[0]?.sale_price.toString() || '0');
  //   const saleListData = await getSaleListByCarAndPrice(id, price);

  //   if (!saleListData?.ID) {
  //     message.error("ไม่พบข้อมูล Sale List ที่ถูกต้อง");
  //     return;
  //   }
  //     // ✅ 2. ใช้ข้อมูลที่ค้นหาได้เพื่อสร้าง SalesContract
  //     const contractData = {
  //       SaleListID: saleListData.ID,
  //       EmployeeID: saleListData.EmployeeID,
  //       CustomerID: user.ID,
  //     };

  //     await createSalesContract(contractData, token);
  //     setBuy(false);
  //     setBook(false);
  //     message.success("สร้างสัญญาซื้อขายสำเร็จ กำลังพาไปหน้าชำระเงิน...");
  //     navigate("/payment");
  //   } catch (error) {
  //     console.error("Failed to create sales contract:", error);
  //     message.error("เกิดข้อผิดพลาดในการสร้างสัญญาซื้อขาย");
  //   }
  // };

//  const handleConfirmRent = async () => {
//     if (!car || selectedRentRange.length !== 2 || !user) {
//       message.error("ข้อมูลไม่ครบถ้วนหรือไม่พบผู้ใช้งาน");
//       return;
//     }

//     const startDate = selectedRentRange[0];
//     const endDate = selectedRentRange[1];
//     const days = endDate.diff(startDate, "day") + 1;
//     const totalPrice = days * rentPricePerDay;

//     const payload = {
//       car_id: car.ID,
//       customer_id: user.ID,
//       start_date: startDate.format("YYYY-MM-DD"),
//       end_date: endDate.format("YYYY-MM-DD"),
//       total_price: totalPrice,
//     };

//     try {
//       setLoading(true);
//       await customerRentService.createRentContract(payload);
//       setRentModalVisible(false);
//       message.success("ทำสัญญาเช่าสำเร็จแล้ว! กำลังนำทาง...");
//       // อาจจะนำทางไปหน้า profile หรือหน้าแสดงสัญญา
//       navigate("/payment"); 
//     } catch (error) {
//       console.error("Failed to create rent contract:", error);
//       message.error("เกิดข้อผิดพลาดในการสร้างสัญญาเช่า");
//     } finally {
//       setLoading(false);
//     }
//   };

  if (loading) return <div>Loading...</div>;
  if (!car) return <div>ไม่พบรถที่ต้องการ</div>;

  const mainCarImage = car.pictures?.[0]?.path || "";
  const thumbImages = car.pictures?.slice(1, 5).map(p => p.path) || [];

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
              <p>ชื่อ : Lung Tuu</p>
              <p>เบอร์โทร : 09888866</p>
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
                onClick={handleBuyClick}
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
          - เลขไมล์: {car.mileage?.toLocaleString()} กม.<br />
          - สี: {car.color}<br />
          - สภาพ: {car.condition}
        </Paragraph>
      </Card>
    </div>
  );
};

export default BuyCarDetailPage;