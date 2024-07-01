/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import '../../assets/scss/account.scss';
import Sidebar from '../../assets/components/sidebar.tsx';
import { UserData } from '../../assets/ts/interfaces.ts';
import getUserData from '../../assets/ts/getUserData.ts';

const AccountPage: React.FC = (): React.JSX.Element => {
    const [data, setData] = React.useState<UserData | null | undefined>();

    const passwordRef = React.useRef<HTMLInputElement>(null);
    const confirmPasswordRef = React.useRef<HTMLInputElement>(null);

    const getData = async () => {
        try {
            const userId: string | null = document.cookie.split(';')[1].split('=')[1];

            const userData: UserData[] | undefined | null = await getUserData(userId);

            if (!userData) {
                window.location.href = '/login';
                return;
            }

            setData(userData[0]);
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    const logout = async () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split(";")[1].split("=")[1]
                }),
            }

            const response = await fetch('/api/credentials/logout', dataJson);
            const data = await response.json();

            if (data.error) {
                console.error(data.error);
            } else {
                console.log(data.message);
                window.location.href = '/login';
            }
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    const deleteAccount = async () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split(";")[1].split("=")[1]
                })
            }

            const response = await fetch('/api/post/delete', dataJson);
            const data = await response.json();

            if (data.error) {
                console.error(data.error);
            } else {
                console.log(data.message);
            }
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    const setPassword = async () => {
        try {
            const password: string = passwordRef.current?.value as string;
            const confirmPassword: string = confirmPasswordRef.current?.value as string;

            if (password === "" || confirmPassword === "") {
                alert('Please fill out all fields');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split(";")[1].split("=")[1],
                    "password": password
                })
            }

            const response = await fetch('/api/post/password', dataJson);
            const data = await response.json();

            if (data.error) {
                console.error(data.error);
            } else {
                console.log(data.message);
            }
        } catch (error: unknown) {
            console.error('Error:', error as string);
        }
    }

    React.useEffect(() => {
        getData();

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                setPassword();
            }
        });
    }, []);

    return (
        <section id='account'>
            <Sidebar />
            <div id='container'>
                <h1>Account</h1>
                <div id='info'>
                    <h2>Username: {data?.displayName}</h2>
                    <h2>Email: {data?.email}</h2>
                    <input type='password' placeholder='Password' ref={passwordRef} />
                    <input type='password' placeholder='Confirm Password' ref={confirmPasswordRef} />
                    <button onClick={() => setPassword()}>Change Password</button>
                </div>

                <div id="other">
                    <h1 id="main">Other</h1>
                    <button onClick={() => logout()}>Logout</button>
                    <button id="delete" onClick={() => deleteAccount()}>Delete Account</button>
                </div>
            </div>
        </section>
    );
};

export default AccountPage;