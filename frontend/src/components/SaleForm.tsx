// src/components/SaleForm.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Form, Input, InputNumber, Button, Typography, Select, message, Modal } from "antd";
import { getCarByID } from "../services/carService";
import { createSale, updateSale, getSaleById } from "../services/saleService";
import { getEmployees } from "../services/employeeService";
import type { CarInfo } from "../interface/Car";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface SaleFormProps {
    mode: "create" | "edit";
    carId?: number;
    saleId?: number;
}



interface Employee {
    employeeID: number;
    firstName: string;
    lastName: string;
    phone: string;
}

const SaleForm: React.FC<SaleFormProps> = ({ mode, carId, saleId }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Hardcode managerId สำหรับทดสอบ
    const managerId = 1;

    const [car, setCar] = useState<CarInfo | null>(null);
    const [mainPic, setMainPic] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        if (carId) {
            getCarByID(carId)
                .then((data) => {
                    setCar(data);
                    setMainPic(data.pictures?.[0]?.path || null);
                })
                .catch(() => message.error("ไม่สามารถโหลดข้อมูลรถได้"));
        }

        getEmployees()
            .then(setEmployees)
            .catch(() => message.error("ไม่สามารถโหลดข้อมูลพนักงานได้"));

        if (mode === "edit" && saleId) {
            setLoading(true);
            getSaleById(saleId)
                .then((data) => {
                    form.setFieldsValue({
                        sale_price: data.sale_price,
                        description: data.description,
                        employee_id: data.employee_id,
                    });
                })
                .catch(() => message.error("ไม่สามารถโหลดข้อมูลรายการขายได้"))
                .finally(() => setLoading(false));
        }
    }, [carId, saleId, mode, form]);
const handleSubmit = async (values: any) => {
    if (!values.sale_price || !values.employee_id) {
        message.error("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    const payload = {
        car_id: carId!,
        sale_price: Number(values.sale_price),
        manager_id: managerId,
        employee_id: Number(values.employee_id),
        description: values.description,
    };

    setLoading(true);
    try {
        if (mode === "create") {
            await createSale(payload);
            confirm({
                title: "สร้างรายการขายเรียบร้อย",
                content: `คุณได้สร้างรายการขายรถ ${car?.carName} เรียบร้อยแล้ว`,
                okText: "ตกลง",
                onOk: () => {
                    navigate("/sell");
                },
                onCancel: () => {
                    // ไม่ทำอะไร เพิ่มเติมถ้าต้องการ
                },
            });
        } else if (mode === "edit" && saleId) {
            await updateSale(saleId, payload);
            confirm({
                title: "แก้ไขรายการขายเรียบร้อย",
                content: `คุณได้แก้ไขรายการขายรถ ${car?.carName} เรียบร้อยแล้ว`,
                okText: "ตกลง",
                onOk: () => navigate("/sell"),
            });
        }
    } catch (err) {
        console.error(err);
        message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
        setLoading(false);
    }
};

    const inputStyle = {
        backgroundColor: "#fff", // กล่องขาว
        color: "#000",           // ตัวหนังสือดำ
        borderRadius: 6,
        border: "1px solid #ccc",
    };

    return (
        <div style={{ maxWidth: 900, margin: "80px auto", color: "#FFD700" }}>
            <Title level={2} style={{ color: "#FFD700" }}>
                {mode === "create" ? "สร้างรายการขาย" : "แก้ไขรายการขาย"}
            </Title>

            {car && (
                <Card style={{ marginBottom: 20, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderColor: '#FFD700', backgroundColor: "black" }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <img
                                src={mainPic ? `http://localhost:8080/images/cars/${mainPic}` : ""}
                                alt={car.carName}
                                style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 8 }}
                            />
                            <div style={{ display: "flex", marginTop: 8, gap: 8 }}>
                                {car.pictures?.slice(0, 5).map((pic) => (
                                    <img
                                        key={pic.ID}
                                        src={`http://localhost:8080/images/cars/${pic.path}`}
                                        alt={pic.title}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            objectFit: "cover",
                                            border: pic.path === mainPic ? "2px solid #FFD700" : "1px solid #ccc",
                                            borderRadius: 4,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setMainPic(pic.path)}
                                    />
                                ))}
                            </div>
                        </Col>
                        <Col span={12}>
                            <Card type="inner" title="ข้อมูลรถ" style={{ borderRadius: 8,}}>
                                <Text><b>ชื่อรถ:</b> {car.carName}</Text><br />
                                <Text><b>ยี่ห้อ:</b> {car.brand?.brandName || "-"}</Text><br />
                                <Text><b>รุ่น:</b> {car.model?.modelName || "-"}</Text><br />
                                <Text><b>ปี:</b> {car.yearManufacture}</Text><br />
                                <Text><b>สี:</b> {car.color}</Text><br />
                                <Text><b>เลขไมล์:</b> {car.mileage.toLocaleString()} กม.</Text><br />
                                <Text><b>อายุการใช้งาน:</b> {car.startUseDate ? new Date().getFullYear() - new Date(car.startUseDate).getFullYear() : "-"} ปี</Text><br />
                                <Text><b>สภาพ:</b> {car.condition}</Text><br />
                                <Text><b>ราคาซื้อ:</b> {car.purchasePrice.toLocaleString()} บาท</Text><br />
                            </Card>
                            <br />
                            <Card type="inner" title="ข้อมูลพนักงานที่เพิ่มรถคันนี้" style={{ borderRadius: 8 }}>
                                <Text><b>ชื่อ:</b> {car.employee?.name || "-"}</Text><br />
                                <Text><b>เบอร์:</b> {car.employee?.phone || "-"}</Text><br />
                                <Text><b>ตำแหน่ง:</b> {car.employee?.position}</Text><br />
                            </Card>
                        </Col>
                    </Row>
                </Card>
            )}

            <Card style={{ borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", backgroundColor: "#1a1a1a", color: "#FFD700", borderColor: "#FFD700" }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label={<span style={{ color: "#FFD700" }}>ราคาขาย</span>}
                        name="sale_price"
                        rules={[{ required: true, message: "กรุณากรอกราคาขาย" }]}
                    >
                        <InputNumber
                            style={{ width: "50%", padding: "6px 12px", fontSize: 16, ...inputStyle }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: "#FFD700" }}>คำอธิบาย</span>}
                        name="description"
                    >
                        <Input.TextArea rows={4} placeholder="ใส่คำอธิบายเพิ่มเติม..." style={{ ...inputStyle }} />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: "#FFD700" }}>พนักงานผู้รับผิดชอบ</span>}
                        name="employee_id"
                        rules={[{ required: true, message: "กรุณาเลือกพนักงาน" }]}
                    >
                        <Select placeholder="เลือกพนักงาน" style={{ ...inputStyle, color: "#000" }}>
                            {employees.map((e) => (
                                <Option key={e.employeeID} value={e.employeeID}>
                                    {e.firstName} {e.lastName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block style={{ backgroundColor: "#FFD700", borderColor: "#FFD700", color: "#000" }}>
                            {mode === "create" ? "สร้างรายการขาย" : "บันทึกการแก้ไข"}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );

};

export default SaleForm;
