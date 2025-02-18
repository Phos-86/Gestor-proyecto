let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
    console.log('beforeinstallprompt event fired');
    event.preventDefault();
    deferredPrompt = event;

    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';

        installButton.addEventListener('click', () => {
            console.log('Install button clicked');
            if (deferredPrompt) {
                deferredPrompt.prompt();

                deferredPrompt.userChoice.then((choice) => {
                    if (choice.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
            }
        });
    }
});

window.addEventListener('appinstalled', (event) => {
    console.log('App installed successfully');
    deferredPrompt = null;
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'none';
    }
});
