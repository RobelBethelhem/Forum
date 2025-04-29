import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatBotFAB from './ChatBotFAB';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    <Footer />
    <ChatBotFAB />
  </div>
);

export default Layout;
