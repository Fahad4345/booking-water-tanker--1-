import { createContext, useContext } from 'react';

// Create the context
export const UserContext = createContext(null);

// Export a helper hook
export const useUser = () => useContext(UserContext);