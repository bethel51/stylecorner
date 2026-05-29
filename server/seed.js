fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        firstname: 'Julian',
        lastname: 'Reed',
        email: 'julian@stylecorner.com',
        role: 'staff',
        specialties: ['Hair Cut', 'Braids']
    })
}).then(r => r.json()).then(console.log).catch(console.error);
