import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Custom hook for handling base path in GitHub Pages
export const useBaseLocation = () => {
  const [location, setLocation] = useLocation();
  const base = '/vi2';
  
  // Remove base path from location for internal routing
  const normalizedLocation = location.startsWith(base) 
    ? location.slice(base.length) || '/' 
    : location;
  
  // Add base path when setting location
  const setBaseLocation = (to: string) => {
    const newLocation = to === '/' ? base : `${base}${to}`;
    setLocation(newLocation);
  };
  
  return [normalizedLocation, setBaseLocation] as const;
};