import React from 'react';
import { Sparkles, Truck, Gift } from 'lucide-react';

export const AnnouncementBar = () => {
  return (
    <div className="announcement-bar d-flex justify-content-center align-items-center flex-wrap gap-3">
      <div className="d-flex align-items-center gap-1">
        <Sparkles size={14} className="text-warning" />
        <span>Use code <strong>TOYJOY10</strong> for 10% OFF!</span>
      </div>
      <span className="d-none d-md-inline opacity-75">|</span>
      <div className="d-flex align-items-center gap-1">
        <Truck size={14} />
        <span><strong>FREE Shipping</strong> on orders above ₹999</span>
      </div>
      <span className="d-none d-lg-inline opacity-75">|</span>
      <div className="d-none d-lg-flex align-items-center gap-1">
        <Gift size={14} className="text-warning" />
        <span>Safe & Non-Toxic Certified Toys</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
