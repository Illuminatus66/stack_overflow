import * as React from "react";
import { Link } from "react-router-dom";
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import "./Users.css";

const customTheme = createTheme({
  palette: {
    primary: {
      main: deepPurple[500],
    },
    secondary: {
      main: deepPurple[700],
    },
  },
});

const StyledAvatar = styled(Avatar)`
  ${({ theme }) => `
  cursor: pointer;
  background-color: ${theme.palette.primary.main};
  transition: ${theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.standard,
  })};
  &:hover {
    background-color: ${theme.palette.secondary.main};
    transform: scale(1.3);
  }
  `}
`;

const User = ({ user }) => {
  return (
    <Link to={`/Users/${user._id}`} className="user-profile-link">
      <ThemeProvider theme={customTheme}>
        <StyledAvatar><h3>{user.name.charAt(0).toUpperCase()}</h3></StyledAvatar>
      </ThemeProvider>
      <h5>{user.name}</h5>
    </Link>
  );
};

export default User;
