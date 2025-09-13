/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Card, Avatar, Descriptions, Button, Row, Col, Typography, message,
  Form, Input, DatePicker, Spin, Divider, Empty, Collapse
} from 'antd';
import {
  UserOutlined, EditOutlined, SaveOutlined, CloseCircleOutlined,
  CarOutlined, PhoneOutlined, FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/th_TH';
import 'dayjs/locale/th';
import { useAuth } from '../../../hooks/useAuth';

const { Title } = Typography;
// --- vvvvv --- START: เพิ่ม Imports ใหม่ --- vvvvv ---
const { Panel } = Collapse;
// --- ^^^^^ --- END: จบส่วนที่เพิ่ม --- ^^^^^ ---

interface Customer {
  ID: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  Birthday: string;
  Password?: string;
}

interface SalesContract {
  ID: number;
  Employee: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  SaleList: {
    Car: {
      Detail: {
        CarModel: {
          model_name: string;
        };
        Brand: {
          brand_name: string;
        };
      };
    };
  };
}

const CusProfilePage: React.FC = () => {
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { user, token, logout } = useAuth();
  const [myCars, setMyCars] = useState<SalesContract[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user?.ID || !token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/admin/customers/${user.ID}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }

        const data = await response.json();
        const mappedData: Customer = {
          ID: data.ID,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          Birthday: data.Birthday || data.birthday,
        };
        setCustomerData(mappedData);
        form.setFieldsValue({
          first_name: mappedData.first_name,
          last_name: mappedData.last_name,
          email: mappedData.email,
          phone: mappedData.phone,
          birthday: mappedData.Birthday ? dayjs(mappedData.Birthday) : null,
        });
      } catch (error) {
        console.error("Error fetching customer data:", error);
        message.error('ไม่สามารถดึงข้อมูลลูกค้าได้');
        logout();
      } finally {
        setLoading(false);
      }
    };

    const fetchSalesContracts = async () => {
      if (!user?.ID || !token) {
        setLoadingCars(false);
        return;
      }
      try {
        setLoadingCars(true);
        const response = await fetch(`http://localhost:8080/sales-contracts/customer/${user.ID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMyCars(data.data || []);
        } else {
          setMyCars([]);
        }
      } catch (error) {
        console.error("Error fetching sales contracts:", error);
        message.error('ไม่สามารถดึงข้อมูลรถของฉันได้');
      } finally {
        setLoadingCars(false);
      }
    };

    fetchCustomerData();
    fetchSalesContracts();
  }, [user, token, form, logout]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (customerData) {
      form.setFieldsValue({
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        birthday: customerData.Birthday ? dayjs(customerData.Birthday) : null,
      });
    }
  };

  const onFinish = async (values: any) => {
    if (!customerData || !token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/admin/customers/${customerData.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          birthday: values.birthday.format('YYYY-MM-DD')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer data');
      }

      const updatedData = await response.json();
      const mappedUpdatedData: Customer = {
        ID: updatedData.ID,
        first_name: updatedData.first_name,
        last_name: updatedData.last_name,
        email: updatedData.email,
        phone: updatedData.phone,
        Birthday: updatedData.Birthday || updatedData.birthday,
      };

      setCustomerData(mappedUpdatedData);
      setIsEditMode(false);
      message.success('บันทึกข้อมูลสำเร็จ!');
    } catch (error) {
      console.error("Error updating customer data:", error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={18} lg={16} xl={12}>
          <Card
            bordered={false}
            style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <Title level={4} style={{ marginTop: '20px' }}>กำลังโหลดข้อมูล...</Title>
              </div>
            ) : (
              <Row gutter={[16, 16]} justify="center">
                <Col style={{ textAlign: 'center' }}>
                  <Avatar size={128} icon={<UserOutlined />} style={{ backgroundColor: '#f1d430ff', color: 'black' }} />
                  <Title level={3} style={{ marginTop: '16px' }}>{customerData?.first_name} {customerData?.last_name}</Title>
                </Col>
                <Col xs={24}>
                  <Divider orientation="left" style={{ borderTopColor: '#f1d430ff' }}>
                    <Title level={5}>ข้อมูลส่วนตัว</Title>
                  </Divider>
                  {isEditMode ? (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onFinish}
                    >
                      <Form.Item name="first_name" label="ชื่อ" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="last_name" label="นามสกุล" rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="email" label="อีเมล" rules={[{ required: true, message: 'กรุณากรอกอีเมล' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="phone" label="เบอร์โทรศัพท์">
                        <Input />
                      </Form.Item>
                      <Form.Item name="birthday" label="วันเกิด">
                        <DatePicker locale={locale} format="DD MMMM BBBB" style={{ width: '100%' }} />
                      </Form.Item>
                    </Form>
                  ) : (
                    <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 'bold' }}>
                      <Descriptions.Item label="ชื่อ-นามสกุล">{customerData?.first_name} {customerData?.last_name}</Descriptions.Item>
                      <Descriptions.Item label="อีเมล">{customerData?.email}</Descriptions.Item>
                      <Descriptions.Item label="เบอร์โทรศัพท์">{customerData?.phone}</Descriptions.Item>
                      <Descriptions.Item label="วันเกิด">
                        {customerData?.Birthday ? dayjs(customerData.Birthday).locale('th').format('DD MMMM BBBB') : 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Col>
              </Row>
            )}
            <Row justify="end" style={{ marginTop: '32px' }} gutter={16}>
              {isEditMode ? (
                <>
                  <Col><Button icon={<CloseCircleOutlined />} onClick={handleCancel} danger>ยกเลิก</Button></Col>
                  <Col><Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} style={{ background: '#f1d430ff', color: 'black', border: 'none' }}>บันทึกข้อมูล</Button></Col>
                </>
              ) : (
                <>
                  <Col><Button type="primary" icon={<EditOutlined />} onClick={handleEdit} style={{ background: '#f1d430ff', color: 'black', border: 'none' }}>แก้ไขข้อมูล</Button></Col>
                </>
              )}
            </Row>
          </Card>

          {/* --- vvvvv --- START: เพิ่ม JSX สำหรับ "รถของฉัน" แบบ Toggle --- vvvvv --- */}
          <Divider style={{ margin: '2.5rem 0' }} />
          <style>{`
  .custom-collapse .ant-collapse-arrow {
    color: #f1d430ff !important; /* เปลี่ยนสีลูกศร */
    font-size: 20px;
  }
  .custom-collapse .ant-collapse-header-text {
    color: #f1d430ff !important; /* เปลี่ยนสีข้อความ header */
  }
`}</style>
          <Collapse ghost
           expandIconPosition="start"
            className="custom-collapse">
            <Panel header={<Title level={3} style={{ margin: 0, color: '#f1d430ff' }}>รถของฉัน</Title>} key="1">
              {loadingCars ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : myCars.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {myCars.map(contract => (
                    <Col xs={24} md={12} key={contract.ID}>
                      <Card
                        bordered={false}
                        style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                        title={
                          <Title level={5} style={{ color: '#f1d430ff', margin: 0 }}>
                            <CarOutlined style={{ marginRight: '10px' }} />
                            {contract.SaleList?.Car?.Detail?.Brand?.brand_name} {contract.SaleList?.Car?.Detail?.CarModel?.model_name}
                          </Title>
                        }
                      >
                        <p><FileTextOutlined style={{ marginRight: '10px' }} /> <b>หมายเลขสัญญา:</b> SC-{contract.ID}</p>
                        <p><UserOutlined style={{ marginRight: '10px' }} /> <b>พนักงาน:</b> {contract.Employee?.first_name} {contract.Employee?.last_name}</p>
                        <p><PhoneOutlined style={{ marginRight: '10px' }} /> <b>เบอร์โทรติดต่อ:</b> {contract.Employee?.phone}</p>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="คุณยังไม่มีรถยนต์ในครอบครอง" />
              )}
            </Panel>
          </Collapse>
          {/* --- ^^^^^ --- END: จบส่วนที่เพิ่ม --- ^^^^^ --- */}
        </Col>
      </Row>
    </div>
  );
};

export default CusProfilePage;