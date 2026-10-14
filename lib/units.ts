export type UnitGroup = {
  id: string;
  label: string;
  units: { id: string; label: string; factor: number }[];
};

export const unitGroups: UnitGroup[] = [
  {
    id: "length",
    label: "Length",
    units: [
      { id: "mm", label: "Millimeters", factor: 0.001 },
      { id: "cm", label: "Centimeters", factor: 0.01 },
      { id: "m", label: "Meters", factor: 1 },
      { id: "km", label: "Kilometers", factor: 1000 },
      { id: "in", label: "Inches", factor: 0.0254 },
      { id: "ft", label: "Feet", factor: 0.3048 },
      { id: "yd", label: "Yards", factor: 0.9144 },
      { id: "mi", label: "Miles", factor: 1609.344 },
    ],
  },
  {
    id: "mass",
    label: "Mass",
    units: [
      { id: "mg", label: "Milligrams", factor: 0.000001 },
      { id: "g", label: "Grams", factor: 0.001 },
      { id: "kg", label: "Kilograms", factor: 1 },
      { id: "oz", label: "Ounces", factor: 0.028349523125 },
      { id: "lb", label: "Pounds", factor: 0.45359237 },
      { id: "t", label: "Metric tons", factor: 1000 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius", factor: 1 },
      { id: "f", label: "Fahrenheit", factor: 1 },
      { id: "k", label: "Kelvin", factor: 1 },
    ],
  },
  {
    id: "digital",
    label: "Digital storage",
    units: [
      { id: "b", label: "Bytes", factor: 1 },
      { id: "kb", label: "KB (1024 B)", factor: 1024 },
      { id: "mb", label: "MB (1024 KB)", factor: 1024 ** 2 },
      { id: "gb", label: "GB (1024 MB)", factor: 1024 ** 3 },
      { id: "tb", label: "TB (1024 GB)", factor: 1024 ** 4 },
    ],
  },
  {
    id: "time",
    label: "Time",
    units: [
      { id: "ms", label: "Milliseconds", factor: 0.001 },
      { id: "s", label: "Seconds", factor: 1 },
      { id: "min", label: "Minutes", factor: 60 },
      { id: "h", label: "Hours", factor: 3600 },
      { id: "d", label: "Days", factor: 86400 },
      { id: "wk", label: "Weeks", factor: 604800 },
    ],
  },
  {
    id: "area",
    label: "Area",
    units: [
      { id: "mm2", label: "Square millimeters", factor: 0.000001 },
      { id: "cm2", label: "Square centimeters", factor: 0.0001 },
      { id: "m2", label: "Square meters", factor: 1 },
      { id: "ha", label: "Hectares", factor: 10000 },
      { id: "km2", label: "Square kilometers", factor: 1_000_000 },
      { id: "ft2", label: "Square feet", factor: 0.09290304 },
      { id: "acre", label: "Acres", factor: 4046.8564224 },
    ],
  },
];

function convertTemperature(value: number, from: string, to: string): number {
  const celsius = from === "f" ? ((value - 32) * 5) / 9 : from === "k" ? value - 273.15 : value;
  if (to === "f") return (celsius * 9) / 5 + 32;
  if (to === "k") return celsius + 273.15;
  return celsius;
}

export function convertUnits(groupId: string, from: string, to: string, value: number): number {
  if (groupId === "temperature") return convertTemperature(value, from, to);
  const group = unitGroups.find((item) => item.id === groupId);
  const source = group?.units.find((unit) => unit.id === from);
  const target = group?.units.find((unit) => unit.id === to);
  if (!source || !target) return Number.NaN;
  return (value * source.factor) / target.factor;
}
