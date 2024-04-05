/**
 * Image type
 *
 * @property {string} original - The original image URL
 * @property {string} thumbnail - The thumbnail image URL
 * @property {string} alt - The image alt text
 * @property {number} width - The image width
 * @property {number} height - The image height
 * @property {boolean} [youtube] - The image is a youtube video
 */
export type Image = {
  original: string;
  thumbnail: string;
  alt: string;
  width: number;
  height: number;
  youtube?: boolean;
};
