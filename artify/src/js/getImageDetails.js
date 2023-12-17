import { unsplash } from './unsplash';
export default async function getImageDetails(imageId) {
  const result = await unsplash.photos.get({
    photoId: imageId,
  });
  console.log(result.response);
  const getPhoto = result.response;
  const detialsTo = {
    title: getPhoto.alt_description,
    description: getPhoto.description,
    author: getPhoto.user,
    imageUrl: getPhoto.urls.small,
  };
  console.log(detialsTo);
  return detialsTo;
}
