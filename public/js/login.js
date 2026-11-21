const form = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Connexion impossible');
    window.location.href = '/dashboard';
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
  }
});
