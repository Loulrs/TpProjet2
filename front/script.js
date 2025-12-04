document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login: username, password: password })
        });
        
        if (!response.ok) {
            messageDiv.textContent = `Erreur serveur : ${response.status} (${response.statusText})`;
            return;
        }
        
        let result;
        try {
            result = await response.json();
        } catch (jsonErr) {
            messageDiv.textContent = "La réponse du serveur n'est pas du JSON.";
            return;
        }
        
        if (result.success) {
            messageDiv.textContent = 'Connexion réussie ! Redirection...';
            window.location.href = '/front/Reussite.html';
        } else {
            messageDiv.textContent = 'Identifiants invalides.';
        }
        
    } catch (err) {
        messageDiv.textContent = `Erreur de connexion : ${err}`;
    }
});