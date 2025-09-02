import { Router } from 'express';
import { getTaxBrackets, getPensionLimits, getProvinces } from '../controllers/data';
import { asyncHandler } from '../middleware';

const router = Router();

/**
 * @swagger
 * /api/data/tax-brackets/{year}/{province}:
 *   get:
 *     summary: Get tax brackets for a specific year and province
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2030
 *         example: 2025
 *       - in: path
 *         name: province
 *         required: true
 *         schema:
 *           type: string
 *           enum: [AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT]
 *         example: "ON"
 *     responses:
 *       200:
 *         description: Tax brackets data
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/tax-brackets/:year/:province', asyncHandler(getTaxBrackets));

/**
 * @swagger
 * /api/data/pension-limits/{year}:
 *   get:
 *     summary: Get pension limits for a specific year
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2030
 *         example: 2025
 *     responses:
 *       200:
 *         description: Pension limits data
 *       400:
 *         description: Invalid year
 *       401:
 *         description: Unauthorized
 */
router.get('/pension-limits/:year', asyncHandler(getPensionLimits));

/**
 * @swagger
 * /api/data/provinces:
 *   get:
 *     summary: Get list of Canadian provinces and territories
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: List of provinces and territories
 *       401:
 *         description: Unauthorized
 */
router.get('/provinces', asyncHandler(getProvinces));

export default router;