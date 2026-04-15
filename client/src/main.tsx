import { createTheme, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/en-gb'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const theme = createTheme({
  // palette: {
  //   mode: 'dark',
  // },
  typography: {
    h1: {
      fontSize: '2.4rem',
      fontWeight: 'bold',
      lineHeight: '1.1',
    },
    h3: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      lineHeight: '1.1',
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
      fontSize: '0.8rem',
      fontWeight: 'bold',
      lineHeight: '1.1',
    },
    subtitle2: {
      fontSize: '0.6rem',
      fontWeight: '100',
      lineHeight: '1.1',
    },
  },
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: { fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 8px' },
      },
    },
  },
  // components: {
  //   MuiSelect: {
  //     styleOverrides: {
  //       select: {
  //         fontSize: '0.8rem',
  //         fontWeight: 'bold',
  //         padding: 0,
  //       },
  //     },
  //   },
  // },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <LocalizationProvider adapterLocale='en-gb' dateAdapter={AdapterDayjs}>
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
)
