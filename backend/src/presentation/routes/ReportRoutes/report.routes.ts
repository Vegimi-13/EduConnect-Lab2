import { Router } from "express";
import { getReportsOverview } from "../../controllers/ReportController/report.controller";

const router = Router();

router.get("/overview", getReportsOverview);

export default router;