console.log("লোুষ্ঠী সমাজ is live!");
gsap.from(".navbar-brand", {opacity: 0, y: -50, duration: 1});
gsap.from(".nav-link", {opacity: 0, x: -20, duration: 0.5, stagger: 0.2});
gsap.from("main h2", {opacity: 0, y: 20, duration: 1, delay: 0.5});
//for index.html
const toggler = document.querySelector('.navbar-toggler');
const collapseMenu = document.querySelector('#navbarNav');

toggler.addEventListener('click', () => {
  // Toggle the collapse
  collapseMenu.classList.toggle('show');
  
  // Animate hamburger icon
  toggler.classList.toggle('collapsed');
});
//Sticky navbar on scroll (optional JS)
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if(window.scrollY > 30) {
    navbar.classList.add('shadow-lg');
  } else {
    navbar.classList.remove('shadow-lg');
  }
});


const socket = io();
const nicknameSubmit = document.getElementById('nicknameSubmit');
const nicknameInput = document.getElementById('nicknameInput');
const nicknameModal = document.getElementById('nicknameModal');
const chatbox = document.getElementById('chatbox');

nicknameSubmit.onclick = () => {
  const val = nicknameInput.value.trim();
  if (val) {
    nickname = val;
    socket.emit('set nickname', nickname);
    nicknameModal.style.display = 'none';
    chatbox.style.display = 'block'; // show chatbox
  } else {
    alert('অনুগ্রহ করে নাম লিখুন');
  }
};

// Optional: listen for server events to update UI
socket.on('update users', (users) => {
  // update user list UI
});

socket.on('system message', (msg) => {
  // show system message in chatbox
});


