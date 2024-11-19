const baseUrl = 'http://localhost:5000/api/v1/auth';

function signUp(userData: any) {
    return fetch(`${baseUrl}/signUp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            image: userData.picture,
            userId: userData.userId,
            // Replace or handle securely
        }),
    });
}

export { signUp };

