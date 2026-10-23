// Always one decimal, so a reading keeps its width when it moves between e.g. 17.9, 18 and 18.1.
export function formatOneDecimal(value: number): string {
    const formatted = value.toFixed(1);
    return formatted === "-0.0" ? "0.0" : formatted;
}
