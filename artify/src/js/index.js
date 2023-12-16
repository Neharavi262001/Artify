import {createApi} from 'unsplash-js'



document.addEventListener('DOMContentLoaded', () => {

  const main = document.querySelector('.container');
  const favoritesContainer = document.getElementById('favorites-container');





  let currentPage = 1;
  let currentCategory = '';
  let likedImages = [];
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
  //toggle function
function toggleLike(event){
  const button = event.target;
  const photoId = button.dataset.photoId;
  const isLiked = button.dataset.liked === 'true';

  if (!isLiked) {
    likedImages.push(photoId);
  } else {
    likedImages = likedImages.filter(id => id !== photoId);
  }

  // Toggle the button text content and dataset
  button.textContent = isLiked ? 'Like' : 'Unlike';
  button.dataset.liked = isLiked ? 'false' : 'true';

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

      console.log(favoriteDetails)
    });

       // Wait for all fetches to complete
       Promise.all(fetchDetailsPromises).then(() => {
        // Generate HTML for each liked photo
        const favoriteUrls = favoriteDetails.map((photo) => {
          return `<div class="favorite-item">
                    <img src=${photo.urls.small} alt="Liked Artwork" />
                    <p>${photo.description || 'No description available'}</p>
                    <button class="remove-btn">Remove</button>
                  </div>`;
        });
  
        // Update the Favorites container with the HTML
        favoritesContainer.innerHTML = favoriteUrls.join('');


        const removeButtons = document.querySelectorAll('.favorite-item .remove-btn');
        removeButtons.forEach((button,index) => {
          const photoId = likedImages[index];
          button.dataset.photoId = photoId;
          button.addEventListener('click', removeFavoriteItem);
        });
      });
    }

    
    function removeFavoriteItem(event) {
      const button = event.target;
      const photoId = button.dataset.photoId;
    
      // Remove the corresponding item from the likedImages array
      likedImages = likedImages.filter((id) => id !== photoId);
    
      // Find the corresponding like button in the main gallery
      const likeButton = document.querySelector(`.like-btn[data-photo-id="${photoId}"]`);
    
      // Update the like button text and dataset
      if (likeButton) {
        likeButton.textContent = 'Like';
        likeButton.dataset.liked = 'false';
      }
    
      // Remove the favorite item from the DOM
      const favoriteItem = button.closest('.favorite-item');
      favoriteItem.remove();
    
      // Re-render the favorites section
      renderFavorites();
    }
    








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
  
  <button class="close-popup">&times;</button>
`;


main.appendChild(card);

const cancelPopupButton = document.querySelector('.close-popup');
cancelPopupButton.addEventListener('click', () => {
  // Remove the card when the cancel button is clicked
  card.remove();
});
}

