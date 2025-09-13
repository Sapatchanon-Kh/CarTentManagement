// PickupCarPageCreate.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Select, Button, Space, Row, Col, Input,
  Typography, Divider, message, Spin
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth';
import { getEmployees } from '../../../services/employeeService'; // 👈 นำเข้าฟังก์ชันที่ถูกต้อง

import "../../../style/global.css";
import '../../../style/inspecstyle.css';
import CustomDatePicker from '../../../components/datetimepicker';
import provinces from '../../../data/thailand-address.json';
import { timeOptions } from '../../../data/data';

dayjs.locale('th');

const { Title, Text } = Typography;

// --- Interfaces ---
// New
interface Employee {
  employeeID: number;
  firstName: string;
  lastName: string;
}

interface TypeInformation {
  ID: number;
  type: string;
}

interface SalesContract {
  ID: number;
}

interface Province {
  ProvinceName: string;
}
interface District {
  DistrictName: string;
}
interface SubDistrict {
  SubDistrictName: string;
}

// จุดที่ 1: แก้ไข Interface
interface PickupDeliveryFromDB {
  ID: number;
  DateTime: string;
  status: string; // <--- แก้ไขจาก Status เป็น status
  SalesContractID: number;
  Employee: {
    ID: number;
  } | null; // <--- เพิ่ม null type
}


interface PickupDeliveryForEdit {
  ID: number;
  DateTime: string;
  Address: string;
  SalesContract: SalesContract;
  Employee: Employee;
  TypeInformation: TypeInformation;
  Province?: Province;
  District?: District;
  SubDistrict?: SubDistrict;
}

interface DistrictFromAPI {
  ID: number;
  DistrictName: string;
}
interface SubDistrictFromAPI {
  ID: number;
  SubDistrictName: string;
}


const PickupCarCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('id');

  const { user, token } = useAuth();

  const [loading, setLoading] = useState<boolean>(!!editingId);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);

  // Form state
  const [contractNumber, setContractNumber] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);
  const [selectedMethodId, setSelectedMethodId] = useState<number | undefined>(undefined);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [typeInformations, setTypeInformations] = useState<TypeInformation[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string | null>(null);

  const [districtsFromApi, setDistrictsFromApi] = useState<DistrictFromAPI[]>([]);
  const [subDistrictsFromApi, setSubDistrictsFromApi] = useState<SubDistrictFromAPI[]>([]);

  const [salesContracts, setSalesContracts] = useState<SalesContract[]>([]);
  const [pickupDeliveries, setPickupDeliveries] = useState<PickupDeliveryFromDB[]>([]);

  const inputStyle = {
    backgroundColor: '#4A4A4A',
    color: 'white',
    borderColor: '#888'
  };

  const districtOptions = useMemo(() => {
    if (!selectedProvince) return [];
    const province = provinces.find(p => p.name_th === selectedProvince);
    return province ? province.amphure.map(a => ({ value: a.name_th, label: a.name_th })) : [];
  }, [selectedProvince]);

  const subdistrictOptions = useMemo(() => {
    if (!selectedDistrict) return [];
    const province = provinces.find(p => p.name_th === selectedProvince);
    const district = province?.amphure.find(a => a.name_th === selectedDistrict);
    return district ? district.tambon.map(t => ({ value: t.name_th, label: t.name_th })) : [];
  }, [selectedProvince, selectedDistrict]);

  const selectedMethodName = useMemo(() =>
    typeInformations.find(t => t.ID === selectedMethodId)?.type,
    [typeInformations, selectedMethodId]
  );

  // จุดที่ 2: แก้ไข isSaveDisabled
  const isSaveDisabled = useMemo(() => {
    const isInfoMissing =
      !contractNumber ||
      !selectedDate ||
      !selectedTime ||
      !selectedEmployeeId ||
      !selectedMethodId ||
      (selectedMethodName === 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' && (!address || !selectedProvince || !selectedDistrict || !selectedSubdistrict));

    const salesContractID = contractNumber ? parseInt(contractNumber, 10) : NaN;
    const hasExistingBooking = isNaN(salesContractID) ? false : pickupDeliveries.some(delivery =>
      delivery.SalesContractID === salesContractID &&
      (delivery.status === 'รอดำเนินการ' || delivery.status === 'สำเร็จ') && // <--- แก้ไขจาก Status เป็น status
      (editingId ? delivery.ID.toString() !== editingId : true)
    );

    return isInfoMissing || hasExistingBooking;
  }, [contractNumber, selectedDate, selectedTime, selectedEmployeeId, selectedMethodId, selectedMethodName, address, selectedProvince, selectedDistrict, selectedSubdistrict, pickupDeliveries, editingId]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [empData, typeResponse] = await Promise.all([
          getEmployees(), // 👈 แก้ไขที่นี่
          fetch('http://localhost:8080/type-informations')
        ]);
        if (!typeResponse.ok) throw new Error('Failed to fetch initial data');
        const typeData = await typeResponse.json();
        setEmployees(empData);
        setTypeInformations(typeData);
      } catch (error) {
        console.error(error);
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลเริ่มต้น");
      }
    };

    const fetchBookingDataForEdit = async () => {
      if (!editingId || !token) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/pickup-deliveries/${editingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('ไม่พบข้อมูลการนัดหมาย');

        const { data }: { data: PickupDeliveryForEdit } = await response.json();

        if (data.Province && data.District && data.SubDistrict) {
          const provinceData = provinces.find(p => p.name_th === data.Province?.ProvinceName);
          if (provinceData) {
            const fetchedDistricts = provinceData.amphure.map(a => ({ ID: a.id, DistrictName: a.name_th }));
            setDistrictsFromApi(fetchedDistricts);

            const districtData = provinceData.amphure.find(d => d.name_th === data.District?.DistrictName);
            if (districtData) {
              const fetchedSubdistricts = districtData.tambon.map(t => ({
                ID: t.id,
                SubDistrictName: t.name_th,
              }));
              setSubDistrictsFromApi(fetchedSubdistricts);
            }
          }
        }

        setContractNumber(data.SalesContract.ID.toString());
        setSelectedEmployeeId(data.Employee.employeeID);
        setSelectedMethodId(data.TypeInformation.ID);
        const bookingDateTime = dayjs(data.DateTime);
        setSelectedDate(bookingDateTime);
        setSelectedTime(bookingDateTime.format('HH:mm'));

        if (data.Address) {
          setAddress(data.Address);
        }
        if (data.Province) {
          setSelectedProvince(data.Province.ProvinceName);
        }
        if (data.District) {
          setSelectedDistrict(data.District.DistrictName);
        }
        if (data.SubDistrict) {
          setSelectedSubdistrict(data.SubDistrict.SubDistrictName);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        message.error(`เกิดข้อผิดพลาด: ${error.message}`);
        navigate('/pickup-car');
      } finally {
        setLoading(false);
      }
    };


    fetchDropdownData().then(() => {
      if (editingId) {
        fetchBookingDataForEdit();
      } else {
        setLoading(false);
      }
    });

  }, [editingId, token, navigate]);

  useEffect(() => {
    if (user && user.ID) {
      setCustomerId(Number(user.ID));
    }
  }, [user]);

  useEffect(() => {
    const fetchContractsAndBookings = async () => {
      if (!user?.ID) return;

      try {
        setLoading(true);
        const [contractsResponse, deliveriesResponse] = await Promise.all([
          fetch(`http://localhost:8080/sales-contracts/customer/${user.ID}`),
          fetch('http://localhost:8080/pickup-deliveries')
        ]);

        if (!contractsResponse.ok || !deliveriesResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลสัญญาหรือการนัดหมายได้');
        }

        const contractsData = await contractsResponse.json();
        const deliveriesData = await deliveriesResponse.json();

        setSalesContracts(contractsData.data || []);
        setPickupDeliveries(deliveriesData.data || []);

      } catch (error) {
        console.error('Failed to fetch sales contracts or pickup deliveries:', error);
        message.error('ไม่สามารถดึงข้อมูลสัญญาซื้อขายได้');
      } finally {
        setLoading(false);
      }
    };

    fetchContractsAndBookings();
  }, [user]);

  // จุดที่ 3: แก้ไข availableSalesContracts
  const availableSalesContracts = useMemo(() => {
    const currentEditingContractId = editingId
      ? pickupDeliveries.find(d => d.ID.toString() === editingId)?.SalesContractID
      : null;

    const bookedSalesContractIDs = new Set<number>();
    pickupDeliveries.forEach(delivery => {
      const isPendingOrCompleted = delivery.status === 'รอดำเนินการ' || delivery.status === 'สำเร็จ'; // <--- แก้ไขจาก Status เป็น status
      if (isPendingOrCompleted) {
        bookedSalesContractIDs.add(delivery.SalesContractID);
      }
    });

    if (currentEditingContractId) {
      bookedSalesContractIDs.delete(currentEditingContractId);
    }

    return salesContracts.filter(contract => !bookedSalesContractIDs.has(contract.ID));

  }, [salesContracts, pickupDeliveries, editingId]);

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!selectedDate || !selectedEmployeeId) {
        setBookedTimeSlots([]);
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/pickup-deliveries');
        if (!response.ok) throw new Error('Failed to fetch bookings');

        const bookings: PickupDeliveryFromDB[] = (await response.json()).data || [];

        const unavailableTimes = bookings
          .filter(booking => {
            if (editingId && booking.ID.toString() === editingId) {
              return false;
            }
            const isSameDay = dayjs(booking.DateTime).isSame(selectedDate, 'day');
            // --- 👇 แก้ไขเงื่อนไขตรงนี้ ---
            const isSameEmployee = booking.Employee && booking.Employee.ID === selectedEmployeeId;
            const isActiveBooking = booking.status === 'รอดำเนินการ' || booking.status === 'สำเร็จ';
            return isSameDay && isSameEmployee && isActiveBooking;
          })
          .map(booking => dayjs(booking.DateTime).format('HH:mm'));

        setBookedTimeSlots(unavailableTimes);

      } catch (error) {
        console.error(error);
        message.error("ไม่สามารถดึงข้อมูลเวลาที่จองแล้วได้");
      }
    };

    fetchBookedTimes();
  }, [selectedDate, selectedEmployeeId, editingId]);

  useEffect(() => {
    if (selectedMethodId === 2) {
      setSelectedDistrict(null);
      setSelectedSubdistrict(null);
      setSubDistrictsFromApi([]);

      setSelectedProvince("Bangkok");
      const fetchBangkokDistricts = async () => {
        try {
          const response = await fetch('http://localhost:8080/districts/by-province/1');
          if (!response.ok) throw new Error('Failed to fetch districts');
          const data = await response.json();
          setDistrictsFromApi(data || []);
        } catch (error) {
          console.error(error);
          message.error("ไม่สามารถดึงข้อมูลอำเภอของกรุงเทพมหานครได้");
        }
      };
      fetchBangkokDistricts();
    } else {
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedSubdistrict(null);
      setDistrictsFromApi([]);
      setSubDistrictsFromApi([]);
    }
  }, [selectedMethodId]);

  useEffect(() => {
    if (selectedDistrict) {
      const selectedDistrictObj = districtsFromApi.find(d => d.DistrictName === selectedDistrict);
      if (selectedDistrictObj) {
        const fetchSubDistricts = async () => {
          try {
            const response = await fetch(`http://localhost:8080/sub-districts/by-district/${selectedDistrictObj.ID}`);
            if (!response.ok) throw new Error('Failed to fetch sub-districts');
            const data = await response.json();
            setSubDistrictsFromApi(data || []);
          } catch (error) {
            console.error(error);
            message.error("ไม่สามารถดึงข้อมูลตำบลได้");
          }
        };
        fetchSubDistricts();
      }
    }
  }, [selectedDistrict, districtsFromApi]);

  const handleSave = async () => {
    if (!customerId) {
      message.error("ข้อมูลผู้ใช้ไม่ถูกต้อง กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง");
      return;
    }

    const isInfoMissing =
      !contractNumber ||
      !selectedDate ||
      !selectedTime ||
      !selectedEmployeeId ||
      !selectedMethodId ||
      (selectedMethodName === 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' && (!address || !selectedProvince || !selectedDistrict || !selectedSubdistrict));

    if (isInfoMissing) {
      message.warning("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    let latestDeliveries: PickupDeliveryFromDB[] = [];
    try {
      const deliveriesResponse = await fetch('http://localhost:8080/pickup-deliveries');
      if (!deliveriesResponse.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการนัดหมายล่าสุดได้');
      }
      latestDeliveries = (await deliveriesResponse.json()).data || [];
    } catch (error) {
      console.error('Failed to fetch latest deliveries for validation:', error);
      message.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะการนัดหมาย กรุณาลองใหม่อีกครั้ง');
      return;
    }

    if (!editingId && contractNumber) {
      const salesContractID = parseInt(contractNumber, 10);
      const hasExistingBooking = latestDeliveries.some(delivery =>
        delivery.SalesContractID === salesContractID &&
        (delivery.status === 'รอดำเนินการ' || delivery.status === 'สำเร็จ') // <--- แก้ไขจาก Status เป็น status
      );

      if (hasExistingBooking) {
        message.error(`หมายเลขสัญญานี้ (${contractNumber}) ได้รับรถยนต์แล้ว หรืออยู่ระหว่างรอดำเนินการ`);
        return;
      }
    }

    const pickupDateTime = selectedDate!
      .hour(parseInt(selectedTime!.split(':')[0]))
      .minute(parseInt(selectedTime!.split(':')[1]))
      .second(0);

    const payload = {
      CustomerID: customerId,
      EmployeeID: selectedEmployeeId!,
      TypeInformationID: selectedMethodId!,
      SalesContractNumber: parseInt(contractNumber!, 10),
      PickupDate: pickupDateTime.format(),
      Address: selectedMethodName === 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' ? address : "",
      Province: selectedMethodName === 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' ? (selectedProvince || "") : "",
      District: selectedMethodName === 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' ? (selectedDistrict || "") : "",
      Subdistrict: selectedMethodName === 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' ? (selectedSubdistrict || "") : "",
    };

    try {
      const url = editingId
        ? `http://localhost:8080/pickup-deliveries/${editingId}`
        : 'http://localhost:8080/pickup-deliveries';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success(editingId ? 'แก้ไขการนัดหมายสำเร็จ!' : 'สร้างการนัดหมายสำเร็จ!');
        navigate('/pickup-car');
      } else {
        const errorData = await response.json();
        message.error(`บันทึกไม่สำเร็จ: ${errorData.error || 'กรุณาตรวจสอบข้อมูลอีกครั้ง'}`);
      }
    } catch (error) {
      console.error('Failed to save booking:', error);
      message.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };


  const disabledDate = (current: Dayjs): boolean => {
    const now = dayjs();
    if (current && current.isBefore(now, 'day')) return true;
    if (now.hour() >= 12 && current && current.isSame(now, 'day')) return true;
    return false;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const customCss = `
    .ant-select-selection-placeholder {
        color: #a9a9a9 !important;
    }
    .ant-input::placeholder {
        color: #a9a9a9 !important;
    }
    .ant-select-selector {
        background-color: #4A4A4A !important;
        border-color: #888 !important;
    }
    .ant-select-selection-search-input {
      color: #fff !important;
    }
    .ant-select-arrow {
      color: #fff !important;
    }
    .ant-select-dropdown {
        background-color: #4A4A4A !important;
    }
    .ant-select-item-option-content {
        color: #fff !important;
    }
    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background-color: #f1d430ff !important;
        color: #000 !important;
    }
  `;

  return (
    <div style={{ padding: '24px 48px' }}>
      <style>{customCss}</style>
      <style>{`
        .ant-select-selection-item {
          color: #FFFFFF !important;
        }
        .custom-dropdown-theme .ant-select-item-option-content {
          color: #FFFFFF; 
        }
        .custom-dropdown-theme .ant-select-item-option-active .ant-select-item-option-content {
           color: #FFFFFF; 
        }
        .custom-dropdown-theme .ant-select-item-option-selected .ant-select-item-option-content {
          color: #FFFFFF;
        }
      `}</style>
      <div style={{ minHeight: 'calc(100vh - 180px)', padding: 24 }}>
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Title level={2} style={{ color: 'white' }}>{editingId ? 'แก้ไข' : 'สร้าง'}การนัดหมายรับรถยนต์</Title>
            <Divider style={{ borderColor: '#424242' }} />

            <Title level={4} style={{ color: '#f1d430ff' }}>ข้อมูลการนัดหมาย</Title>
            <Row align="middle" gutter={[16, 20]} style={{ marginBottom: '40px' }}>
              <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>หมายเลขสัญญาซื้อขาย</Text></Col>
              <Col xs={24} sm={16}>
                <Select
                  placeholder="เลือกหมายเลขสัญญา"
                  value={contractNumber}
                  style={{ width: '100%', ...inputStyle }}
                  onChange={value => setContractNumber(value)}
                  options={availableSalesContracts.map(contract => ({
                    value: String(contract.ID),
                    label: `SC-${contract.ID}`
                  }))}
                  notFoundContent={<Text style={{ color: '#aaa' }}>ไม่พบหมายเลขสัญญา</Text>}
                />
              </Col>

              <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>เลือกพนักงาน</Text></Col>
              <Col xs={24} sm={16}><Select
                placeholder="เลือกพนักงาน"
                value={selectedEmployeeId}
                style={{ width: '100%' }}
                onChange={setSelectedEmployeeId}
                options={employees?.map(emp => ({
                  value: emp.employeeID,
                  label: `${emp.firstName} ${emp.lastName}`
                }))}
              /></Col>

              <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>วิธีการรับรถ</Text></Col>
              <Col xs={24} sm={16}><Select
                placeholder="เลือกวิธีการรับรถ"
                value={selectedMethodId}
                style={{ width: '100%' }}
                onChange={setSelectedMethodId}
                options={typeInformations?.map(type => ({
                  value: type.ID,
                  label: type.type
                }))}
              /></Col>
            </Row>

            <Title level={4} style={{ color: 'white' }}>เลือกวันเวลานัดหมาย</Title>
            <div style={{ background: '#4A4A4A', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '40px' }}>
              <CustomDatePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate as (date: Dayjs) => void}
                disabledDate={disabledDate}

              />
              <div style={{ padding: '24px' }}>
                <Row gutter={[16, 16]}>
                  {timeOptions.map((time, index) => {
                    const isBooked = bookedTimeSlots.includes(time);

                    let isTimeDisabled = false;
                    const now = dayjs();

                    if (!selectedEmployeeId) {
                      isTimeDisabled = true;
                    }

                    if (selectedDate && selectedDate.isSame(now, 'day')) {
                      if (now.hour() >= 12) {
                        isTimeDisabled = true;
                      } else {
                        const [hour, minute] = time.split(':').map(Number);
                        const timeSlotForToday = now.hour(hour).minute(minute);
                        if (now.isAfter(timeSlotForToday)) {
                          isTimeDisabled = true;
                        }
                      }
                    }
                    const isDisabled = isBooked || isTimeDisabled;

                    return (
                      <Col xs={12} sm={8} md={6} key={index}>
                        <Button
                          disabled={isDisabled}
                          style={{
                            width: '100%',
                            height: '50px',
                            background: selectedTime === time ? '#f1d430ff' : 'transparent',
                            color: selectedTime === time ? 'black' : (isDisabled) ? '#888' : 'white',
                            borderColor: selectedTime === time ? '#f1d430ff' : (isDisabled) ? '#555' : '#ddd',
                            cursor: (isDisabled) ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </div>

            {selectedMethodName === 'ให้ไปส่งตามที่อยู่(เฉพาะเขตกรุงเทพฯ)' && (
              <>
                <Title level={4} style={{ color: 'white' }}>ข้อมูลที่อยู่สำหรับจัดส่ง</Title>
                <Row align="middle" gutter={[16, 20]} style={{ marginBottom: '40px' }}>
                  <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)</Text></Col>
                  <Col xs={24} sm={16}><Input.TextArea placeholder="รายละเอียดที่อยู่" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} /></Col>

                  <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>จังหวัด</Text></Col>
                  <Col xs={24} sm={16}>
                    <Select
                      placeholder="เลือกจังหวัด"
                      value={selectedProvince}
                      style={{ width: '100%' }}
                      disabled={selectedMethodId === 2}
                      options={selectedMethodId === 2
                        ? [{ value: 'Bangkok', label: 'กรุงเทพมหานคร' }]
                        : provinces.map(p => ({ value: p.name_th, label: p.name_th }))
                      }
                      onChange={setSelectedProvince}
                    />
                  </Col>

                  <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>อำเภอ/เขต</Text></Col>
                  <Col xs={24} sm={16}>
                    <Select
                      showSearch
                      placeholder="เลือกอำเภอ/เขต"
                      value={selectedDistrict}
                      style={{ width: '100%' }}
                      onChange={setSelectedDistrict}
                      disabled={!selectedProvince}
                      options={selectedMethodId === 2
                        ? districtsFromApi.map(d => ({ value: d.DistrictName, label: d.DistrictName }))
                        : districtOptions
                      }
                    />
                  </Col>

                  <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>ตำบล/แขวง</Text></Col>
                  <Col xs={24} sm={16}>
                    <Select
                      showSearch
                      placeholder="เลือกตำบล/แขวง"
                      value={selectedSubdistrict}
                      style={{ width: '100%' }}
                      onChange={setSelectedSubdistrict}
                      disabled={!selectedDistrict}
                      options={selectedMethodId === 2
                        ? subDistrictsFromApi.map(s => ({ value: s.SubDistrictName, label: s.SubDistrictName }))
                        : subdistrictOptions
                      }
                    />
                  </Col>
                </Row>
              </>
            )}

            <Row justify="center" style={{ marginTop: '60px' }}>
              <Space size="middle">
                <Button
                  disabled={isSaveDisabled}
                  style={{
                    width: '120px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA50A)',
                    color: 'black',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
                    opacity: isSaveDisabled ? 0.5 : 1,
                  }}
                  onClick={handleSave}
                >
                  {editingId ? 'บันทึกการแก้ไข' : 'บันทึก'}
                </Button>
                <Button
                  type="default"
                  style={{ width: '120px', height: '40px', background: 'transparent', borderColor: '#888', color: '#888' }}
                  onClick={() => navigate('/pickup-car')}
                >
                  ยกเลิก
                </Button>
              </Space>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PickupCarCreatePage;