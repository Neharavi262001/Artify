import {createApi} from 'unsplash-js'
let  accessKey= 'E3A9y0TjAU1tClEJeY0eKDgMz9cxNrpFs6nLpsfsIm8'
const unsplash = createApi({
  accessKey:accessKey
});



document.addEventListener('DOMContentLoaded', () => {

  const main = document.querySelector('.container');
  

  let currentPage = 1;
  let currentCategory = '';
  let likedImages = JSON.parse(localStorage.getItem('likedImages')) || [];

  const homeLink = document.querySelector('.home');
  
  const exploreHomeButton = document.getElementById('explore-home');


  const navLinks = document.querySelectorAll(".nav-link");
  const favorites = document.querySelector('.favorites');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const selectedCategory = link.dataset.category;
      renderGallery(selectedCategory);
      currentCategory = selectedCategory;
      console.log(selectedCategory);
    });
  });
  favorites.addEventListener('click', renderFavorites);

 

  homeLink.addEventListener('click', function (event) {
    event.preventDefault();
    renderGallery('', 1); // Pass an empty category to render the home section
  });
   // Default rendering on page load
   renderGallery('', 1);

  function renderGallery(category, page) {
    const prevNextContainer = document.querySelector('.prev-next');
    if (category === '') {
      // Clear the main container for the home section

      
      const homeContent=`
      
      <div id="home-section" >
      
      <h1>Welcome to Artify!</h1> 
      <p>Discover and explore a world of art.</p>
      <a href='#about' id="explore-home">Explore</a>
      </div>

      <section id='about' class="about-section">
      <div class="about-text">
      <h2>About Artify</h2>
      <p>Artify is a platform that celebrates creativity and artistic expression. We showcase a diverse range of artworks, from modern abstracts to classical masterpieces.</p>

      <h2>Upcoming Events</h2>
      <p>Stay tuned for our upcoming exhibitions, workshops, and special events. Join us for an immersive art experience!</p>
      </section>
      </div>
      <div class="about-images">
      <img />
      </div>
      

      <section class="contact">
                <h2>Contact Us</h2>
                <p>Have questions or want to get in touch? Feel free to reach out to us. We would love to hear from you!</p>
                <p>&#128386   abc@gmail.com</p>
                <p> &#128382; +9196xxxxxxx</p>
            </section>
      

      `
    main.innerHTML = homeContent
     ;
      prevNextContainer.style.display = 'none';
      return;
    }
    prevNextContainer.style.display = 'flex'; 

    unsplash.search
    .getPhotos({
      query: category,
      page: page,
      perPage: 12,
      orientation: 'landscape'
    })
    .then(result => {
      if (result.type === 'success') {
        const photos = result.response.results;
        console.log(photos);
        const getUrls = photos.map(photo => {
          const isLiked=likedImages.includes(photo.id)
          return ` <div data-id=${photo.id} class="image-container">
          <img class='imageButton' src=${photo.urls.small} alt="Artwork" />
          <div class='image-description'>
          <button class="like-btn" data-photo-id="${photo.id}" data-liked="${isLiked}">${isLiked ? '&#10084;' :'&#129293;'  }</button>
          <p>${photo.alt_description}</p>
          
          </div>
         
        </div>`;
        });
        main.innerHTML = getUrls.join('');

        
        addLikeButtonListeners();
        const imageButton = document.querySelector('.imageButton');

        imageButton.addEventListener('click', displayImageDetails);

        // if (main.innerHTML === '') {
        //   // Render home section if the main container is empty
        //   main.innerHTML = '<h1>Welcome to Artify!</h1><p>Discover and explore a world of art.</p>';
        // }
      
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

  main.addEventListener('click', async (e) => {
    if (e.target.tagName === 'IMG') {
      const imageId = e.target.parentElement.getAttribute('data-id');
      const imageDetails = await getImageDetails(imageId);
      displayImageDetails(imageDetails);
    }
  });

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
  localStorage.setItem('likedImages', JSON.stringify(likedImages));
  // Toggle the button text content and dataset
  button.innerHTML = isLiked ?   '&#129293;' : '&#10084;' ;
  button.dataset.liked = isLiked ? 'false' : 'true';

  //renderFavorites();
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
          return `
          <div class="favorite-item">
                    <img class="favorite-image" src=${photo.urls.small} alt="Liked Artwork" />
                    <p>${photo.alt_description || 'No description available'}</p>
                    <button class="remove-btn">Remove</button>
                  </div>`;
        });
  
        // Update the Favorites container with the HTML
        main.innerHTML = favoriteUrls.join('');


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
        likeButton.innerHTML = '&#129293;';
        likeButton.dataset.liked = 'false';
      }
    
      // Remove the favorite item from the DOM
      const favoriteItem = button.closest('.favorite-item');
      favoriteItem.remove();
    
      // Re-render the favorites section
      renderFavorites();
    }
    



  const loadMoreBtn = document.querySelector('#show-more-btn');

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderGallery(currentCategory, currentPage);
  });

  const LoadlessBtn=document.querySelector('#show-less-btn');
  LoadlessBtn.addEventListener('click',()=>{
    if (currentPage > 1){
      currentPage--;
      renderGallery(currentCategory, currentPage);
    }
    
  })

  //renderGallery('Home');
});



async function getImageDetails(imageId) {
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

function displayImageDetails(imageDetails) {
  const modal = document.getElementById('modalContent');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalContent = `
  <a href="${imageDetails.imageUrl}" target="_blank">
  <img src="${imageDetails.imageUrl}" alt="${imageDetails.title}" title="Click to see full image">
</a>
  <h3>${imageDetails.title.toUpperCase()}</h3>
  <p>${imageDetails.description || 'No description available'}</p>
  <p>Artist : ${imageDetails.author.first_name}</p>
  <p>Updated at : ${imageDetails.author.updated_at}</p>
  <a href='${imageDetails.author.links.html}' target="_blank">See more</a>
  
`
;
console.log(imageDetails)
  modal.innerHTML = modalContent;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('modal').style.display = 'block';

  closeModalBtn.addEventListener('click', () => {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
  });
  // main.appendChild(card);
}





const navMenu = document.querySelector('#navMenu');
const navToggle = document.querySelector('.nav-toggle');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});


document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.nav-link, .favorites ,.home');

  navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      // Remove the 'active' class from all links
      navLinks.forEach(link => {
        link.classList.remove('active');
      });

      // Add the 'active' class to the clicked link
      this.classList.add('active');

      // Prevent the default behavior of the link (e.g., page reload)
      event.preventDefault();
    });
  });
});