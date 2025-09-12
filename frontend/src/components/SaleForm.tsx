import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CarInfo, CarPicture } from "../interface/Car";
import { fetchCarById } from "../services/carService";
import { createSale ,getSaleById} from "../services/saleService";
import { Card, Input, InputNumber, Button, Typography, Image, Row, Col, Divider } from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;
interface SaleFormProps {
  carId?: number;
  saleId?: number; 
}
const SaleForm: React.FC = () => {
    const { carId, saleId } = useParams<{ carId?: string; saleId?: string }>();
    const [car, setCar] = useState<CarInfo | null>(null);
    const [salePrice, setSalePrice] = useState<number>(0);
    const [employeeId, setEmployeeId] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [selectedPicture, setSelectedPicture] = useState<CarPicture | null>(null);
    

    useEffect(() => {
  if (carId) {
    fetchCarById(carId).then((carData) => setCar(carData));
  }

  if (saleId) {
    getSaleById(saleId).then((saleData) => {
      setSalePrice(saleData.sale_price);
      setEmployeeId(saleData.manager_id);
      setDescription(saleData.description);

      // ถ้า carId ไม่ได้มาจาก params ก็เอารถจาก saleData
      if (!carId && saleData.car) setCar(saleData.car);
    });
  }
}, [carId, saleId]);


    const handleSubmit = async () => {
    if (!car) return alert("ไม่พบข้อมูลรถ");
    if (salePrice <= 0) return alert("กรุณากรอกราคาขาย");

    if (saleId) {
        // Update sale
        await updateSale(saleId, {
            sale_price: salePrice,
            manager_id: employeeId,
            description,
        });
        alert("แก้ไขรายการขายเรียบร้อย!");
    } else {
        // Create sale
        await createSale({
            car_id: car.ID,
            sale_price: salePrice,
            manager_id: employeeId,
            description,
        });
        alert("สร้างรายการขายเรียบร้อย!");
    }
};
    if (!car) return <div>Loading...</div>;

    return (
        <Card style={{ maxWidth: 900, margin: "20px auto", backgroundColor: "#1f1f1f", color: "#FFD700", borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
            <Title level={3} style={{ color: "#FFD700" }}>
                สร้างรายการขาย: {car.carName} ({car.yearManufacture})
            </Title>

            <Row gutter={20}>
                {/* ซ้าย: ข้อมูลรถ */}
                <Col span={10}>
                    <Card style={{ backgroundColor: "#2a2a2a", color: "#FFD700" }} bodyStyle={{ padding: 15 }}>
                        <Text strong style={{ color: "#FFD700" }}>ชื่อรถ: </Text><Text style={{ color: "#ffffffff" }}>{car.carName}</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>ปีผลิต: </Text><Text style={{ color: "#ffffffff" }}>{car.yearManufacture}</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>สี: </Text><Text style={{ color: "#ffffffff" }}>{car.color}</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>ยี่ห้อ: </Text><Text style={{ color: "#ffffffff" }}>{car.brand?.brandName}</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>รุ่น: </Text><Text style={{ color: "#ffffffff" }}>{car.model?.modelName}</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>ซับโมเดล: </Text><Text style={{ color: "#ffffffff" }}>{car.submodel?.submodelName}</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>จังหวัด: </Text><Text style={{ color: "#ffffffff" }}>{car.province?.provinceName}</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>ระยะทาง: </Text><Text style={{ color: "#ffffffff" }}>{car.mileage} กม.</Text><Divider style={{ borderColor: "#FFD700" }}/>
                        <Text strong style={{ color: "#FFD700" }}>สภาพ: </Text><Text style={{ color: "#ffffffff" }}>{car.condition}</Text>
                    </Card>
                </Col>

                {/* ขวา: รูป + ฟอร์ม */}
                <Col span={14}>
                    <div style={{ textAlign: "center", marginBottom: 15 }}>
                        {selectedPicture && (
                            <Image src={selectedPicture.path} alt={selectedPicture.title} width={400} style={{ border: "2px solid #FFD700", borderRadius: 8 }} />
                        )}
                    </div>

                    <Row gutter={[10, 10]} justify="center" style={{ marginBottom: 20 }}>
                        {car.pictures?.slice(0, 5).map((p: CarPicture) => (
                            <Col key={p.ID}>
                                <Image
                                    src={p.path}
                                    alt={p.title}
                                    width={80}
                                    height={60}
                                    style={{
                                        border: selectedPicture?.ID === p.ID ? "2px solid #FFD700" : "1px solid #ccc",
                                        cursor: "pointer",
                                        borderRadius: 4,
                                    }}
                                    preview={false}
                                    onClick={() => setSelectedPicture(p)}
                                />
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Text style={{ color: "#FFD700" }}>ราคาขาย:</Text>
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                value={salePrice}
                                onChange={(value) => setSalePrice(value || 0)}
                                formatter={(value) => `฿ ${value}`}
                                parser={(value) => Number(value?.replace(/[฿,]/g, ""))}
                            />
                        </Col>

                        <Col span={24}>
                            <Text style={{ color: "#FFD700" }}>พนักงานขาย (ID):</Text>
                            <InputNumber style={{ width: "100%" }} min={0} value={employeeId} onChange={(value) => setEmployeeId(value || 0)} />
                        </Col>

                        <Col span={24}>
                            <Text style={{ color: "#FFD700" }}>คำอธิบาย:</Text>
                            <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={{ backgroundColor: "#2a2a2a", color: "#FFD700" }} />
                        </Col>

                        <Col span={24} style={{ textAlign: "center" }}>
                            <Button type="primary" style={{ backgroundColor: "#FFD700", color: "#1f1f1f", fontWeight: "bold" }} onClick={handleSubmit}>
                                บันทึก
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );
};

export default SaleForm;
