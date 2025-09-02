import { Request, Response } from 'express';
import { TaxCalculationService } from '../services';
import {
  IncomeTaxRequest,
  CPPContributionRequest,
  EIContributionRequest,
  DividendTaxRequest,
  CapitalGainsRequest,
  ApiResponse
} from '../types';

const taxService = new TaxCalculationService();

export const calculateIncomeTax = async (req: Request, res: Response) => {
  const request: IncomeTaxRequest = req.body;
  
  try {
    const result = taxService.calculateIncomeTax(request);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Income tax calculated successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const calculateCPPContribution = async (req: Request, res: Response) => {
  const request: CPPContributionRequest = req.body;
  
  try {
    const result = taxService.calculateCPPContribution(request);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'CPP contribution calculated successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const calculateEIContribution = async (req: Request, res: Response) => {
  const request: EIContributionRequest = req.body;
  
  try {
    const result = taxService.calculateEIContribution(request);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'EI contribution calculated successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const calculateDividendTax = async (req: Request, res: Response) => {
  const request: DividendTaxRequest = req.body;
  
  try {
    const result = taxService.calculateDividendTax(request);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Dividend tax calculated successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const calculateCapitalGains = async (req: Request, res: Response) => {
  const request: CapitalGainsRequest = req.body;
  
  try {
    const result = taxService.calculateCapitalGains(request);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Capital gains calculated successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};