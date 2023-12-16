import {createApi} from 'unsplash-js'



document.addEventListener('DOMContentLoaded', () => {
  let currentPage = 1;
  let currentCategory = '';

  let likedPhotos = [];

  const main = document.querySelector('.container');
  const unsplash = createApi({
    accessKey: 'E3A9y0TjAU1tClEJeY0eKDgMz9cxNrpFs6nLpsfsIm8'
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
        const getUrls = photos.map(photo => {
          const isLiked = likedPhotos.includes(photo.id);
          return `
            <div class="image-container">
              <img src=${photo.urls.small} alt="Artwork" />
              <button class="like-btn" data-photo-id="${photo.id}" data-liked="${isLiked}">${isLiked ? 'Unlike' : 'Like'}</button>
            </div>
          `;
        });

        main.innerHTML = getUrls.join('');
        addLikeButtonListeners();
      }
    })
  }

  function addLikeButtonListeners() {
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
      button.addEventListener('click', toggleLike);
    });
  }

  function toggleLike(event) {
    const button = event.target;
    const photoId = button.dataset.photoId;
    const isLiked = button.dataset.liked === 'true';

    if (!isLiked) {
      likedPhotos.push(photoId);
      button.textContent = 'Unlike';
      button.dataset.liked = 'true';
    } else {
      likedPhotos = likedPhotos.filter(id => id !== photoId);
      button.textContent = 'Like';
      button.dataset.liked = 'false';
    }

    renderFavorites();
  }


  async function renderFavorites() {
    const favoriteDetails = [];
  
    // Assume you have a function to fetch photo details from the Unsplash API
    async function fetchPhotoDetails(photoId) {
      const response = await unsplash.search.getPhotos({ 
        photoId : photoId});
      if (response.type === 'success') {
        return response.response;
      }
      return null;
    }
  
    // Fetch details for each liked photo asynchronously
    for (const photoId of likedPhotos) {
      const photoDetails = await fetchPhotoDetails(photoId);
      if (photoDetails) {
        favoriteDetails.push(photoDetails);
      }
    }
  
    // Generate HTML for each liked photo
    const favoriteUrls = favoriteDetails.map(photo => {
      return `
        <div class="favorite-item">
          <img src=${photo.urls.small} alt="Liked Artwork" />
          <p>${photo.description || 'No description available'}</p>
        </div>
      `;
    });
  
    // Update the Favorites container with the HTML
    favoritesContainer.innerHTML = favoriteUrls.join('');
  }
  

  const loadMoreBtn = document.querySelector('#load-more-btn');

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderGallery(currentCategory, currentPage);
  });
});
