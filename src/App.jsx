import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import HomePage from "./pages/HomePage/HomePage.jsx";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import PageLayout from "./Layout/PageLayout/PageLayout.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase.js";

// Chakra UI teması (mobil uyumlu, koyu tema)
const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontSize: { base: "12px", md: "14px" },
        borderRadius: "md",
      },
    },
    Input: {
      baseStyle: {
        field: {
          fontSize: { base: "12px", md: "14px" },
          bg: "gray.700",
          color: "white",
          _placeholder: { color: "gray.400" },
        },
      },
    },
  },
  breakpoints: {
    base: "0px",
    sm: "320px",
    md: "480px",
    lg: "768px",
  },
});

function App() {
  const [authUser] = useAuthState(auth);

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <PageLayout>
          <Routes>
            <Route
              path="/"
              element={authUser ? <HomePage /> : <Navigate to="/auth" />}
            />
            <Route
              path="/auth"
              element={!authUser ? <AuthPage /> : <Navigate to="/" />}
            />
            <Route path="/:username" element={<ProfilePage />} />
          </Routes>
        </PageLayout>
      </Router>
    </ChakraProvider>
  );
}

export default App;
