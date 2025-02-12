
import * as Inputs from "@observablehq/inputs";

export function transformData(evol, level, year_start, year_end) {
    // 1. Filtrer le tableau 'evol' sur la période voulue
    const evolFiltered = [...evol].filter(item => item.year_start === year_start && item.year_end === year_end);
  
    // 2. Filtrer le tableau 'level' pour l’année de fin
    const levelFiltered = [...level].filter(item => item.year === year_end);
  
    // 3. Fusionner les données sur la base de 'code' et 'depcom_2018'
    const mergedTable = levelFiltered.map(levelItem => {
      const evolItem = evolFiltered.find(
        e => e.code === levelItem.code && e.depcom_2018 === levelItem.depcom_2018
      );
      return evolItem ? { ...levelItem, ...evolItem } : levelItem;
    });
  
    // 4. Transformer chaque objet pour renommer les champs area_building et pct_building
    //    en fonction de l’année (year)
    const transformedTable = mergedTable.map(({ __index_level_0__, area_building, pct_building, year, ...rest }) => {
      return {
        ...rest, 
        [`aire_${year}`]: area_building,         // ex: "aire_2020": 123
        [`pourcentage_bati_${year}`]: pct_building // ex: "pourcentage_bati_2020": 45
      };
    });
    
    return transformedTable;
  }

   