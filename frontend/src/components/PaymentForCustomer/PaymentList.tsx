import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, message, Spin, Empty, Typography, Button, Modal, Radio, Space, Input } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useAuth } from '../../hooks/useAuth';
import { BankOutlined, QrcodeOutlined } from '@ant-design/icons';
import 'dayjs/locale/th';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.locale('th');
dayjs.extend(customParseFormat);

interface Payment {
  ID: number;
  amount: string;
  payment_date: string;
  status: string;
  ProofURL: string;
  SalesContract: { ID: number };
  RentContract: { ID: number };
  SalesContractID: number | null;
  RentContractID: number | null;
}

interface PaymentListProps {
  type: string;
}

const colors = {
  gold: '#d4af37',
  goldDark: '#b38e2f',
  black: '#121212',
  white: '#ffffff',
  gray: '#1e1e1e',
};

const PaymentList: React.FC<PaymentListProps> = ({ type }) => {
  const { user, token } = useAuth();
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank' | 'qr' | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.ID) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/payments/customer/${user.ID}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลการชำระเงินได้');
        }
        const jsonResponse = await response.json();
        const data = jsonResponse.data;

        const transformedData: Payment[] = data.map((item: any) => ({
          ...item,
          SalesContractID: item.sales_contract_id,
          RentContractID: item.rent_contract_id,
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
  }, [user, token]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      if (type === 'ซื้อ') {
        return payment.SalesContractID !== null;
      }
      if (type === 'เช่า') {
        return payment.RentContractID !== null;
      }
      return false;
    });
  }, [allPayments, type]);

  const getStatusColor = (status: string) => {
    if (status === 'ชำระแล้ว') return 'green';
    if (status === 'ถูกปฏิเสธ') return 'red';
    if (status === 'รอตรวจสอบ') return 'gold';
    return 'default';
  };

  const showPaymentModal = (id: number) => {
    setCurrentPaymentId(id);
    setIsModalVisible(true);
    setSelectedPaymentMethod(null);
    setSelectedFile(null);
  };

  const handlePaymentMethodChange = (e: any) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentPaymentId) {
      message.error("กรุณาเลือกไฟล์และตรวจสอบรายการชำระเงิน");
      return;
    }

    const formData = new FormData();
    formData.append("slip", selectedFile);
    formData.append("proof_method", selectedPaymentMethod || '');

    try {
      const response = await fetch(`http://localhost:8080/payments/${currentPaymentId}/upload-proof`, {
        method: 'POST',
        body: formData,
        headers: {
            // 'Authorization' header may be required here if the endpoint is protected
            'Authorization': `Bearer ${token}`
        }
      });

      // Corrected logic: Check if the response was successful
      if (response.ok) {
        message.success("อัปโหลดสลิปสำเร็จ");
        setIsModalVisible(false);
        // Refresh the data after successful upload
        const updatedResponse = await fetch(`http://localhost:8080/payments/customer/${user.ID}`, {
             headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if(updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            const transformedUpdatedData: Payment[] = updatedData.data.map((item: any) => ({
                ...item,
                SalesContractID: item.sales_contract_id,
                RentContractID: item.rent_contract_id,
            }));
            setAllPayments(transformedUpdatedData);
        }
      } else {
        message.error("อัปโหลดไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const columns: TableProps<Payment>['columns'] = [
    {
      title: 'เลขที่สัญญา',
      key: 'contractNumber',
      render: (_, record) => {
        if (record.SalesContract?.ID) {
          return `SC-${record.SalesContract.ID}`;
        }
        if (record.RentContract?.ID) {
          return `RC-${record.RentContract.ID}`;
        }
        return 'N/A';
      }
    },
    {
      title: 'จำนวนเงิน (บาท)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
          return '-';
        }
        return parsedAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
    },
    {
      title: 'วันที่ชำระเงิน',
      dataIndex: 'payment_date',
      key: 'paymentDate',
      render: (date) => dayjs(date).format('D MMMM YYYY'),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'หลักฐานการชำระเงิน',
      key: 'upload_slip',
      render: (_, record) => {
        // สถานะที่ต้องการซ่อนปุ่ม
        const statusesToHideButton = ['ชำระแล้ว', , 'รอตรวจสอบ'];
        if (statusesToHideButton.includes(record.status)) {
          return null; // ซ่อนปุ่ม
        }
        if (record.ProofURL) {
          return (
            <Button
              onClick={() => window.open(record.ProofURL, '_blank')}
              style={{ backgroundColor: colors.gold, color: colors.black, border: 'none' }}
            >
              ดูสลิป
            </Button>
          );
        }
        return (
          <Button
            onClick={() => showPaymentModal(record.ID)}
            style={{ backgroundColor: colors.gold, color: colors.black, border: 'none' }}
          >
            อัปโหลดสลิป
          </Button>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Table
        columns={columns}
        dataSource={filteredPayments}
        rowKey="ID"
        pagination={{ pageSize: 10 }}
        bordered
        locale={{
          emptyText: <Empty description={<Typography.Text style={{ color: '#777' }}>{'ไม่พบข้อมูลการชำระเงิน'}</Typography.Text>} />
        }}
      />

      <Modal
        title="เลือกวิธีการชำระเงิน"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
        bodyStyle={{ backgroundColor: colors.gray, color: colors.white }}
        style={{ top: 50 }}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      >
        <Radio.Group onChange={handlePaymentMethodChange} value={selectedPaymentMethod}>
          <Space direction="vertical">
            <Radio value="bank" style={{ color: colors.white }}>
              <BankOutlined style={{ color: colors.white, fontSize: '20px' }} />
              <span style={{ color: colors.white, marginLeft: '10px' }}>โอนเงินผ่านบัญชีธนาคาร</span>
            </Radio>
            <Radio value="qr" style={{ color: colors.white }}>
              <QrcodeOutlined style={{ color: colors.white, fontSize: '20px' }} />
              <span style={{ color: colors.white, marginLeft: '10px' }}>สแกน QR Code</span>
            </Radio>
          </Space>
        </Radio.Group>

        {selectedPaymentMethod === 'bank' && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: colors.white, marginBottom: '10px' }}>เลขที่บัญชี: 123-456-7890</p>
            <p style={{ color: colors.white, marginBottom: '10px' }}>ชื่อบัญชี: บริษัท เอสเอ คาร์เท็นท์ จำกัด</p>
          </div>
        )}

        {selectedPaymentMethod === 'qr' && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: colors.white, marginBottom: '10px' }}>กรุณาสแกน QR Code เพื่อชำระเงิน</p>
            <img src="/path/to/qr-code.png" alt="QR Code" style={{ width: '100%', height: 'auto', border: `1px solid ${colors.gold}` }} />
          </div>
        )}

        {selectedPaymentMethod && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: colors.white, marginBottom: '10px' }}>กรุณาแนบสลิปการโอนเงิน:</p>
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ color: colors.white }}
            />
            {selectedFile && (
              <p style={{ color: colors.white, marginTop: '10px' }}>
                ไฟล์ที่เลือก: **{selectedFile.name}**
              </p>
            )}
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            style={{
              backgroundColor: colors.gold,
              color: colors.black,
              border: 'none',
              fontWeight: 'bold',
            }}
          >
            อัปโหลด
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PaymentList;