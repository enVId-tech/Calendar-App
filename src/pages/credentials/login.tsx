import React from 'react';
import '../../assets/scss/login.scss';

const LoginPage: React.FC = (): React.JSX.Element => {
    const username = React.useRef<HTMLInputElement>(null);
    const password = React.useRef<HTMLInputElement>(null);

    const loginToAccount = async (): Promise<void> => {
        const jsonData: object = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "username": username.current!.value,
                "password": password.current!.value
            })
        }

        try {
            const response = await fetch('/api/login', jsonData);
            const data = await response.json();

            if (data.status === 200) {
                console.log('Login successful!');
                window.location.href = '/';
            } else {
                console.error('Login failed:', data.message);
            }
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    };

    return (
        <section id="login">
            <div id="container">
                <div id="regLogin">
                    <h1>Login</h1>

                    <input type="text" placeholder="Username" ref={username} />
                    <input type="password" placeholder="Password" ref={password} />

                    <button type="submit" onClick={() => loginToAccount()}>Login</button>

                    <hr />

                    <a href='http://localhost:3001/auth/google' className="googlesignin"><span className="fa fa-google" />Register/Sign In with Google</a>
                </div>
            </div>
        </section>
    )
}

export default LoginPage;