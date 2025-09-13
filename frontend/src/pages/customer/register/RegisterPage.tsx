// frontend/src/pages/customer/register/RegisterPage.tsx

import React from 'react';
import { Form, Input, Button, DatePicker, Row, Col, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import 'dayjs/locale/th';
import locale from 'antd/es/date-picker/locale/th_TH';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFinish = async (values: any) => {
        console.log('Received values of form: ', values);

        // แก้ไข payload ให้ใช้ชื่อคีย์แบบ PascalCase เพื่อให้ตรงกับ Backend
        const payload = {
            first_name: values.firstName, // เปลี่ยนเป็น PascalCase
            last_name: values.lastName,   // เปลี่ยนเป็น PascalCase
            Email: values.email,
            Password: values.password,
            Phone: values.phoneNumber,
            Birthday: values.dateOfBirth.format('YYYY-MM-DD'), // ส่งเป็น string ในรูปแบบที่เข้าใจง่าย
        };

        try {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Registration successful:', data);
                message.success('ลงทะเบียนสำเร็จ!');
                navigate('/login');
            } else {
                message.error('การลงทะเบียนล้มเหลว');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            message.error('การเชื่อมต่อล้มเหลว');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
            <Row justify="center" style={{ width: '100%' }}>
                <Col xs={24} sm={16} md={12} lg={8}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                        <Title level={2} style={{ textAlign: 'center', color: '#f1d430ff' }}>ลงทะเบียนลูกค้า</Title>
                        <Form
                            form={form}
                            name="register"
                            onFinish={onFinish}
                            layout="vertical"
                            initialValues={{ remember: true }}
                        >
                            <Form.Item
                                name="firstName"
                                label={<span style={{ color: 'black' }}>ชื่อจริง</span>}
                                rules={[{ required: true, message: 'กรุณากรอกชื่อจริง!' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="lastName"
                                label={<span style={{ color: 'black' }}>นามสกุล</span>}
                                rules={[{ required: true, message: 'กรุณากรอกนามสกุล!' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                label={<span style={{ color: 'black' }}>อีเมล</span>}
                                rules={[{ required: true, type: 'email', message: 'กรุณากรอกอีเมลที่ถูกต้อง!' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                label={<span style={{ color: 'black' }}>รหัสผ่าน</span>}
                                rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน!' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label={<span style={{ color: 'black' }}>เบอร์โทรศัพท์</span>}
                                rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="dateOfBirth"
                                label={<span style={{ color: 'black' }}>วันเกิด</span>}
                                rules={[{ required: true, message: 'กรุณาเลือกวันเกิด!' }]}
                            >
                                <DatePicker style={{ width: '100%' }} locale={locale} />
                            </Form.Item>
                            
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%', background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: 'black', border: 'none', fontWeight: 'bold' }}>
                                    ลงทะเบียน
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterPage;