import React, { useState, useEffect, useMemo } from 'react';
import { ConfigProvider, Typography, Table, Tag, Space, Button, Input, Select, message, Empty, DatePicker } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import 'dayjs/locale/th';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Dayjs } from 'dayjs';
import th_TH from 'antd/locale/th_TH';

// import css file that has the same style as InspectionPage.css
import './Employeestyle.css';

dayjs.locale('th');
dayjs.extend(customParseFormat);

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const colors = {
  gold: '#d4af37',
  goldDark: '#b38e2f',
  black: '#121212',
  white: '#ffffff',
  gray: '#1e1e1e',
};

// Interface for the payment data structure for the frontend
interface DisplayPayment {
  id: number;
  contractNumber: string;
  customerName: string;
  paymentDate: string;
  paymentTime: string;
  amount: number;
  status: 'รอดำเนินการ' | 'ชำระแล้ว' | 'ปฏิเสธ' | 'รอตรวจสอบ'; // เพิ่ม 'รอตรวจสอบ'
  proofURL?: string; 
}

const Payment_forEmployee: React.FC = () => {
  const [allPayments, setAllPayments] = useState<DisplayPayment[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/payments');
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลการชำระเงินได้');
        }
        const jsonResponse = await response.json();
        const data = jsonResponse.data;

        if (!Array.isArray(data)) {
          throw new Error('รูปแบบข้อมูลที่ได้รับไม่ถูกต้อง');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData: DisplayPayment[] = data.map((item: any) => ({
          id: item.ID,
          contractNumber: item.SalesContract ? `SC-${item.SalesContract.ID}` : 'N/A',
          customerName: `${item.Customer.first_name} ${item.Customer.last_name}`,
          paymentDate: dayjs.utc(item.payment_date).format('D MMMM YYYY'),
          paymentTime: dayjs.utc(item.payment_date).format('HH:mm'),
          amount: parseFloat(item.amount),
          status: item.status,
          proofURL: item.proof_url, // แก้ไขการสะกดเป็น proof_url
        }));

        setAllPayments(transformedData);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        message.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleStatusChange = async (id: number, newStatus: DisplayPayment['status']) => {
    try {
      const response = await fetch(`http://localhost:8080/payments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_name: newStatus }),
      });

      if (!response.ok) {
        throw new Error('การอัปเดตสถานะล้มเหลว');
      }

      setAllPayments(prevPayments =>
        prevPayments.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
      message.success(`อัปเดตสถานะของการชำระเงิน #${id} เป็น "${newStatus}" เรียบร้อย`);

    } catch (error) {
      console.error("Failed to update status:", error);
      message.error((error as Error).message);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value.toLowerCase());
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedDate(null);
  };

  const filteredData = useMemo(() => {
    return allPayments.filter(item => {
      const matchesSearch =
        item.contractNumber.toLowerCase().includes(searchText) ||
        item.customerName.toLowerCase().includes(searchText);

      const matchesDate =
        !selectedDate || dayjs(item.paymentDate, 'D MMMM YYYY').isSame(selectedDate, 'day');

      return matchesSearch && matchesDate;
    });
  }, [allPayments, searchText, selectedDate]);

  const getStatusColor = (status: string) => {
    if (status === 'ชำระแล้ว') return 'green';
    if (status === 'ปฏิเสธ') return 'red';
    return 'gold';
  };

  const columns: TableProps<DisplayPayment>['columns'] = [
    { title: 'เลขที่สัญญา', dataIndex: 'contractNumber', key: 'contractNumber', sorter: (a, b) => a.contractNumber.localeCompare(b.contractNumber) },
    { title: 'ชื่อ-สกุล ลูกค้า', dataIndex: 'customerName', key: 'customerName', sorter: (a, b) => a.customerName.localeCompare(b.customerName) },
    { title: 'วันที่ชำระเงิน', dataIndex: 'paymentDate', key: 'paymentDate', sorter: (a, b) => dayjs(a.paymentDate, 'D MMMM YYYY').unix() - dayjs(b.paymentDate, 'D MMMM YYYY').unix() },
    { title: 'เวลา', dataIndex: 'paymentTime', key: 'paymentTime' },
    { title: 'จำนวนเงิน (บาท)', dataIndex: 'amount', key: 'amount', render: (amount) => amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), sorter: (a, b) => a.amount - b.amount },
    {
      title: 'สถานะ', key: 'status', dataIndex: 'status',
      render: (status) => <Tag color={getStatusColor(status)} key={status}>{status.toUpperCase()}</Tag>,
      filters: [
        { text: 'รอดำเนินการ', value: 'รอดำเนินการ' },
        { text: 'ชำระแล้ว', value: 'ชำระแล้ว' },
        { text: 'ปฏิเสธ', value: 'ปฏิเสธ' },
        { text: 'รอตรวจสอบ', value: 'รอตรวจสอบ' },
      ],
      onFilter: (value, record) => record.status.indexOf(value as string) === 0,
    },
    {
      title: 'หลักฐานการชำระเงิน',
      key: 'slip',
      render: (_, record) => (
        record.proofURL ? (
          <Button 
            onClick={() => navigate(`/payment-detail/${record.id}`)}
            style={{ backgroundColor: colors.gold, color: colors.black, border: 'none' }}
          >
            ดูรายละเอียด
          </Button>
        ) : (
          <span style={{ color: '#aaa' }}>-</span>
        )
      ),
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_, record) => {
        if (record.status === 'ชำระแล้ว' || record.status === 'ปฏิเสธ') {
          return <span style={{ color: '#aaa' }}>-</span>;
        }

        return (
          <Select
            value={record.status}
            style={{ width: 150 }}
            onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
            className="status-select-custom"
            dropdownClassName="status-select-dropdown"
          >
            <Option value="รอดำเนินการ">รอดำเนินการ</Option>
            <Option value="ชำระแล้ว">ชำระแล้ว</Option>
            <Option value="ปฏิเสธ">ปฏิเสธ</Option>
            <Option value="รอตรวจสอบ">รอตรวจสอบ</Option>
          </Select>
        );
      },
    },
  ];

  return (
    <ConfigProvider locale={th_TH} theme={{
      components: {
        Table: {
          colorBgContainer: colors.gray, headerBg: colors.goldDark, headerColor: colors.black,
          colorBorderSecondary: colors.gold, rowHoverBg: '#2a2a2a', colorText: colors.white,
          headerSortActiveBg: colors.gold, headerSortHoverBg: colors.gold, filterDropdownBg: colors.gray,
        },
        Input: {
          colorBgContainer: colors.black, colorText: colors.white, colorBorder: colors.gold,
          activeBorderColor: colors.gold, hoverBorderColor: colors.gold, colorTextPlaceholder: '#aaa',
          controlOutline: `2px solid ${colors.gold}40`, colorIcon: colors.gold, colorIconHover: colors.goldDark,
        },
        DatePicker: {
          colorBgContainer: colors.black, colorText: colors.white, colorBorder: colors.gold,
          activeBorderColor: colors.gold, hoverBorderColor: colors.gold, colorTextPlaceholder: '#aaa',
          controlOutline: `2px solid ${colors.gold}40`, cellHoverBg: colors.goldDark,
          controlItemBgActive: colors.gold, colorBgElevated: colors.gray, colorTextHeading: colors.white,
          colorIcon: colors.gold, colorIconHover: colors.goldDark,
        },
        Button: {
          defaultBg: colors.gray, defaultColor: colors.white, defaultBorderColor: colors.gold,
          defaultHoverBg: colors.goldDark, defaultHoverColor: colors.black, defaultHoverBorderColor: colors.gold,
        },
        Empty: { colorText: colors.white, colorTextDisabled: '#aaa' },
        Select: {
          colorBgContainer: colors.black, colorText: colors.white, colorBorder: colors.gold,
          activeBorderColor: colors.gold, hoverBorderColor: colors.gold, colorTextPlaceholder: '#aaa',
          controlOutline: `2px solid ${colors.gold}40`, optionSelectedBg: colors.gold,
          optionSelectedColor: colors.black, colorBgElevated: colors.gray,
        },
        Pagination: { colorText: colors.gold, colorTextDisabled: colors.goldDark },
      },
    }}>
      <div style={{ padding: '2rem', background: colors.black, minHeight: '100vh', color: colors.white }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: colors.gold, borderBottom: `1px solid ${colors.gold}`, paddingBottom: '1rem' }}>
            รายการชำระเงินของลูกค้า
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Search
              placeholder="ค้นหาจากเลขที่สัญญา หรือ ชื่อ-สกุลลูกค้า"
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 500 }}
            />
            <Space style={{ marginTop: 10 }} wrap>
              <DatePicker
                picker="date"
                value={selectedDate}
                onChange={handleDateChange}
                placeholder="เลือกวันที่ชำระเงิน"
                format="D MMMM YYYY"
                style={{ minWidth: 200, flex: 1 }}
              />
              <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                ล้างค่า
              </Button>
            </Space>
          </Space>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
            loading={isLoading}
            locale={{
                emptyText: <Empty description={<Typography.Text style={{ color: '#777' }}>{'ไม่มีข้อมูลการชำระเงิน'}</Typography.Text>} />
            }}
          />
        </Space>
      </div>
    </ConfigProvider>
  );
};

export default Payment_forEmployee;