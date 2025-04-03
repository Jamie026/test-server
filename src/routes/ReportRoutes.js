// src/routes/ReportRoutes.js
const express = require("express");
const { 
  createDailyReport, 
  viewReportStatus, 
  downloadAndProcess, 
  getDailyReport, 
  negativizeReport,
  getReportList,
  getUpdateData
} = require("../controllers/ReportController");

const router = express.Router();

// Define routes (endpoints) for reports
router.get('/', getReportList);
router.get("/getUpdateData", getUpdateData);
router.post("/create/report", createDailyReport);
router.get('/:date', getDailyReport);
router.get("/:reportId", viewReportStatus);
router.post("/download", downloadAndProcess);
router.post("/:reportId/negativize", negativizeReport);

module.exports = router;