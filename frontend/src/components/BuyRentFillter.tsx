import React, { useState } from "react";
import type { CarInfo, FilterValues, SortOption } from "../interface/Car";
import { Select, Button, Space, Typography } from "antd";

const { Option } = Select;
const { Title } = Typography;

interface FilterProps {
  cars: CarInfo[];
  onApply: (filters: FilterValues, sort?: SortOption) => void;
  onClear: () => void;
}

const Filter: React.FC<FilterProps> = ({ cars, onApply, onClear }) => {
  const [brand, setBrand] = useState<string>();
  const [model, setModel] = useState<string>();
  const [subModel, setSubModel] = useState<string>();
  const [condition, setCondition] = useState<string>();
  const [priceMin, setPriceMin] = useState<number>();
  const [priceMax, setPriceMax] = useState<number>();
  const [sort, setSort] = useState<SortOption>();

  const brands = Array.from(new Set(cars.map((c) => c.brand?.brandName).filter(Boolean)));
  const models = Array.from(
    new Set(
      cars
        .filter((c) => !brand || c.brand?.brandName === brand)
        .map((c) => c.model?.modelName)
        .filter(Boolean)
    )
  );
  const subModels = Array.from(
    new Set(
      cars
        .filter((c) => (!brand || c.brand?.brandName === brand) && (!model || c.model?.modelName === model))
        .map((c) => c.submodel?.submodelName)
        .filter(Boolean)
    )
  );
  const conditions = Array.from(new Set(cars.map((c) => c.condition).filter(Boolean)));

  const handleApply = () => {
    const filters: FilterValues = {
      brand,
      model,
      subModel,
      conditions: condition ? [condition] : undefined,
      priceRange: priceMin !== undefined && priceMax !== undefined ? [priceMin, priceMax] : undefined,
    };
    onApply(filters, sort);
  };

  const handleClear = () => {
    setBrand(undefined);
    setModel(undefined);
    setSubModel(undefined);
    setCondition(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
    setSort(undefined);
    onClear();
  };

  return (
    <div
      style={{
        width: 250, // กำหนดความกว้าง 300 พิกเซล
        maxHeight: "55vh", // กำหนดความสูงสูงสุดไม่เกิน 80% ของหน้าจอ

        boxSizing: "border-box",
        padding: "5px 30px",
        background: "#262626",
        color: "#f3f3f3",
        borderRight: "1px solid rgba(255,255,255,0.03)",
        overflowY: "auto",
        boxShadow: "0 1px 10px rgba(0,0,0,0.5)",
        fontFamily: '"Kanit", "Sarabun", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        borderRadius: 12,
        border: "2px solid gold",
        transition: "box-shadow 0.3s ease-in-out",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <style jsx="true">{`
        .ant-select-selector {
          background: transparent !important;
          border-color: rgba(247, 247, 247, 0.06) !important;
        }
        .ant-select-selection-placeholder {
          color: #484848ff !important;
        }
        .ant-select-item-option-content {
        color: #fff !important;
        }
        .ant-select-selection-item {
          color: #f3f3f3 !important;
        }
        .ant-select-focused .ant-select-selector {
          border-color: #ffd400 !important;
          box-shadow: 0 0 0 2px rgba(255, 212, 0, 0.2) !important;
        }
        .ant-select-dropdown {
          background: #2a2a2a;
          color: #f3f3f3  ;
        }
        .ant-select-item-option-selected {
          background-color: rgba(255, 212, 0, 0.2) !important;
        }
      `}</style>

      {/* Title */}
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <Title level={4} style={{ color: "gold", margin: "2px 0" }}>
          ค้นหารถยนต์
        </Title>
      </div>

      {/* Brand */}
      <Select
        placeholder="เลือกยี่ห้อ"
        value={brand}
        onChange={(v) => {
          setBrand(v);
          setModel(undefined);
          setSubModel(undefined);
        }}
        allowClear
        style={{ width: "100%", marginBottom: 12 }}
      >
        {brands.map((b) => (
          <Option key={b} value={b}>
            {b}
          </Option>
        ))}
      </Select>

      {/* Model */}
      <Select
        placeholder="เลือกรุ่น"
        value={model}
        onChange={(v) => {
          setModel(v);
          setSubModel(undefined);
        }}
        allowClear
        style={{ width: "100%", marginBottom: 12 }}
      >
        {models.map((m) => (
          <Option key={m} value={m}>
            {m}
          </Option>
        ))}
      </Select>

      {/* SubModel */}
      <Select
        placeholder="เลือกซับรุ่น"
        value={subModel}
        onChange={setSubModel}
        allowClear
        style={{ width: "100%", marginBottom: 12 }}
      >
        {subModels.map((sm) => (
          <Option key={sm} value={sm}>
            {sm}
          </Option>
        ))}
      </Select>

      {/* Condition */}
      <Select
        placeholder="เลือกสภาพรถ"
        value={condition}
        onChange={setCondition}
        allowClear
        style={{ width: "100%", marginBottom: 12 }}
      >
        {conditions.map((c) => (
          <Option key={c} value={c}>
            {c}
          </Option>
        ))}
      </Select>

      {/* Sort */}
      <Select
        placeholder="เรียงลำดับ"
        value={sort}
        onChange={setSort}
        allowClear
        style={{ width: "100%", marginBottom: 12 }}
      >
        <Option value="priceAsc">ราคาต่ำ → สูง</Option>
        <Option value="priceDesc">ราคาสูง → ต่ำ</Option>
        <Option value="yearUsedAsc">ปีเก่าน้อย → มาก</Option>
        <Option value="yearUsedDesc">ปีมาก → น้อย</Option>
      </Select>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Button
          onClick={handleClear}
          block
          style={{
            backgroundColor: "gold",
            color: "black",
            fontWeight: "bold",
            border: "2px solid gold",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "gold";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "gold";
            e.currentTarget.style.color = "black";
          }}
        >
          ล้างค่า
        </Button>

        <Button
          onClick={handleApply}
          block
          style={{
            backgroundColor: "gold",
            color: "black",
            fontWeight: "bold",
            border: "2px solid gold",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "gold";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "gold";
            e.currentTarget.style.color = "black";
          }}
        >
          ใช้ตัวกรอง
        </Button>
      </div>

      <div style={{ marginTop: 18, color: "#ccc", fontSize: 12, textAlign: "center" }}>
        ผลลัพธ์จะอัพเดตเมื่อกด "ใช้ตัวกรอง"
      </div>
    </div>
  );
};

export default Filter;
