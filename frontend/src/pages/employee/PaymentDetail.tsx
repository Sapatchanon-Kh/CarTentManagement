import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Spin, message, Image, Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.locale('th');
dayjs.extend(customParseFormat);

const { Title } = Typography;

const colors = {
    gold: '#d4af37',
    black: '#121212',
    white: '#ffffff',
    gray: '#1e1e1e',
};

// Interface for the payment data
interface PaymentDetails {
    ID: number;
    amount: string;
    payment_date: string;
    status: string;
    proof_url?: string; // แก้ไขตรงนี้ให้ใช้ proof_url
    SalesContract?: { ID: number };
    RentContract?: { ID: number };
    Customer: {
        first_name: string;
        last_name: string;
    };
}

const PaymentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const [payment, setPayment] = useState<PaymentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/payments/${id}`);
                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลการชำระเงินได้');
                }
                const jsonResponse = await response.json();
                const data = jsonResponse.data;

                if (!data) {
                    throw new Error('ไม่พบข้อมูลการชำระเงิน');
                }
                setPayment(data);
            } catch (error) {
                console.error("Failed to fetch payment details:", error);
                message.error((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [id]);

    const getStatusColor = (status: string) => {
        if (status === 'สำเร็จ') return 'green';
        if (status === 'ล้มเหลว') return 'red';
        return 'gold';
    };

    if (isLoading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: colors.black }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!payment) {
        return (
            <div style={{ padding: '2rem', backgroundColor: colors.black, color: colors.white }}>
                <Title level={4} style={{ color: colors.gold }}>ไม่พบข้อมูลการชำระเงิน</Title>
                <Button 
                    type="default" 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        marginTop: '1rem', 
                        color: colors.gold, 
                        borderColor: colors.gold,
                        backgroundColor: colors.gray
                    }}>
                    ย้อนกลับ
                </Button>
            </div>
        );
    }

    // Determine contract number
    const contractNumber = payment.SalesContract ? `SC-${payment.SalesContract.ID}` :
                           payment.RentContract ? `RC-${payment.RentContract.ID}` : 'N/A';

    return (
        <div style={{ padding: '2rem', background: colors.black, minHeight: '100vh', color: colors.white }}>
            <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: '1rem',
                    color: colors.gold,
                    borderColor: colors.gold,
                    backgroundColor: colors.gray
                }}
            >
                ย้อนกลับ
            </Button>
            <Title level={2} style={{ color: colors.gold, borderBottom: `1px solid ${colors.gold}`, paddingBottom: '1rem' }}>
                รายละเอียดการชำระเงิน
            </Title>
            <Card
                style={{ backgroundColor: colors.gray, borderColor: colors.gold, color: colors.white }}
                title={<span style={{ color: colors.white }}>ข้อมูลการชำระเงิน #{payment.ID}</span>}
            >
                <p><strong>เลขที่สัญญา:</strong> {contractNumber}</p>
                <p><strong>ชื่อ-สกุล ลูกค้า:</strong> {`${payment.Customer.first_name} ${payment.Customer.last_name}`}</p>
                <p><strong>วันที่และเวลาชำระเงิน:</strong> {dayjs(payment.payment_date).format('D MMMM YYYY')} เวลา {dayjs(payment.payment_date).format('HH:mm')}</p>
                <p><strong>จำนวนเงิน:</strong> {parseFloat(payment.amount).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</p>
                <p><strong>สถานะ:</strong> <Tag color={getStatusColor(payment.status)}>{payment.status.toUpperCase()}</Tag></p>
                
                {payment.proof_url && (
                    <div style={{ marginTop: '20px' }}>
                        <Title level={4} style={{ color: colors.white }}>ภาพสลิป</Title>
                        <Image
                            src={`http://localhost:8080${payment.proof_url}`}
                            alt="Payment Slip"
                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                            placeholder={<Spin />}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PaymentDetail;