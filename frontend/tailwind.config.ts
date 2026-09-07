import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Carbon Design System Colors
      colors: {
        // Brand & Accent
        primary: '#0f62fe',
        'on-primary': '#ffffff',
        'blue-60': '#0043ce',
        'blue-80': '#002d9c',
        'blue-hover': '#0050e6',
        
        // Surface
        canvas: '#ffffff',
        'surface-1': '#f4f4f4',
        'surface-2': '#e0e0e0',
        hairline: '#e0e0e0',
        'hairline-strong': '#161616',
        
        // Inverse (Footer)
        'inverse-canvas': '#161616',
        'inverse-surface-1': '#262626',
        'inverse-ink': '#ffffff',
        'inverse-ink-muted': '#c6c6c6',
        
        // Text
        ink: '#161616',
        'ink-muted': '#525252',
        'ink-subtle': '#8c8c8c',
        
        // Semantic
        'semantic-success': '#24a148',
        'semantic-warning': '#f1c21b',
        'semantic-error': '#da1e28',
        'semantic-info': '#0f62fe',
      },
      
      // Carbon Typography - IBM Plex Sans
      fontFamily: {
        'plex-sans': ['IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      
      // Carbon Font Sizes (updated weights)
      fontSize: {
        'display-xl': ['76px', { lineHeight: '1.17', letterSpacing: '-0.5px', fontWeight: '400' }],
        'display-lg': ['60px', { lineHeight: '1.17', letterSpacing: '-0.4px', fontWeight: '400' }],
        'display-md': ['42px', { lineHeight: '1.20', letterSpacing: '0', fontWeight: '400' }],
        'headline': ['32px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '500' }],
        'card-title': ['24px', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '500' }],
        'subhead': ['20px', { lineHeight: '1.40', letterSpacing: '0', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.50', letterSpacing: '0', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.50', letterSpacing: '0.16px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.29', letterSpacing: '0.16px', fontWeight: '400' }],
        'body-emphasis': ['14px', { lineHeight: '1.29', letterSpacing: '0.16px', fontWeight: '600' }],
        'caption': ['12px', { lineHeight: '1.33', letterSpacing: '0.32px', fontWeight: '400' }],
        'button': ['14px', { lineHeight: '1.29', letterSpacing: '0.16px', fontWeight: '500' }],
        'eyebrow': ['14px', { lineHeight: '1.29', letterSpacing: '0.16px', fontWeight: '400' }],
      },
      
      // Carbon Font Weights (updated)
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
      },
      
      // Carbon Spacing (4px base unit)
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'section': '96px',
      },
      
      // Carbon Border Radius (default to 0px - flat design)
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'pill': '9999px',
        'full': '9999px',
        // Override default to 0px for Carbon
        'DEFAULT': '0px',
      },
      
      // Carbon Breakpoints
      screens: {
        'mobile': '320px',
        'tablet': '672px',
        'desktop': '1056px',
        'desktop-xl': '1312px',
        'max': '1584px',
      },
    },
  },
  plugins: [],
};

export default config;
