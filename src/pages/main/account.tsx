import React from 'react';
import '../../assets/scss/account.scss';
import Sidebar from '../../assets/components/sidebar';

const AccountPage: React.FC = (): React.JSX.Element => {
  return (
    <section id='account'>
        <Sidebar />
    </section>
  );
};

export default AccountPage;