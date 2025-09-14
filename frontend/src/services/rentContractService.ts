import axios from "axios";

const API_URL = "http://localhost:8080/rent-contracts";

export const getRentDatesByCarID = async (carId: number) => {
  const res = await axios.get(`${API_URL}/car/${carId}`);
  // return res.data.dates; // [{start_date: "...", end_date: "..."}]
    return res.data?.dates || [];
};
