import "@aws-amplify/ui-react/styles.css";
import { Authenticator, Button } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import Box from "@mui/material/Box";
import SearchBar from "./Components/SearchBar";
import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

Amplify.configure(awsconfig);

const SignOutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.light,
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
  },
}));

function App({ signOut }) {
  return (
    <ThemeProvider theme={theme}>
      <Authenticator key="auth">
        {({ signOut, user }) => (
          <div className="App">
            <Box className="signout">
              <SignOutButton variation="link" size="medium" onClick={signOut}>
                Sign Out
              </SignOutButton>
            </Box>
            <SearchBar />
          </div>
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;
