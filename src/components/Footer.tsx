import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-4 text-center border-t bg-white">
      <p>&copy; {new Date().getFullYear()} Dakheliyah LK. All rights reserved.</p>
    </footer>
  );
};

export default Footer;