export function mat_scale(factorx, factory, factorz) {
    return [
        factorx, 0, 0, 0,
        0, factory, 0, 0,
        0, 0, factorz, 0,
        0, 0, 0, 1,
    ]
}