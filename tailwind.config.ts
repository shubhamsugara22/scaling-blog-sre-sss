import type { Config } from 'tailwindcss'


const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}'
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#0ea5e9'
                    }
                }
            }
        },
    plugins: []
}
export default config