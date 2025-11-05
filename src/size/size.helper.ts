import { ShoeSize } from "@prisma/client";

export class SizeHelper {
  static getSystemFromSizeValue(sizeValue: ShoeSize): string {
    if (sizeValue.startsWith('EU_')) return 'EU';
    if (sizeValue.startsWith('US_')) return 'US';
    if (sizeValue.startsWith('UK_')) return 'UK';
    return 'EU'; // Default to EU if unknown
  }

  static getNumericValue(sizeValue: ShoeSize): string {
    return sizeValue.split('_')[1];
  }
}