import { unsplash } from './unsplash';
import getImageDetails from './getImageDetails';
import displayImageDetails from './displayImageDetails';

document.addEventListener('DOMContentLoaded', () => {

  const main = document.querySelector('.container');
  const homeLink = document.querySelector('.home');
  const exploreHomeButton = document.getElementById('explore-home');
  

  let currentPage = 1;
  let currentCategory = '';
  let likedImages = JSON.parse(localStorage.getItem('likedImages')) || [];

 


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
    renderGallery('', 1);
  });
   renderGallery('', 1);

  function renderGallery(category, page) {
    const prevNextContainer = document.querySelector('.prev-next');
    if (category === '') {
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
      </div>
      <div class="about-images">
      <img src="https://media.gettyimages.com/id/1318837401/photo/paris-france-a-visitor-photographs-the-painting-la-joconde-the-mona-lisa-by-italian-artist.jpg?s=612x612&w=0&k=20&c=x1LLCFwZNP-QPVBl_ywYuVMnR3BlFFGAjNrWpyGHDXw=" />
      </div>
      
      </section>
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
      
      }
    });
  }

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
  
  button.innerHTML = isLiked ?   '&#129293;' : '&#10084;' ;
  button.dataset.liked = isLiked ? 'false' : 'true';

 
}


  function renderFavorites() {
    const favoriteDetails = [];

    
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

       
       Promise.all(fetchDetailsPromises).then(() => {
        
        const favoriteUrls = favoriteDetails.map((photo) => {
          return `
          <div class="favorite-item">
                    <img class="favorite-image" src=${photo.urls.small} alt="Liked Artwork" />
                    <p>${photo.alt_description || 'No description available'}</p>
                    <button class="remove-btn">Remove</button>
                  </div>`;
        });
  
        
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
    likedImages = likedImages.filter((id) => id !== photoId);
    const likeButton = document.querySelector(`.like-btn[data-photo-id="${photoId}"]`);
    
     
      if (likeButton) {
        likeButton.innerHTML = '&#129293;';
        likeButton.dataset.liked = 'false';
      }
      const favoriteItem = button.closest('.favorite-item');
      favoriteItem.remove();
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

  
});




const navMenu = document.querySelector('#navMenu');
const navToggle = document.querySelector('.nav-toggle');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});
const navLinks = document.querySelectorAll('.nav-link, .favorites ,.home');

  navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      
      navLinks.forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
      event.preventDefault();
    });
  });

