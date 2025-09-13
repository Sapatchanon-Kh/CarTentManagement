import axios from "axios";

const API_URL = "http://localhost:8080/buycar";

export interface BuyCarPayload {
  sale_list_id: number;
  customer_id: number;
  employee_id: number;
}

const buyCarService = {
  buyCar: async (payload: BuyCarPayload) => {
    const res = await axios.post(API_URL, payload);
    return res.data;
  }
};

export default buyCarService;
