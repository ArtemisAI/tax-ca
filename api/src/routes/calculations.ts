import { Router } from 'express';
import {
  calculateIncomeTax,
  calculateCPPContribution,
  calculateEIContribution,
  calculateDividendTax,
  calculateCapitalGains
} from '../controllers/calculations';
import { validateRequest, asyncHandler, calculationLimiter } from '../middleware';
import {
  incomeTaxRequestSchema,
  cppContributionRequestSchema,
  eiContributionRequestSchema,
  dividendTaxRequestSchema,
  capitalGainsRequestSchema
} from '../schemas';

const router = Router();

// Apply rate limiting to all calculation routes
router.use(calculationLimiter);

/**
 * @swagger
 * /api/calculate/income-tax:
 *   post:
 *     summary: Calculate income tax
 *     tags: [Tax Calculations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grossIncome
 *               - province
 *             properties:
 *               grossIncome:
 *                 type: number
 *                 minimum: 0
 *                 example: 75000
 *               province:
 *                 type: string
 *                 enum: [AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT]
 *                 example: "ON"
 *               year:
 *                 type: number
 *                 minimum: 2000
 *                 maximum: 2030
 *                 example: 2025
 *               inflationRate:
 *                 type: number
 *                 minimum: -0.1
 *                 maximum: 0.3
 *                 example: 0.02
 *               yearsToInflate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *                 example: 0
 *     responses:
 *       200:
 *         description: Income tax calculation result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/income-tax', 
  validateRequest(incomeTaxRequestSchema),
  asyncHandler(calculateIncomeTax)
);

/**
 * @swagger
 * /api/calculate/cpp-contributions:
 *   post:
 *     summary: Calculate CPP contributions
 *     tags: [Tax Calculations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - income
 *             properties:
 *               income:
 *                 type: number
 *                 minimum: 0
 *                 example: 75000
 *               year:
 *                 type: number
 *                 minimum: 2000
 *                 maximum: 2030
 *                 example: 2025
 *     responses:
 *       200:
 *         description: CPP contribution calculation result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/cpp-contributions',
  validateRequest(cppContributionRequestSchema),
  asyncHandler(calculateCPPContribution)
);

/**
 * @swagger
 * /api/calculate/ei-contributions:
 *   post:
 *     summary: Calculate EI contributions
 *     tags: [Tax Calculations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - income
 *               - province
 *             properties:
 *               income:
 *                 type: number
 *                 minimum: 0
 *                 example: 75000
 *               province:
 *                 type: string
 *                 enum: [AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT]
 *                 example: "ON"
 *               year:
 *                 type: number
 *                 minimum: 2000
 *                 maximum: 2030
 *                 example: 2025
 *     responses:
 *       200:
 *         description: EI contribution calculation result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/ei-contributions',
  validateRequest(eiContributionRequestSchema),
  asyncHandler(calculateEIContribution)
);

/**
 * @swagger
 * /api/calculate/dividend-tax:
 *   post:
 *     summary: Calculate dividend tax
 *     tags: [Tax Calculations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dividendAmount
 *               - isEligible
 *               - province
 *             properties:
 *               dividendAmount:
 *                 type: number
 *                 minimum: 0
 *                 example: 5000
 *               isEligible:
 *                 type: boolean
 *                 example: true
 *               province:
 *                 type: string
 *                 enum: [AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT]
 *                 example: "ON"
 *               year:
 *                 type: number
 *                 minimum: 2000
 *                 maximum: 2030
 *                 example: 2025
 *     responses:
 *       200:
 *         description: Dividend tax calculation result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/dividend-tax',
  validateRequest(dividendTaxRequestSchema),
  asyncHandler(calculateDividendTax)
);

/**
 * @swagger
 * /api/calculate/capital-gains:
 *   post:
 *     summary: Calculate capital gains tax
 *     tags: [Tax Calculations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - capitalGains
 *               - province
 *             properties:
 *               capitalGains:
 *                 type: number
 *                 minimum: 0
 *                 example: 10000
 *               province:
 *                 type: string
 *                 enum: [AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT]
 *                 example: "ON"
 *               year:
 *                 type: number
 *                 minimum: 2000
 *                 maximum: 2030
 *                 example: 2025
 *     responses:
 *       200:
 *         description: Capital gains tax calculation result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/capital-gains',
  validateRequest(capitalGainsRequestSchema),
  asyncHandler(calculateCapitalGains)
);

export default router;