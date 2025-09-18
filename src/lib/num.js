export const nf = (n) => new Intl.NumberFormat("ru-RU").format(n);

export function trendPoints() {
  const labels = ["май","июл","сен","ноя","янв","мар"];
  const base = 0.82;
  return labels.map((m, i) => ({
    name: m,
    value: +(base + i*(Math.random()*0.18 + 0.1)).toFixed(2)
  }));
}
