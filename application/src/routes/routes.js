import express from "express";
import { gerarCodigoRastreio } from "../service/traceability.service.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("OK");
});

router.post("/drugAsset", (req, res, next) => {
  // Criar medicamentos ou lote de medicamentos

  res.status(200).json({});
});

router.post("/drugBatchAsset", (req, res, next) => {
  // Criar medicamentos ou lote de medicamentos

  res.status(200).json({});
});

router.get("/traceabilityCode", (req, res, next) => {
  // Gera um código de rastreio

  res.status(200).json({});
});

router.get("/activity", (req, res, next) => {
  // implementation of GET /activity

  res.status(200).json({});
});

router.post("/activity/transport", (req, res, next) => {
  // Registrar atividades de transporte de medicamentos ou lote de medicamentos

  res.status(200).json({});
});

router.post("/activity/inspection", (req, res, next) => {
  // Registrar atividades de inspeção

  res.status(200).json({});
});

router.post("/activity/drugSale", (req, res, next) => {
  // Registrar venda de medicamentos

  res.status(200).json({});
});

router.get("/activity/drugSale", (req, res, next) => {
  // implementation of GET /activity/drugSale

  res.status(200).json({});
});

router.post("/activity/incident", (req, res, next) => {
  // Registrar atividades de incidentes

  res.status(200).json({});
});

router.post("/checkAssetValidity", (req, res, next) => {
  // Consultar se medicamento é válido pelo código de rastreio

  res.status(200).json({});
});

router.get("/getAsset", (req, res, next) => {
  // implementation of GET /getAsset

  res.status(200).json({});
});

export default router;
