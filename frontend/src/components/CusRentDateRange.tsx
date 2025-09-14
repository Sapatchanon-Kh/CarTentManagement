import { DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";
import "../style/CreateRentCar.css";

const { RangePicker } = DatePicker;

interface Props {
  value?: RangePickerProps["value"];
  onChange?: (dates: RangePickerProps["value"], dateStrings: [string, string]) => void;
  disabledRanges?: { start_date: string; end_date: string }[]; // ✅ เพิ่ม prop
}

export default function CusRentDateRange({ value, onChange, disabledRanges = [] }: Props) {
  const disabledDate = (current: Dayjs) => {
    if (!current) return false;

    // ห้ามเลือกวันย้อนหลัง
    if (current < dayjs().startOf("day")) return true;

    // ถ้าไม่มี rentDates เลย → ไม่ disable อะไร
    if (!disabledRanges || disabledRanges.length === 0) return false;

    // disable วันในช่วงเช่า
    return disabledRanges.some((range) => {
      const start = dayjs(range.start_date, "YYYY-MM-DD");
      const end = dayjs(range.end_date, "YYYY-MM-DD");
      return current.isBetween(start, end, "day", "[]");
    });
  };

  return (
    <div className="rent-page-root" style={{ maxWidth: 500 }}>
      <RangePicker
        value={value}
        onChange={onChange}
        format="DD/MM/YYYY"
        style={{ width: "100%" }}
        disabledDate={disabledDate}
      />
    </div>
  );
}
