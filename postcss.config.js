import tailwindcssNesting from '@tailwindcss/nesting'
import tailwind from 'tailwindcss'

export default {
  plugins: [
    tailwindcssNesting,
    tailwind({
      content: ['./docs/.vitepress/theme/**/*.vue'],
      plugins: []
    })

  ]
}
