export function getCityPhotos(cityName: string) {
  switch (cityName) {
    case "Bruges":
      return photos.Bruges;
    default:
      return [];
  }
}

export const photos = {
  Bruges: [
    {
      src: "Bruges/1.jpg",
      width: 9,
      height: 16,
    },
    {
      src: "Bruges/2.jpg",
      width: 16,
      height: 9,
    },
    {
      src: "Bruges/3.jpg",
      width: 16,
      height: 9,
    },
    {
      src: "Bruges/4.jpg",
      width: 4,
      height: 5,
    },
    {
      src: "Bruges/5.jpg",
      width: 16,
      height: 9,
    },
    {
      src: "Bruges/6.jpg",
      width: 4,
      height: 5,
    },
    {
      src: "Bruges/7.jpg",
      width: 4,
      height: 5,
    },
    {
      src: "Bruges/8.jpg",
      width: 16,
      height: 9,
    },
    {
      src: "Bruges/9.jpg",
      width: 4,
      height: 5,
    },
    {
      src: "Bruges/10.jpg",
      width: 5,
      height: 4,
    },
    {
      src: "Bruges/11.jpg",
      width: 16,
      height: 9,
    },
    {
      src: "Bruges/12.jpg",
      width: 16,
      height: 9,
    },
    {
      src: "Bruges/13.jpg",
      width: 9,
      height: 16,
    },
    {
      src: "Bruges/14.jpg",
      width: 4,
      height: 3,
    },
    {
      src: "Bruges/15.jpg",
      width: 16,
      height: 9,
    },
    {
      src: "Bruges/16.jpg",
      width: 5,
      height: 4,
    },
  ],
};
