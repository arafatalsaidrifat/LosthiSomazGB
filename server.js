const socket = io();

const membersUl = document.getElementById('members-ul');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const emojiBtn = document.getElementById('emoji-btn');
const imageUpload = document.getElementById('image-upload');

let nickname = '';

// Auto-generate a nickname immediately and emit it
function generateNickname() {
  const adjectives = ['বুদ্ধিমান', 'মজাদার', 'সাহসী', 'দয়ালু', 'দক্ষ'];
  const animals = ['হাতি', 'বাঘ', 'ময়ূর', 'শিয়াল', 'হরিণ'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adj}_${animal}_${number}`;
}

nickname = generateNickname();
socket.emit('set nickname', nickname);

// Helper to format timestamp (Bangla locale)
function getTimeStamp() {
  const now = new Date();
  return now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
}

// Check if string is image (base64 or URL)
function isImage(str) {
  return str.startsWith('data:image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(str);
}

// Add a message to chat window
function addMessage({ nickname: sender, message, system = false, self = false, timestamp = null }) {
  const div = document.createElement('div');
  div.classList.add('message');

  if (system) {
    div.classList.add('system');
    div.textContent = message;
  } else {
    div.classList.add(self ? 'self' : 'other');

    // Build message content with sender name and timestamp
    let content = `<strong>${sender}</strong> `;
    if (timestamp) {
      content += `<small style="opacity:0.6; font-size: 0.8rem;">[${timestamp}]</small><br>`;
    } else {
      content += '<br>';
    }

    if (isImage(message)) {
      content += `<img src="${message}" alt="Sent Image" />`;
    } else {
      // Escape text to prevent HTML injection
      content += escapeHTML(message);
    }

    div.innerHTML = content;
  }

  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Update live members list
function updateMembers(members) {
  membersUl.innerHTML = '';
  members.forEach(m => {
    const li = document.createElement('li');
    li.textContent = m;
    membersUl.appendChild(li);
  });
}

// Handle chat form submission
chatForm.onsubmit = (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;

  socket.emit('chat message', msg);
  addMessage({ nickname, message: msg, self: true, timestamp: getTimeStamp() });
  chatInput.value = '';
};

// Emoji button appends emoji and focuses input
emojiBtn.onclick = () => {
  chatInput.value += '😊';
  chatInput.focus();
};

// Handle image upload
imageUpload.onchange = () => {
  const file = imageUpload.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('ছবি ফাইল নির্বাচন করুন');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imageData = reader.result;
    socket.emit('chat message', imageData);
    addMessage({ nickname, message: imageData, self: true, timestamp: getTimeStamp() });
  };
  reader.readAsDataURL(file);
  imageUpload.value = '';
};

// Listen for chat messages from server
socket.on('chat message', ({ nickname: sender, message }) => {
  if (sender === nickname) return; // Avoid duplicates for self messages
  addMessage({ nickname: sender, message, timestamp: getTimeStamp() });
});

// Listen for system messages
socket.on('system message', (msg) => {
  addMessage({ message: msg, system: true });
});

// Update user list live
socket.on('update users', (members) => {
  updateMembers(members);
});

// Optional: Typing indicator logic
let typingTimeout;
let isTyping = false;

chatInput.addEventListener('input', () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing', true);
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit('typing', false);
  }, 1000);
});

const typingIndicator = document.createElement('div');
typingIndicator.classList.add('system');
typingIndicator.style.fontStyle = 'italic';
typingIndicator.style.opacity = '0.7';
typingIndicator.textContent = '';

chatWindow.parentElement.appendChild(typingIndicator);

socket.on('typing', (typingUsers) => {
  // Remove own nickname
  const othersTyping = typingUsers.filter(user => user !== nickname);
  if (othersTyping.length === 0) {
    typingIndicator.textContent = '';
  } else if (othersTyping.length === 1) {
    typingIndicator.textContent = `${othersTyping[0]} লিখছে...`;
  } else {
    typingIndicator.textContent = `${othersTyping.join(', ')} লিখছে...`;
  }
});
