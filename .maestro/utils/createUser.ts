// const createRandomUser = async () => {
// 	try {
// 		const user = output.randomUser;
        
// 		await http.post('https://mobile.rocket.chat/api/v1/users.register', {
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({
// 				username: user.username,
// 				name: user.name,
// 				pass: user.password,
// 				email: user.email
// 			})
// 		});

// 		return user;
// 	} catch (error) {
// 		console.log(JSON.stringify(error));
// 		throw new Error('Failed to create user');
// 	}
// };

// output.user = createRandomUser();

function createRandomUser() {
	const user = output.randomUser;
	
	http.post('https://mobile.rocket.chat/api/v1/users.register', {
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			username: user.username,
			name: user.name,
			pass: user.password,
			email: user.email
		})
	});

	return user;
}

output.user = createRandomUser();