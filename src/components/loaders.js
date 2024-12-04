import {getConfig} from "./config.js";

export async function loadDepartmentData(department) {
    const config = getConfig(department);
    if (!config) {
      throw new Error(`Department ${department} not configured`);
    }
    
  
    try {
      if (config.dataFile) {
        const fileAttachment = config.dataFile();
        return await fileAttachment.json();
      }
    } catch (dataLoadError) {
      console.warn(`No data file found for ${department}:`, dataLoadError);
    }
    
  }
  