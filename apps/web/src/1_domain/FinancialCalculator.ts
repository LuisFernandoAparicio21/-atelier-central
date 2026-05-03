export interface ScenarioData {
  salesVolume: number;
  unitPrice: number;
  costPerUnit: number;
  fixedCosts: number;
}

export const calculateProfit = (data: ScenarioData) => {
  return (data.salesVolume * (data.unitPrice - data.costPerUnit)) - data.fixedCosts;
};

export const calculateMargin = (data: ScenarioData) => {
  const revenue = data.salesVolume * data.unitPrice;
  const profit = calculateProfit(data);
  return revenue === 0 ? 0 : (profit / revenue) * 100;
};
