/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Islamic theme
        primary: {
          50: '#f0f9f1',
          100: '#dcf2de',
          500: '#2D5D31', // Deep Islamic green
          600: '#1f4124',
          700: '#1a351e',
          800: '#152a18',
          900: '#0f1f11'
        },
        secondary: {
          500: '#4A7C59', // Medium green
          600: '#3d6549'
        },
        accent: {
          gold: '#D4AF37', // Islamic gold
          lightGold: '#F4E4BC' // Soft gold
        },
        status: {
          success: '#10B981', // Onboard status
          warning: '#F59E0B', // Pending/scanning
          error: '#EF4444', // Error/offboard
          neutral: '#6B7280' // Inactive states
        },
        background: {
          primary: '#FFFFFF', // Main background
          secondary: '#F9FAFB', // Card backgrounds
          modal: 'rgba(0,0,0,0.5)' // Modal overlay
        }
      },
      fontFamily: {
        cairo: ['Cairo_400Regular', 'Cairo_500Medium', 'Cairo_600SemiBold', 'Cairo_700Bold'],
      },
      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem',  // 352px
      },
      borderRadius: {
        'xl': '12px',
      },
      animation: {
        'ripple': 'ripple 0.6s linear',
        'confetti': 'confetti 0.8s ease-out',
        'glow': 'glow 1s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out'
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(4)', opacity: '0' }
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotateZ(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotateZ(180deg)', opacity: '0' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(45, 93, 49, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(45, 93, 49, 0.8)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}

