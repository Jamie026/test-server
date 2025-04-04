const Report = require("../models/ReportModel");
const { insertionQuery } = require("../database/InsertionQuery");
const { reportList } = require("./../database/ReportsQuery");
const { generateDailyReport, getReport, downloadAndProcessReport } = require("../services/ReportService");
const SponsoredType = require('../models/SponsoredTypeModel')
const { Op, fn, col, where } = require('sequelize');
const { getData } = require('../services/realTimeService')

// Generar el reporte diario
const createDailyReport = async (req, res) => {
    try {
        const reportId = await generateDailyReport();
        res.json({ message: "Reporte generado exitosamente", reportId });
    } catch (error) {
        console.error("Error al generar reporte:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const viewReportStatus = async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await getReport(reportId);
        res.json({ reportId: report.reportId, status: report.status });
    } catch (error) {
        console.error("Error al obtener estado del reporte:", error.message);
        res.status(500).json({ error: error.message });
    }
}

const processReportData = async (reportData) => {
    //Promise.all() asegura que las promesas se obtengan
    const reportDataProccesed = await Promise.all(
        reportData.map(async (row, index) => {
            const additionalData = await insertionQuery(row.adGroupName);
            if (!additionalData || additionalData.length === 0) {
                return { ...row, portfolio: null, campaign: null, adGroup: null, asin: null, sku: null };
            }

            const additionalDataJSON = additionalData[0]; // Tomamos el primer y único JSON del array
            //Eliminamos `columnas` después de obtener los datos adicionales
            const { adGroupName, campaignName, portfolioId, ...filteredRow } = row;

            //retornamos el array JSON procesado
            return {
                id: index + 1,
                ...filteredRow,
                portfolio: row.portfolioId !== null
                    ? { portfolioId: additionalDataJSON.portfolioId, portfolioName: additionalDataJSON.portfolioName }
                    : null,
                campaign: {
                    campaignId: additionalDataJSON.campaignId,
                    campaignName: additionalDataJSON.campaignName
                },
                adGroup: {
                    adGroupId: additionalDataJSON.adGroupId,
                    adGroupName: additionalDataJSON.adGroupName
                },
                asin: additionalDataJSON.asin,
                sku: additionalDataJSON.sku
            };
        })
    );

    return reportDataProccesed;
}

const segmentationReport = async (reportProccessed) => {
    //Promise.all() asegura que las promesas se obtengan
    const reportCompleted = reportProccessed.map((item) => {
        if (item.keywordType === "EXACT") {
            item.section = {
                "sectionId": 1,
                "sectionName": "SECURE"
            }
        } else if (item.keywordType === "PHRASE") {
            if (item.searchTerm.startsWith(item.keyword) || item.searchTerm.include(item.keyword)) {
                item.section = {
                    "sectionId": 2,
                    "sectionName": "NEUTRAL"
                }
            } else {
                item.section = {
                    "sectionId": 3,
                    "sectionName": "RISK"
                }
            }
        } else if (item.keywordType === "BROAD") {
            item.section = {
                "sectionId": 2,
                "sectionName": "Neutral"
            }
        }
    });

    return reportCompleted;
}

const downloadAndProcess = async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await getReport(reportId);
        if (report.status !== "COMPLETED") {
            return res.status(400).json({ error: "El reporte aún no está completado." });
        }
        const reportData = await downloadAndProcessReport(report.url);

        const reportProccessed = await processReportData(reportData);

        const reportSegmented = await segmentationReport(reportProccessed);

        const reportBody = {
            sponsored_type_id: 1,
            date: report.startDate,
            report_data: {
                data: reportSegmented
            },
            csts_negativized: null,
            ads_accounts_id: 2
        }

        //Guardar el reporte en BD
        await Report.create(reportBody);
        res.status(201).json({
            msg: "Reporte Descargado y Guardado Correctamente",
            report: reportBody
        });
    } catch (error) {
        console.error("Error al descargar o procesar el reporte:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const test = async (req, res) => {
    try {
        const reportData = []

        const reportProcess = await processReportData(reportData);

        res.status(200).json({ data: reportProcess });
    } catch (error) {
        console.error("Error al Agregar los datos", error.message);
        res.status(500).json({ error: error.message });
    }
}

const getDailyReport = async (req, res) => {
    try {
        const { date } = req.params

        if (!date) {
            return res
                .status(400)
                .json({ error: 'Se requiere un parámetro de fecha.' })
        }

        const report = await Report.findOne({
            where: where(fn('DATE', col('date')), Op.eq, date),
            include: [
                {
                    model: SponsoredType,
                    as: 'sponsored_type',
                    attributes: ['name']
                }
            ]
        })

        if (!report) {
            return res.status(200).json({ data: [] });
        }


        const formattedReports = report.report_data.data.map((item) => ({
            ...item,
            sponsoredTypeName: report.sponsored_type.name
        }))

        res.status(200).json({ data: formattedReports })
    } catch (error) {
        console.error('Error al negativizar el reporte:', error.message)
        res.status(500).json({ error: error.message })
    }
}

const negativizeReport = async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await Report.findOne({ where: { id: reportId } });
        if (report) {
            report.is_negative = true;
            await report.save();
            res.status(200).json({ message: "Reporte negativizado correctamente" });
        } else {
            res.status(404).json({ message: "Reporte no encontrado" });
        }
    } catch (error) {
        console.error("Error al negativizar el reporte:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const getReportList = async (req, res) => {
    try {
        const data = await reportList()
        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Error fetching reports:', error)
        return res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' })
    }
}

const getUpdateData = async(req, res) => {
    try {
        const data = await getData()
        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Error fetching reports:', error)
        return res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' })
    }
}

module.exports = {
    createDailyReport,
    viewReportStatus,
    downloadAndProcess,
    getDailyReport,
    processReportData,
    negativizeReport,
    getReportList, 
    getUpdateData
};