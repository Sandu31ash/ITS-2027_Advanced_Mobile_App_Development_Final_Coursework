import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import * as Font from 'expo-font';

interface AppLoadingProps {
  children: React.ReactNode;
}

const loadFonts = async () => {

};

const AppLoadingComponent: React.FC<AppLoadingProps> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>; // Placeholder for loading indicator
  }

  return <>{children}</>;
};

export default AppLoadingComponent;
