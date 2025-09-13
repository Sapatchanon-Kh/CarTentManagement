import React, { useState, useEffect } from "react";
import type { CarInfo, CarType, FilterValues, SortOption } from "../../../interface/Car";
import { getAllCars } from "../../../services/carService";
import CarCard from "../../../components/CarCard";
import Filter from "../../../components/Filter";
import { Button } from "antd";
import { Link } from "react-router-dom";

const SellListPage: React.FC = () => {
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarInfo[]>([]);
  const saleCars = cars.filter(car => car.sale_list?.length);

  useEffect(() => {
    const loadCars = async () => {
      const data = await getAllCars();
      setCars(data);         // เก็บรถทั้งหมด
      setFilteredCars(data); // เริ่มต้น filter ก็เอารถทั้งหมด
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
    <div>
      <div style={{ marginTop: 80, marginLeft: 280, backgroundColor: 'rgba(238, 241, 36, 1)', display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginLeft: 20, padding: 5, color: "black" }}>รถที่กำลังปล่อยเช่าทั้งหมด</h2>
        <Link to="/add-sell">
          <div style={{ marginRight: 30 }}>
            <Button type='primary'>เพิ่มการขายรถ</Button>
          </div>
        </Link>
      </div>
      <div style={{ marginLeft: 300, padding: 20, display: "flex", flexWrap: "wrap", gap: 20}}>
        <Filter cars={saleCars} onApply={handleApply} onClear={handleClear} />
        {filteredCars
          .filter(car => car.sale_list?.length) // กรองอีกชั้นเผื่อ filteredCars ถูก sort/filter
          .map(car => (
            <CarCard key={car.ID} car={car} type="sale" />
          ))}
     
    </div>
    </div>
  );
};

export default SellListPage;
