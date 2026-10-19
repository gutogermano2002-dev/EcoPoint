import { Router } from "express";
import { listarEcopontos, cadastrarEcoponto } from "../controller/ecopontos.js";

const router = Router();

router.get("/mogi/ecopontos", listarEcopontos);
router.post("/mogi/ecopontos", cadastrarEcoponto);

export default router;