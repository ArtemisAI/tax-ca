import { Request, Response } from 'express';
import { DataService } from '../services';
import { ApiResponse } from '../types';
import { ProvinceCode } from '../../../../src/misc';

const dataService = new DataService();

export const getTaxBrackets = async (req: Request, res: Response) => {
  const { year, province } = req.params;
  
  try {
    const yearNum = parseInt(year, 10);
    const provinceCode = province.toUpperCase() as ProvinceCode;
    
    // Validate province code
    const validProvinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
    if (!validProvinces.includes(provinceCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid province code',
        code: 'INVALID_PROVINCE'
      });
    }
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2030) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year. Must be between 2000 and 2030',
        code: 'INVALID_YEAR'
      });
    }
    
    const result = dataService.getTaxBrackets(yearNum, provinceCode);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Tax brackets retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const getPensionLimits = async (req: Request, res: Response) => {
  const { year } = req.params;
  
  try {
    const yearNum = parseInt(year, 10);
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2030) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year. Must be between 2000 and 2030',
        code: 'INVALID_YEAR'
      });
    }
    
    const result = dataService.getPensionLimits(yearNum);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Pension limits retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const getProvinces = async (req: Request, res: Response) => {
  try {
    const result = dataService.getProvinces();
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Provinces retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    throw error;
  }
};