'use client';

import React from 'react';
import {
  Trash2,
  Truck,
  Droplets,
  Waves,
  Lightbulb,
  Bath,
  Footprints,
  AlertTriangle,
  ShieldAlert,
  PawPrint,
  Trees,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Trash2':
      return <Trash2 {...props} />;
    case 'Truck':
      return <Truck {...props} />;
    case 'Droplets':
      return <Droplets {...props} />;
    case 'Waves':
      return <Waves {...props} />;
    case 'Lightbulb':
      return <Lightbulb {...props} />;
    case 'Bath':
      return <Bath {...props} />;
    case 'Footprints':
      return <Footprints {...props} />;
    case 'AlertTriangle':
      return <AlertTriangle {...props} />;
    case 'ShieldAlert':
      return <ShieldAlert {...props} />;
    case 'PawPrint':
      return <PawPrint {...props} />;
    case 'Trees':
      return <Trees {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};
