
import { useState, useEffect } from 'react'

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar se há preferência salva no localStorage
    const saved = localStorage.getItem('darkMode')
    if (saved) {
      return JSON.parse(saved)
    }
    // Se não há preferência salva, usar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Aplicar ou remover a classe 'dark' no elemento html
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Salvar preferência no localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return { isDarkMode, toggleDarkMode }
}
