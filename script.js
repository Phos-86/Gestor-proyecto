window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  const installPrompt = event;
  // Show a custom "Add to Home Screen" button
  const installButton = document.getElementById('install-button');
  installButton.style.display = 'block';
  installButton.addEventListener('click', () => {
    installPrompt.prompt();
    installPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      installButton.style.display = 'none';
    });
  });
});
