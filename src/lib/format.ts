export const formatMoney = (value: number) =>
  `AED ${Number(value || 0).toLocaleString('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
