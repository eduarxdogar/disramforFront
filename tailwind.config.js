/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
      extend: {
      colors: {
        'drf-blue': '#0D47A1', // Azul oscuro de la marca
        'drf-gold': '#FFD700', // Dorado/Amarillo de acento
        'drf-gray': '#F5F5F5', // Gris claro para fondos
      },
  },
  plugins: [],
}


}


