/** Next index in a list of `len`, wrapping. dir = 1 next, -1 prev. */
export const step = (i: number, len: number, dir: 1 | -1) => (len ? (i + dir + len) % len : 0);
