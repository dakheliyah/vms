import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-4 text-center border-t">
      <p>&copy; {new Date().getFullYear()} VMS. All rights reserved.</p>
    </footer>
  );
};

export default Footer;