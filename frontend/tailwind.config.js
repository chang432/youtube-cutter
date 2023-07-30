/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                primary: ["VT323", "monospace"],
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["lofi", "black"],
    },
};
