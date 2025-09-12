import React, { useState, useEffect } from "react";
import type { CarInfo, CarType, FilterValues, SortOption } from "../../../interface/Car";
import { fetchCars } from "../../../services/carService";
import CarCard from "../../../components/CarCard";
import Filter from "../../../components/Filter";
import { Link } from "react-router-dom";
import { Button } from "antd";
const RentListPage: React.FC = () => {
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarInfo[]>([]);

  useEffect(() => {
    const loadCars = async () => {
      const data = await fetchCars();
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
    <div>
      <div style={{ marginTop: 80, marginLeft: 280, backgroundColor: 'rgba(238, 224, 26, 1)', display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginLeft: 20, padding: 5, color: "black" }}>รถที่กำลังปล่อยเช่าทั้งหมด</h2>
        <Link to="/add-rent">
          <div style={{ marginRight: 30 }}>
            <Button type='primary'>เพิ่มรถการปล่อยเช่า</Button>
          </div>
        </Link>
      </div>
      <div style={{ display: "flex", marginTop: 20 }}>
        <Filter cars={cars} onApply={handleApply} onClear={handleClear} />
        <div style={{ marginLeft: 400, padding: 20, display: "flex", flexWrap: "wrap", gap: 20 }}>
          {filteredCars
            .filter(car => car.rent_list?.length) // ✅ โชว์เฉพาะรถที่ขาย
            .map(car => (
              <CarCard key={car.ID} car={car} type="rent" />
            ))}
        </div>
      </div>
    </div>
  );
};

export default RentListPage;
