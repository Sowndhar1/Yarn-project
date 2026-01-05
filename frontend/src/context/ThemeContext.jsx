import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('yarn-theme');
        // Default to 'default' (original gradient)
        return savedTheme || 'default';
    });

    useEffect(() => {
        // Save to localStorage whenever theme changes
        localStorage.setItem('yarn-theme', theme);

        // Apply specific class to body for global background control
        if (theme === 'luxury') {
            document.body.classList.add('luxury-bg');
        } else {
            document.body.classList.remove('luxury-bg');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'default' ? 'luxury' : 'default');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
