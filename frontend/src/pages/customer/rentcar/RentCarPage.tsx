import React, { useState, useEffect } from "react";
import type { CarInfo, CarType, FilterValues, SortOption } from "../../../interface/Car";
import { Typography } from 'antd';
import { getAllCars } from "../../../services/carService";
import CarCard from "../../../components/CarCard";
import Filter from "../../../components/BuyRentFillter";

const RentCarPage: React.FC = () => {
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarInfo[]>([]);
  const { Title } = Typography;

  useEffect(() => {
    const loadCars = async () => {
      const data = await getAllCars();
      setCars(data);
      setFilteredCars(data);
    };
    loadCars();
  }, []);

  const handleApply = (filters: FilterValues, sort?: SortOption) => {
    let result = [...cars];

    if (filters.brand) result = result.filter(c => c.brand?.brandName === filters.brand);
    if (filters.model) result = result.filter(c => c.model?.modelName === filters.model);
    if (filters.subModel) result = result.filter(c => c.submodel?.submodelName === filters.subModel);
    if (filters.conditions?.length) result = result.filter(c => filters.conditions!.includes(c.condition!));
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter(c => c.purchasePrice >= min && c.purchasePrice <= max);
    }

    if (sort) {
      if (sort === "priceAsc") result.sort((a, b) => a.purchasePrice - b.purchasePrice);
      if (sort === "priceDesc") result.sort((a, b) => b.purchasePrice - a.purchasePrice);
      if (sort === "yearUsedAsc") result.sort((a, b) => a.yearManufacture - b.yearManufacture);
      if (sort === "yearUsedDesc") result.sort((a, b) => b.yearManufacture - a.yearManufacture);
    }

    setFilteredCars(result);
  };

  const handleClear = () => setFilteredCars(cars);

  return (
    // <div style={{ display: "flex", marginTop: 60 }}>
    //   <Filter cars={cars} onApply={handleApply} onClear={handleClear} />
    //   <div style={{ marginLeft: 300, padding: 20, display: "flex", flexWrap: "wrap", gap: 20 }}>
    //     {filteredCars
    //       .filter(car => car.sale_list?.length) // ✅ โชว์เฉพาะรถที่ขาย
    //       .map(car => (
    //         <CarCard key={car.ID} car={car} type="rentView" />
    //       ))}
    //   </div>
    // </div>

    <div style={{ padding: 20 }}>
      <Title
        level={2}
        style={{
          color: "#fff",
          margin: "0 0 20px 0",
          display: "inline-block",
          borderBottom: "3px solid gold", // เส้นขีดใต้ตัวหนังสือ
          paddingBottom: "6px",
        }}
      >
        เลือกรถยนต์ที่คุณต้องการเช่า
      </Title>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {/* Filter อยู่ด้านซ้าย */}
        <Filter cars={cars.filter(c => c.rent_list?.length)} onApply={handleApply} onClear={handleClear} />

        {/* Car Cards อยู่ด้านขวา */}
        <div style={{ flex: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {filteredCars
            .filter(car => car.rent_list?.length)
            .map(car => (
              <CarCard key={car.ID} car={car} type="rentView" />
            ))}
        </div>
      </div>
    </div>
  );
};

export default RentCarPage;
