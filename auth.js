// auth.js

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  // SIGN UP
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // Save to localStorage (very basic; not secure)
      localStorage.setItem('user', JSON.stringify({ username, password }));

      alert('Sign up successful! Please log in.');
      window.location.href = 'login.html';
    });
  }

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser && storedUser.username === username && storedUser.password === password) {
        alert('Login successful!');
        window.location.href = 'recipe_finder.html';
      } else {
        alert('Incorrect username or password.');
      }
    });
  }
});
