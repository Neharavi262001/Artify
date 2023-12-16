import {createApi} from 'unsplash-js'



document.addEventListener('DOMContentLoaded', () => {

  const main = document.querySelector('.container');
  const favoritesContainer = document.getElementById('favorites-container');





  let currentPage = 1;
  let currentCategory = '';
  const likedImages = [];
  let  accessKey= 'E3A9y0TjAU1tClEJeY0eKDgMz9cxNrpFs6nLpsfsIm8'


  const unsplash = createApi({
    accessKey:accessKey
  });

  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const selectedCategory = link.dataset.category;
      renderGallery(selectedCategory);
      currentCategory = selectedCategory;
      console.log(selectedCategory);
    });
  });

  function renderGallery(category, page) {
    unsplash.search.getPhotos({
      query: category,
      page: page,
      perPage: 25,
      orientation: 'landscape'
    }).then(result => {
      if (result.type === 'success') {
        const photos = result.response.results;
        console.log(photos);
        const getUrls = photos.map(photo => {
          const isLiked=likedImages.includes(photo.id)
          return ` <div class="image-container">
          <img src=${photo.urls.small} alt="Artwork" />
          <button class="like-btn" data-photo-id="${photo.id}" data-liked="${isLiked}">${isLiked ? 'Unlike' : 'Like'}</button>
        </div>`;
        });
        main.innerHTML = getUrls.join('');

        //toggle
        addLikeButtonListeners();
      }
    });
  }


  // Favourites section
  function addLikeButtonListeners() {
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
      button.addEventListener('click', toggleLike);
    });
  }

  //toggle function
  function toggleLike(event){
    const button=event.target;
    const   photoId = button.dataset.photoId;
    const isLiked = button.dataset.liked === 'true';

    if (!isLiked) {
      likedImages.push(photoId);
      button.textContent = 'Unlike';
      button.dataset.liked = 'true';
    } else {
      likedImages = likedImages.filter(id => id !== photoId);
      button.textContent = 'Like';
      button.dataset.liked = 'false';
    }
    renderFavorites();
  }


  function renderFavorites() {
    const favoriteDetails = [];

    // Fetch details for each liked photo asynchronously
    async function fetchPhotoDetails(photoId) {
      const response = await unsplash.photos.get({ photoId });
      if (response.type === 'success') {
        return response.response;
      }
      return null;
    }

    const fetchDetailsPromises = likedImages.map(async (photoId) => {
      const photoDetails = await fetchPhotoDetails(photoId);
      if (photoDetails) {
        favoriteDetails.push(photoDetails);
      }
    });

       // Wait for all fetches to complete
       Promise.all(fetchDetailsPromises).then(() => {
        // Generate HTML for each liked photo
        const favoriteUrls = favoriteDetails.map((photo) => {
          return `<div class="favorite-item">
                    <img src=${photo.urls.small} alt="Liked Artwork" />
                    <p>${photo.description || 'No description available'}</p>
                  </div>`;
        });
  
        // Update the Favorites container with the HTML
        favoritesContainer.innerHTML = favoriteUrls.join('');
      });
    }



  // function fetchImageById(id){
  //   unsplash.photos.get({
  //     id:id
  //   }).then(result => {
  //     if (result.type === 'success') {
  //       const photos = result.response.results;
  //       console.log(photos);
  //       const getUrls = photos.map(i => {
  //         return `<img src=${i.urls.small}/>`;
  //       });
  //       main.innerHTML = getUrls.join('');
  //     }
  //   })

  // }







  const loadMoreBtn = document.querySelector('#load-more-btn');

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderGallery(currentCategory, currentPage);
  });

  renderGallery('Home');
});




main.addEventListener('click', (event)=>{
  if (event.target.tagName==='IMG'){
    const selectedImage= event.target;
    const imageUrl=selectedImage.src;
    const imageDetails=getImageDetails(imageUrl)

    displayImageDetails(imageDetails)

  }
})


function getImageDetails(imageUrl){

  return {
    title:"title",
    description:"image desc",
    author:"author",
    imageUrl:imageUrl
  }
}


function displayImageDetails(imageDetails){
  const card = document.createElement("div");
  card.classList.add("image-card");

  card.innerHTML = `
  <img src="${imageDetails.imageUrl}" alt="${imageDetails.title}">
  <h3>${imageDetails.title}</h3>
  <p>${imageDetails.description}</p>
  <p>Author: ${imageDetails.author}</p>
  
  <button>&times;</button>
`;

main.innerHTML = "";
main.appendChild(card);

const popupImg=document.querySelector('.image-card')
const cancelpopUp=document.querySelector('.image-card button')
cancelpopUp.addEventListener('click',()=>{
  popupImg.style.display='none'

})
}

