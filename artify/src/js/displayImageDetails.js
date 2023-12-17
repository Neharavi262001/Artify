export default function displayImageDetails(imageDetails) {
    const modal = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalContent = `
    <a href="${imageDetails.imageUrl}" target="_blank">
    <img src="${imageDetails.imageUrl}" alt="${
      imageDetails.title
    }" title="Click to see full image">
  </a>
    <h3>${imageDetails.title.toUpperCase()}</h3>
    <p>${imageDetails.description || 'No description available'}</p>
    <p>Artist : ${imageDetails.author.first_name}</p>
    <p>Updated at : ${imageDetails.author.updated_at}</p>
    <a href='${imageDetails.author.links.html}' target="_blank">See more</a>
    
  `;
    console.log(imageDetails);
    modal.innerHTML = modalContent;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'block';
  
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('overlay').style.display = 'none';
      document.getElementById('modal').style.display = 'none';
    });
    
  }
  