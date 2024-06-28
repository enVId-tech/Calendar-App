import React from 'react';
import '../../assets/scss/account.scss';
import Sidebar from '../../assets/components/sidebar.tsx';

const AccountPage: React.FC = (): React.JSX.Element => {
    const logout = async () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split("=")[1]
                })
            }

            const response = await fetch('/api/post/logout', dataJson);
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

    const deleteAccount = async () => {
        try {
            const dataJson = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    "userId": document.cookie.split("=")[1]
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

    return (
        <section id='account'>
            <Sidebar />
            <div id='container'>
                <h1>Account</h1>
                <div id='info'>
                    <h2>Username: Erick Tran</h2>
                    <h2>Email: thelittlebotengineer@gmail.com</h2>
                    <input type='password' placeholder='Password' />
                    <input type='password' placeholder='Confirm Password' />
                    <button>Update</button>
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