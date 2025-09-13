import React, { useState, useEffect } from "react";
import type { CarInfo, FilterValues, SortOption } from "../../../interface/Car";
import { getAllCars } from "../../../services/carService";
import CarCard from "../../../components/CarCard";
import Filter from "../../../components/Filter";

const AddSellPage: React.FC = () => {
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarInfo[]>([]);

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
    <div style={{  marginTop: 60 }}>
      <div style={{marginTop:70, marginLeft:280, backgroundColor:'rgba(240, 226, 34, 1)',height:80 ,padding:1, alignItems:"center"}}>
        <h1 style={{color:"black", marginLeft:80}}>เลือกรถเพื่อขายหรอปล่อยเช่า</h1>
      </div>
      <Filter cars={cars} onApply={handleApply} onClear={handleClear} />
      <div style={{ marginLeft: 300, padding: 20, display: "flex", flexWrap: "wrap", gap: 20 }}>
        {filteredCars
          .filter(car => !car.sale_list?.length && !car.rent_list?.length) // ✅ โชว์เฉพาะรถที่ว่าง
          .map(car => (
            <CarCard key={car.ID} car={car} type="noUse"  />
          ))}
      </div>
      <div style={{marginBottom:200}}></div>
    </div>
  );
};

export default AddSellPage;
