import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT

export const api = axios.create({
  baseURL: `http://localhost:${PORT}/api`,
  withCredentials: true,
});