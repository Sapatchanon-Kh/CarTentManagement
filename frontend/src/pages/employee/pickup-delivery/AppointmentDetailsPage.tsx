import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, message, Descriptions, Tag, Space, Divider, Spin, ConfigProvider, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

import './AppointmentAll.css';

dayjs.extend(buddhistEra);
dayjs.locale('th');


const { Title, Text } = Typography;
const { Option } = Select;

const colors = {
  gold: '#d4af37',
  goldDark: '#b38e2f',
  black: '#121212',
  white: '#ffffff',
  gray: '#1e1e1e',
};

// Interface for data from the API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AppointmentDataFromAPI extends Record<string, any> {
  ID: number;
  Customer: {
    first_name: string;
    last_name: string;
  };
  SalesContract: {
    ID: number;
  };
  DateTime: string;
  Employee: {
    FirstName: string;   // ✅ ตัว F ใหญ่
    LastName?: string;
  };
  TypeInformation: {
    type: string;
  };
  Address: string;
  SubDistrict?: {
    SubDistrictName: string;
  };
  District?: {
    DistrictName: string;
  };
  Province?: {
    ProvinceName: string;
  };
  status: string;
}


const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDataFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id) {
        message.error('ไม่พบรหัสการนัดหมาย');
        navigate('/AppointmentAll');
        return;
      }
      setLoading(true);
      try {
        // ✅ ดึง employee id ปัจจุบันจาก /employees/me
        const meRes = await fetch("http://localhost:8080/employees/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!meRes.ok) throw new Error("ไม่สามารถดึงข้อมูลพนักงานปัจจุบันได้");
        const meData = await meRes.json();
        const employeeId = meData.employeeID;
        console.log("Employee ID ปัจจุบัน:", employeeId);

        // ✅ ดึงรายละเอียดการนัดหมายตาม id (เหมือนเดิม)
        const response = await fetch(`http://localhost:8080/pickup-deliveries/${id}`);
        if (!response.ok) {
          throw new Error('ไม่สามารถโหลดข้อมูลการนัดหมายได้');
        }
        const result = await response.json();
        setAppointment(result.data);
        setCurrentStatus(result.data.status);
      } catch (error) {
        console.error("Failed to fetch appointment details:", error);
        message.error((error as Error).message);
        navigate('/AppointmentAll');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentDetails();
  }, [id, navigate]);


  const handleUpdateStatus = async () => {
    if (!appointment) return;
    try {
      const response = await fetch(`http://localhost:8080/pickup-deliveries/${appointment.ID}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup_delivery_status: currentStatus }),
      });

      if (!response.ok) {
        throw new Error('การอัปเดตสถานะล้มเหลว');
      }

      const result = await response.json();
      const updatedAppointment = result.data;
      setAppointment(updatedAppointment);
      setCurrentStatus(updatedAppointment.status);

      message.success('อัปเดตสถานะเรียบร้อยแล้ว');

    } catch (error) {
      console.error("Failed to update status:", error);
      message.error((error as Error).message);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'รอดำเนินการ': return 'orange';
      case 'สำเร็จ': return 'green';
      case 'ยกเลิก': return 'red';
      default: return 'default';
    }
  };


  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!appointment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: colors.black, minHeight: '100vh', marginTop: '60px' }}>
        <Title level={3} style={{ color: 'white' }}>ไม่พบข้อมูลการนัดหมาย</Title>
        <Button onClick={() => navigate('/AppointmentAll')}>กลับไปหน้ารายการ</Button>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = { color: colors.gold, fontWeight: 'bold' };
  const contentStyle: React.CSSProperties = { color: colors.white };
  const fullAddress = `${appointment.Address || ''} ${appointment.SubDistrict?.SubDistrictName || ''} ${appointment.District?.DistrictName || ''} ${appointment.Province?.ProvinceName || ''}`.trim();

  const isFinalStatus = appointment.status === 'สำเร็จ' || appointment.status === 'ยกเลิก';

  // --- vvvvv --- ส่วนที่เพิ่ม --- vvvvv ---
  // 1. เปรียบเทียบวันที่ปัจจุบันกับวันที่นัดหมาย
  const appointmentDate = dayjs(appointment.DateTime);
  const today = dayjs();
  // จะแสดงตัวเลือก "สำเร็จ" ได้ ก็ต่อเมื่อถึงหรือเลยวันที่นัดหมายแล้ว
  const canMarkAsCompleted = today.isAfter(appointmentDate) || today.isSame(appointmentDate, 'day');
  // --- ^^^^^ --- จบส่วนที่เพิ่ม --- ^^^^^ ---

  return (
    <>
      <style>{`
        .ant-select-selection-item {
          color: #FFFFFF !important;
        }
        .custom-dropdown-theme .ant-select-item-option-content {
          color: ${colors.black}; 
        }
        .custom-dropdown-theme .ant-select-item-option-active .ant-select-item-option-content {
           color: #${colors.gray} 
        }
        .custom-dropdown-theme .ant-select-item-option-selected .ant-select-item-option-content {
          color: ${colors.black};
        }
      `}</style>

      <ConfigProvider theme={{
        components: {
          Descriptions: { colorText: colors.white, colorSplit: colors.gold, },
          Button: { colorPrimary: colors.gold, colorPrimaryHover: colors.goldDark, colorPrimaryText: colors.black, defaultBg: colors.gray, defaultColor: colors.white, defaultBorderColor: colors.gold, defaultHoverBg: colors.goldDark, defaultHoverColor: colors.black, defaultHoverBorderColor: colors.gold, },
          Card: { colorBgContainer: colors.gray, headerBg: colors.gray, colorBorderSecondary: colors.gold, },
          Divider: { colorSplit: colors.gold, },
          Spin: { colorPrimary: colors.gold, },
          Select: {
            colorBgContainer: colors.gray,
            colorText: colors.white,
            colorBorder: colors.gold,
            colorBgElevated: colors.gray,
            optionSelectedBg: colors.gold,
            optionActiveBg: 'rgba(212, 175, 55, 0.2)',
          },
        },
      }}>
        <div style={{ padding: '2rem', background: colors.black, minHeight: '100vh', marginTop: '60px' }}>
          <Row justify="center">
            <Col xs={24} md={18} lg={12}>
              <Card>
                <Title style={{ color: colors.gold }} level={3}>
                  รายละเอียดการนัดหมาย #{appointment.ID}
                </Title>
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label={<Text style={labelStyle}>ชื่อ-สกุล ลูกค้า</Text>}>
                    <Text style={contentStyle}>{`${appointment.Customer?.first_name || ''} ${appointment.Customer?.last_name || ''}`}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text style={labelStyle}>เลขที่สัญญา</Text>}>
                    <Text style={contentStyle}>SC-{appointment.SalesContract?.ID}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text style={labelStyle}>วันที่นัดหมาย</Text>}>
                    <Text style={contentStyle}>{dayjs(appointment.DateTime).format('D MMMM BBBB')}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text style={labelStyle}>เวลา</Text>}>
                    <Text style={contentStyle}>{dayjs(appointment.DateTime).format('HH:mm')}</Text>
                  </Descriptions.Item>
                 
                  <Descriptions.Item label={<Text style={labelStyle}>ประเภท</Text>}>
                    <Text style={contentStyle}>{appointment.TypeInformation?.type}</Text>
                  </Descriptions.Item>
                  {appointment.TypeInformation?.type.includes('ให้ไปส่งตามที่อยู่') && (
                    <Descriptions.Item label={<Text style={labelStyle}>ที่อยู่</Text>}>
                      <Text style={contentStyle}>{fullAddress}</Text>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={<Text style={labelStyle}>สถานะ</Text>}>
                    <Tag color={getStatusColor(appointment.status)}>
                      {(appointment.status || 'รอดำเนินการ').toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Row justify="space-between" align="middle">
                  {!isFinalStatus ? (
                    <Col>
                      <Space>
                        <Text style={contentStyle}>เปลี่ยนสถานะ:</Text>
                        <Select
                          value={currentStatus}
                          onChange={(value) => setCurrentStatus(value)}
                          style={{ width: 150 }}
                          popupClassName="custom-dropdown-theme"
                        >
                          <Option value="รอดำเนินการ">รอดำเนินการ</Option>
                          {/* --- vvvvv --- ส่วนที่แก้ไข --- vvvvv --- */}
                          {/* 2. ใช้เงื่อนไข canMarkAsCompleted เพื่อแสดงผล */}
                          {canMarkAsCompleted && <Option value="สำเร็จ">สำเร็จ</Option>}
                          {/* --- ^^^^^ --- จบส่วนที่แก้ไข --- ^^^^^ --- */}
                          <Option value="ยกเลิก">ยกเลิก</Option>
                        </Select>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={handleUpdateStatus}
                        >
                          บันทึก
                        </Button>
                      </Space>
                    </Col>
                  ) : (
                    <Col />
                  )}
                  <Col>
                    <Button
                      type="default"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate('/AppointmentAll')}
                    >
                      กลับ
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </>
  );
};

export default AppointmentDetailsPage;

