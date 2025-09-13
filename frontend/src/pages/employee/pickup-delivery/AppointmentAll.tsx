// frontend/src/pages/employee/pickup-delivery/AppointmentAll.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Table, Tag, Button, Space, Spin, Empty, DatePicker,
  ConfigProvider, Input, message, Checkbox, Row, Col, Calendar, Badge
} from 'antd';
import type { TableProps } from 'antd';
import { CalendarOutlined, FileTextOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';

// --- Day.js settings for Thai language and Buddhist Era ---
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import thTH from 'antd/locale/th_TH';
dayjs.extend(buddhistEra);
dayjs.locale('th');
// ------------------------------------

import './AppointmentAll.css';

import type { Dayjs } from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

// --- Style Variables ---
const colors = {
  gold: '#d4af37',
  goldDark: '#b38e2f',
  black: '#121212',
  white: '#ffffff',
  gray: '#1e1e1e',
};

// Interface for authenticated user
interface AuthenticatedUser {
  employeeID: number;
  firstName?: string;
  lastName?: string;
}

// Interface for data displayed in the table
interface DisplayBooking {
  id: number;
  customerId: number | undefined;
  contractNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  employee: string;
  appointmentMethod: string;
  address?: string;
  status?: string;
  customerName: string;
}

// --- Helper function to parse Thai date strings ---
const parseThaiDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const months: { [key: string]: number } = {
    'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3, 'พฤษภาคม': 4, 'มิถุนายน': 5,
    'กรกฎาคม': 6, 'สิงหาคม': 7, 'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11
  };
  const parts = dateString.split(' ');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const monthName = parts[1];
  let year = parseInt(parts[2], 10);
  const month = months[monthName];
  if (year > 2500) {
    year -= 543;
  }
  if (!isNaN(day) && month !== undefined && !isNaN(year)) {
    return new Date(Date.UTC(year, month, day));
  }
  return null;
};

