import React from 'react';
import '../../assets/scss/account.scss';
import Sidebar from '../../assets/components/sidebar.tsx';

const AccountPage: React.FC = (): React.JSX.Element => {
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
                <button>Logout</button>
                <button id="delete">Delete Account</button>
            </div>
        </div>
    </section>
  );
};

export default AccountPage;