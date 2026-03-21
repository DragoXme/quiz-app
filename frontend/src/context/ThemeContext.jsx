import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

// Detect system preference
const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Resolve effective theme: 'system' → actual light/dark
const resolveTheme = (preference) =>
    preference === 'system' ? getSystemTheme() : preference;

export const ThemeProvider = ({ children }) => {
    // preference: 'light' | 'dark' | 'system'
    const [preference, setPreference] = useState(() => {
        return localStorage.getItem('themePreference') || 'system';
    });

    // effectiveTheme is what actually gets applied: always 'light' or 'dark'
    const [effectiveTheme, setEffectiveTheme] = useState(() =>
        resolveTheme(localStorage.getItem('themePreference') || 'system')
    );

    // Apply theme to document and track system changes
    useEffect(() => {
        const apply = () => {
            const resolved = resolveTheme(preference);
            setEffectiveTheme(resolved);
            document.documentElement.setAttribute('data-theme', resolved);
        };

        apply();
        localStorage.setItem('themePreference', preference);

        // If system mode, listen for OS theme changes
        if (preference === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            mq.addEventListener('change', apply);
            return () => mq.removeEventListener('change', apply);
        }
    }, [preference]);

    return (
        <ThemeContext.Provider value={{ theme: effectiveTheme, preference, setPreference }}>
            {children}
        </ThemeContext.Provider>
    );
};
