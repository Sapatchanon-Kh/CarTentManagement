// src/pages/manager/rent/CreateRentCarPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Image,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  message,
  Table,
  Descriptions,
  Popconfirm,
  Typography
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { CarResponse, RentPeriod } from '../../../interface/Rent';
import rentService from '../../../services/rentService';

dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Title } = Typography;

interface RentPeriodWithRange extends RentPeriod {
  range?: [Dayjs | null, Dayjs | null] | null;
  status?: 'available' | 'booked';
  temp?: boolean;
}

const CreateRentCarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<CarResponse | null>(null);
  const [periods, setPeriods] = useState<RentPeriodWithRange[]>([]);

  useEffect(() => {
    if (id) {
      rentService.getRentListsByCar(Number(id)).then((res) => {
        setCar(res);
        setPeriods(
          res.rent_list.map((p) => ({
            ...p,
            temp: false,
            status: p.status as 'available' | 'booked',
            range: [
              p.rent_start_date ? dayjs(p.rent_start_date) : null,
              p.rent_end_date ? dayjs(p.rent_end_date) : null,
            ],
          }))
        );
      });
    }
  }, [id]);

  const addPeriod = () => {
    setPeriods([
      ...periods,
      {
        rent_price: 0,
        temp: true,
        rent_start_date: '',
        rent_end_date: '',
        range: [null, null],
      },
    ]);
  };

  const removePeriod = async (index: number) => {
    if (!car) return;
    const period = periods[index];
    if (period.id) {
      try {
        await rentService.deleteRentDate(period.id);
        message.success('ลบช่วงเช่าสำเร็จ');
        setPeriods(periods.filter((_, i) => i !== index));
      } catch (err) {
        console.error(err);
        message.error('ลบช่วงเช่าไม่สำเร็จ');
      }
    } else {
      setPeriods(periods.filter((_, i) => i !== index));
    }
  };

  const updatePeriod = (index: number, key: keyof RentPeriodWithRange, value: any) => {
    const newPeriods = [...periods];
    newPeriods[index] = { ...newPeriods[index], [key]: value };
    setPeriods(newPeriods);
  };

  const handleRangeChange = (index: number, dates: [Dayjs | null, Dayjs | null] | null) => {
    const newPeriods = [...periods];
    newPeriods[index] = {
      ...newPeriods[index],
      range: dates,
      rent_start_date: dates?.[0]?.format('YYYY-MM-DD') || '',
      rent_end_date: dates?.[1]?.format('YYYY-MM-DD') || '',
    };
    setPeriods(newPeriods);
  };

  const handleSubmit = async () => {
    if (!car) return;
    const validPeriods = periods.filter(
      (p) => p.rent_start_date && p.rent_end_date && p.rent_price > 0
    );
    if (validPeriods.length === 0) {
      message.warning(
        'กรุณาเพิ่มช่วงเช่าที่ถูกต้อง (วันที่และราคาต้องไม่ว่าง และราคาต้อง > 0)'
      );
      return;
    }
    try {
      await rentService.createOrUpdateRentList({
        car_id: car.id,
        status: 'Available',
        manager_id: 1,
        dates: periods.map((p) => ({
          id: p.id || 0,
          open_date: p.rent_start_date,
          close_date: p.rent_end_date,
          rent_price: p.rent_price,
        })),
      });
      message.success('บันทึกเรียบร้อย');

      const res = await rentService.getRentListsByCar(car.id);
      setCar(res);
      setPeriods(
        res.rent_list.map((p) => ({
          ...p,
          temp: false,
          status: p.status as 'available' | 'booked',
          range: [
            p.rent_start_date ? dayjs(p.rent_start_date) : null,
            p.rent_end_date ? dayjs(p.rent_end_date) : null,
          ],
        }))
      );
    } catch (err) {
      console.error(err);
      message.error('บันทึกไม่สำเร็จ');
    }
  };

  const renderCarImages = () => {
    if (!car) return null;
    const pics = [...(car.pictures || [])];
    if (pics.length === 0) pics.push({ id: 0, path: 'placeholder.png', title: 'No Image' });

    return (
      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: 8 }}>
        <Title level={5}>รูปตัวอย่างรถ</Title>
        <Row gutter={[12, 12]}>
          {pics.map((pic) => (
            <Col
              key={pic.id || pic.path}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={4}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Card
                hoverable
                cover={
                  <Image
                    src={`http://localhost:8080/images/cars/${pic.path}`}
                    alt={pic.title}
                    style={{ objectFit: 'cover', height: 120, width: '100%' }}
                    preview
                  />
                }
                style={{ width: '100%' }}
              >
                <Card.Meta
                  title={pic.title !== 'Placeholder' ? pic.title : ''}
                  description={pic.title !== 'Placeholder' ? '' : 'No image available'}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  // สร้าง map วันที่ -> status
  const getDateStatusMap = () => {
    const map: Record<string, 'available' | 'booked'> = {};
    periods.forEach((p) => {
      if (p.range?.[0] && p.range?.[1] && p.status) {
        let current = p.range[0]!;
        const end = p.range[1]!;
        while (current.isSameOrBefore(end, 'day')) {
          map[current.format('YYYY-MM-DD')] = p.status!;
          current = current.add(1, 'day');
        }
      }
    });
    return map;
  };
const columns = [
  {
    title: 'ช่วงวันที่',
    dataIndex: 'range',
    render: (_: any, record: RentPeriodWithRange, idx?: number) => (
      <RangePicker
        value={record.range as [Dayjs, Dayjs]}
        onChange={(dates) => handleRangeChange(idx ?? 0, dates)}
        dateRender={(current) => {
          const status = getDateStatusMap()[current.format('YYYY-MM-DD')];
          const style: React.CSSProperties = { textAlign: 'center', borderRadius: '50%' };
          if (status === 'available') style.backgroundColor = '#95de64';
          if (status === 'booked') style.backgroundColor = '#ff7875';
          return <div style={style}>{current.date()}</div>;
        }}
      />
    ),
  },
  {
    title: 'ราคา/วัน',
    dataIndex: 'rent_price',
    render: (_: any, record: RentPeriodWithRange, idx?: number) => (
      <InputNumber
        min={0}
        value={record.rent_price}
        onChange={(value) => updatePeriod(idx ?? 0, 'rent_price', value || 0)}
      />
    ),
  },
  {
    title: 'ลบ',
    render: (_: any, _record: RentPeriodWithRange, idx?: number) => (
      <Popconfirm title="คุณแน่ใจว่าจะลบช่วงเช่านี้?" onConfirm={() => removePeriod(idx ?? 0)}>
        <Button danger>ลบ</Button>
      </Popconfirm>
    ),
  },
];


  return (
    <div>
      {car && (
        <Card title={`สร้าง/แก้ไข Rent List สำหรับรถ ${car.car_name}`} bordered>
          <Title level={1}>ปล่อยเช่า {car.car_name}</Title>
          {renderCarImages()}

          <Title level={4} style={{ marginTop: 16 }}>
            ข้อมูลรถ
          </Title>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="ปีผลิต">{car.year_manufacture}</Descriptions.Item>
            <Descriptions.Item label="สี">{car.color}</Descriptions.Item>
            <Descriptions.Item label="ระยะทาง">{car.mileage} km</Descriptions.Item>
            <Descriptions.Item label="สภาพ">{car.condition}</Descriptions.Item>
          </Descriptions>

          <Title level={4}>ช่วงเช่า</Title>
          <Button type="primary" onClick={addPeriod} style={{ marginBottom: 10 }}>
            เพิ่มช่วงเช่า
          </Button>

          <Table
            dataSource={periods}
            columns={columns}
            pagination={false}
            rowKey={(record, index) => record.id?.toString() || index.toString()}
          />

          <Button type="primary" onClick={handleSubmit} style={{ marginTop: 16 }}>
            บันทึก
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CreateRentCarPage;
