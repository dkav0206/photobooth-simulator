import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import { Container } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 992,
        lg: 1200,
        xl: 1536,
      },
    },
  });

export const SkeletonHome = () => { 
    return (
        <Box className='mui-box-skeleton'> 
            
        </Box>
    )
}