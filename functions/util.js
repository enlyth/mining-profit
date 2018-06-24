/**
 * TODO:
 * Apologize to ternary operator for abuse
 */
export function toSIString (val, unit) {
  return val < 1e3
    ? val + ' ' + unit
    : val < 1e6
      ? val / 1e3 + ' K' + unit
      : val < 1e9
        ? val / 1e6 + ' M' + unit
        : val < 1e12
          ? val / 1e9 + ' G' + unit
          : val < 1e15
            ? val / 1e12 + ' T' + unit
            : val < 1e18 ? val / 1e15 + ' P' + unit : val / 1e18 + ' E' + unit
}
