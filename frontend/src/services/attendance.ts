import api from "./api";
import type { Attendance } from "../types";

export const attendanceService = {
  list: () => api.get<Attendance[]>("/attendance/"),
  checkIn: (member_id: number) => api.post<Attendance>("/attendance/checkin", { member_id }),
  checkOut: (member_id: number) => api.post<Attendance>("/attendance/checkout", { member_id }),
};
