function handleLogout() {
    localStorage.removeItem('token');
    alert('Logout successful');
    window.location.href = '/account.html';
}

document.getElementById('logout-button')?.addEventListener('click', handleLogout);