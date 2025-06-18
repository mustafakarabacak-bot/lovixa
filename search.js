document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
});

async function handleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = '';
  
  if (query.length < 2) {
    resultsContainer.style.display = 'none';
    return;
  }
  
  const usersRef = firebase.firestore().collection('users');
  const snapshot = await usersRef
    .where('keywords', 'array-contains', query)
    .limit(5)
    .get();
  
  if (snapshot.empty) {
    resultsContainer.innerHTML = '<div class="result-item">Sonuç bulunamadı</div>';
    resultsContainer.style.display = 'block';
    return;
  }
  
  snapshot.forEach(doc => {
    const user = doc.data();
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.innerHTML = `
      <img src="${user.photoURL || 'default-avatar.png'}" class="avatar">
      <span>${user.displayName}</span>
      <button class="follow-btn" data-uid="${user.uid}">Takip Et</button>
    `;
    resultItem.addEventListener('click', () => {
      window.location.href = `/profile.html?uid=${user.uid}`;
    });
    resultsContainer.appendChild(resultItem);
  });
  
  resultsContainer.style.display = 'block';
  
  // Takip butonları için event listener
  document.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const uid = btn.dataset.uid;
      toggleFollow(uid);
    });
  });
}

function toggleFollow(uid) {
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  const userRef = firebase.firestore().collection('users').doc(user.uid);
  userRef.update({
    following: firebase.firestore.FieldValue.arrayUnion(uid)
  });
}