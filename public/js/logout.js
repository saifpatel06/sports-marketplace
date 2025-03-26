function handleLogout() {
    localStorage.removeItem('token');
    alert('Logout successful');
    window.location.href = '/account.html';
}

async function getProfile () {
    var token = localStorage.getItem('token');

    const response = await fetch("/api/auth/profile",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: {
            token
        }
    }) 
    
    console.log(response)
}

getProfile()

document.getElementById('logout-button')?.addEventListener('click', handleLogout);