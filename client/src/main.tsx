import { createTheme, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const theme = createTheme({
  // palette: {
  //   mode: 'dark',
  // },
  typography: {
    h3: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 'bold',
      lineHeight: '1.1',
    },
    h5: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      lineHeight: '1.1',
    },
    h6: {
      fontSize: '0.7rem',
      fontWeight: 'bold',
      lineHeight: '1.1',
    },
    subtitle2: {
      fontSize: '0.6rem',
      fontWeight: '100',
      lineHeight: '1.1',
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
