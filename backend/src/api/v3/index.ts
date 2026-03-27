import { Router } from "express";
import { responseWrapper } from "../../middleware/responseWrapper.js";
import disbursementFileRouter from "./disbursement-file.routes.js";
import safeVaultRouter from "./safe-vault.routes.js";

const router = Router();

router.use(responseWrapper);
router.use(disbursementFileRouter);
router.use(safeVaultRouter);

export default router;
