export const transformToBoolean = (value: any): boolean => !!value;

export const transformToNumber = (value: string | number): number => (typeof value === 'string' ? parseFloat(value) : value);
