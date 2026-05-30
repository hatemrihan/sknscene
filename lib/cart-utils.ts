export function isSameAttributes(
    a?: Record<string, string>,
    b?: Record<string, string>
): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k, i) => k === keysB[i] && a[k] === b[k]);
}