const AppointmentAll: React.FC = () => {
  const [appointments, setAppointments] = useState<DisplayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth() as { user: AuthenticatedUser | null };
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState<Dayjs | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tableFilters, setTableFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // ✅ ดึง employeeID ของผู้ใช้งานปัจจุบัน
        const meRes = await fetch("http://localhost:8080/employees/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!meRes.ok) throw new Error("ไม่สามารถดึงข้อมูลพนักงานปัจจุบันได้");
        const meData = await meRes.json();
        console.log("🚀 meData จาก backend:", meData);

        const employeeId = meData.employeeID || meData.ID;

        // ✅ ดึงนัดหมายตาม employeeId
        const response = await fetch(`http://localhost:8080/pickup-deliveries/employee/${employeeId}`);
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลการนัดหมายได้');
        }
        const result = await response.json();
        console.log("📌 pickup-deliveries result:", result);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData: DisplayBooking[] = result.data.map((item: any) => ({
          id: item.ID,
          customerId: item.Customer?.ID,
          contractNumber: item.SalesContract ? `SC-${item.SalesContract.ID}` : "-",
          appointmentDate: item.DateTime ? dayjs(item.DateTime).format('D MMMM BBBB') : "-",
          appointmentTime: item.DateTime ? dayjs(item.DateTime).format('HH:mm') : "-",
          employee: item.Employee?.FirstName || "-",
          appointmentMethod: item.TypeInformation?.Type || "-",
          status: item.status || "-",
          customerName: `${item.Customer?.first_name || ""} ${item.Customer?.last_name || ""}`.trim(),
          address: `${item.Address || ""} ${item.SubDistrict?.SubDistrictName || ""} ${item.District?.DistrictName || ""} ${item.Province?.ProvinceName || ""}`.trim()
        }));

        setAppointments(transformedData);
      } catch (error) {
        console.error("Failed to fetch or parse appointments", error);
        message.error((error as Error).message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const handleClearFilters = () => {
    setSearchText('');
    setFilterDate(undefined);
    setTableFilters({});
    message.info('ล้างค่าการกรองทั้งหมดแล้ว');
  };

  const filteredData = appointments.filter(item => {
    const matchesSearchText = searchText === '' ||
      item.contractNumber.toLowerCase().includes(searchText) ||
      item.customerName.toLowerCase().includes(searchText);

    let matchesDate = true;
    if (filterDate) {
      const itemDate = parseThaiDate(item.appointmentDate);
      if (itemDate) {
        matchesDate = dayjs(itemDate).isSame(filterDate, 'day');
      } else {
        matchesDate = false;
      }
    }
    return matchesSearchText && matchesDate;
  });

  const handleViewDetails = (id: number) => {
    navigate(`/appointment-details/${id}`);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'รอดำเนินการ': return 'orange';
      case 'สำเร็จ': return 'green';
      case 'ยกเลิก': return 'red';
      default: return 'default';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableChange = (pagination: any, filters: any) => {
    setTableFilters(filters);
  };

  const dateCellRender = (date: Dayjs) => {
    const hasAppointment = appointments.some(app => {
      const parsed = parseThaiDate(app.appointmentDate);
      return parsed ? dayjs(parsed).isSame(date, 'day') : false;
    });
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        {hasAppointment && <Badge status="processing" color={colors.gold} />}
      </div>
    );
  };

  const handleDateSelect = (date: Dayjs) => {
    setFilterDate(date);
  };

  const columns: TableProps<DisplayBooking>['columns'] = [
    {
      title: 'วันที่และเวลานัดหมาย',
      dataIndex: 'appointmentDate',
      key: 'appointmentDateTime',
      sorter: (a, b) => {
        const dateA = parseThaiDate(a.appointmentDate);
        const dateB = parseThaiDate(b.appointmentDate);
        if (!dateA || !dateB) return 0;
        const timeA = a.appointmentTime.split(':').map(Number);
        const timeB = b.appointmentTime.split(':').map(Number);
        const dateTimeA = new Date(dateA.getTime()).setHours(timeA[0], timeA[1]);
        const dateTimeB = new Date(dateB.getTime()).setHours(timeB[0], timeB[1]);
        return dateTimeA - dateTimeB;
      },
      render: (_, record) => {
        const date = parseThaiDate(record.appointmentDate);
        const displayDate = date ? date.toLocaleDateString('th-TH-u-ca-buddhist', {
          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
        }) : "รูปแบบวันที่ไม่ถูกต้อง";
        return (
          <span style={{ color: colors.white }}>
            <CalendarOutlined style={{ marginRight: 8, color: colors.gold }} />
            {`${displayDate} เวลา: ${record.appointmentTime}`}
          </span>
        );
      },
    },
    {
      title: 'ชื่อ-สกุล ลูกค้า',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (text) => (
        <span style={{ color: colors.white }}>{text}</span>
      )
    },
    {
      title: 'เลขที่สัญญา',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (text) => (
        <span style={{ color: colors.white }}>
          <FileTextOutlined style={{ marginRight: 8, color: colors.white }} />
          {text}
        </span>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'appointmentMethod',
      key: 'appointmentMethod',
      render: (method) => {
        const isDelivery = method?.includes('ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)');
        return (
          <Tag color={isDelivery ? 'purple' : 'geekblue'}>
            {isDelivery ? 'จัดส่ง' : 'รับที่เต็นท์'}
          </Tag>
        );
      },
      filters: [
        { text: 'รับที่เต็นท์', value: 'รับที่เต็นท์' },
        { text: 'จัดส่ง', value: 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' },
      ],
      filteredValue: tableFilters.appointmentMethod || null,
      onFilter: (value, record) => record.appointmentMethod?.includes(value as string) ?? false,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Checkbox.Group
            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}
            options={[
              { label: 'รับที่เต็นท์', value: 'รับที่เต็นท์' },
              { label: 'จัดส่ง', value: 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' },
            ]}
            value={selectedKeys as string[]}
            onChange={(keys) => setSelectedKeys(keys)}
          />
          <Space>
            <Button onClick={() => { if (clearFilters) clearFilters(); confirm({ closeDropdown: true }); }} size="small" style={{ width: 90 }}>รีเซ็ต</Button>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>ตกลง</Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => <FilterOutlined style={{ color: filtered ? colors.gold : undefined }} />,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {(status || 'N/A').toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'รอดำเนินการ', value: 'รอดำเนินการ' },
        { text: 'ยกเลิก', value: 'ยกเลิก' },
        { text: 'สำเร็จ', value: 'สำเร็จ' },
      ],
      filteredValue: tableFilters.status || null,
      onFilter: (value, record) => record.status?.indexOf(value as string) === 0,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Checkbox.Group
            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}
            options={[
              { label: 'รอดำเนินการ', value: 'รอดำเนินการ' },
              { label: 'ยกเลิก', value: 'ยกเลิก' },
              { label: 'สำเร็จ', value: 'สำเร็จ' },
            ]}
            value={selectedKeys as string[]}
            onChange={(keys) => setSelectedKeys(keys)}
          />
          <Space>
            <Button onClick={() => { if (clearFilters) clearFilters(); confirm({ closeDropdown: true }); }} size="small" style={{ width: 90 }}>รีเซ็ต</Button>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>ตกลง</Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => <FilterOutlined style={{ color: filtered ? colors.gold : undefined }} />,
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            style={{ backgroundColor: colors.gold, borderColor: colors.gold, color: colors.black, fontWeight: 500 }}
            onClick={() => handleViewDetails(record.id)}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.goldDark)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.gold)}
          >
            อัปเดตสถานะ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      locale={thTH}
      theme={{
        components: {
          Table: { colorBgContainer: colors.gray, headerBg: colors.goldDark, headerColor: colors.black, colorBorderSecondary: colors.gold, rowHoverBg: '#2a2a2a', colorText: colors.white, headerSortActiveBg: colors.gold, headerSortHoverBg: colors.gold, filterDropdownBg: colors.gray },
          Input: { colorBgContainer: colors.black, colorText: colors.white, colorBorder: colors.gold, activeBorderColor: colors.gold, hoverBorderColor: colors.gold, colorTextPlaceholder: '#aaa', controlOutline: 'none', colorIcon: colors.gold, colorIconHover: colors.goldDark },
          DatePicker: { colorBgContainer: colors.black, colorText: colors.white, colorBorder: colors.gold, activeBorderColor: colors.gold, hoverBorderColor: colors.gold, colorTextPlaceholder: '#aaa', controlOutline: `2px solid ${colors.gold}40`, cellHoverBg: colors.goldDark, controlItemBgActive: colors.gold, colorBgElevated: colors.gray, colorTextHeading: colors.white, colorIcon: colors.gold, colorIconHover: colors.goldDark },
          Button: { defaultBg: colors.gray, defaultColor: colors.white, defaultBorderColor: colors.gold, defaultHoverBg: colors.goldDark, defaultHoverColor: colors.black, defaultHoverBorderColor: colors.gold },
          Empty: { colorText: colors.white, colorTextDisabled: '#aaa' },
          Pagination: { colorText: colors.gold, colorTextDisabled: colors.gold },
          Calendar: { colorBgContainer: colors.gray, colorText: colors.white, colorTextHeading: '#ccc', colorBgTextHover: colors.goldDark, controlItemBgActive: colors.gold, },
          Badge: { colorPrimary: colors.gold, colorText: colors.gold, },
        },
      }}
    >
      <div style={{ padding: '2rem', background: colors.black, minHeight: '100vh', marginTop: '60px' }}>
        <Title level={2} style={{ color: colors.gold, marginBottom: '2rem', borderBottom: `1px solid ${colors.gold}`, paddingBottom: '1rem' }}>
          รายการนัดหมายของฉัน
        </Title>

        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={10} lg={8}>
            <Title level={4} style={{ color: colors.white }}>ตัวกรอง</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Search
                placeholder="ค้นหาจากเลขที่สัญญา หรือ ชื่อลูกค้า"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value.toLowerCase())}
              />
              <DatePicker
                value={filterDate}
                onChange={(date) => setFilterDate(date)}
                placeholder="กรองตามวันที่นัดหมาย"
                format="D MMMM YYYY"
                style={{ width: '100%' }}
              />
              <Button icon={<ClearOutlined />} onClick={handleClearFilters} style={{ width: '100%' }}>
                ล้างค่าการกรองทั้งหมด
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={14} lg={16}>
            <div style={{ border: `1px solid ${colors.gold}`, borderRadius: '8px', padding: '8px', background: colors.gray }}>
              <Calendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                onSelect={handleDateSelect}
                value={filterDate}
              />
            </div>
          </Col>
        </Row>

        <Spin spinning={loading} size="large">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ` }}
            locale={{
              emptyText: <Empty description={<Typography.Text style={{ color: '#777' }}>
                {'ไม่มีข้อมูลการนัดหมายที่ตรงกับเงื่อนไข'}</Typography.Text>} />
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default AppointmentAll;
