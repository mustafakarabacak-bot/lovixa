import { Flex, Container, VStack, Image, Box } from "@chakra-ui/react";
import AuthForm from "../../components/AuthForm/AuthForm";

const AuthPage = () => {
  return (
    <Flex minH="100vh" bg="gray.900" justify="center" align="center" px={4}>
      <Container maxW="md" p={0}>
        <VStack spacing={8} w="full" align="center">
          {/* Logo */}
          <Box textAlign="center" mb={8}>
            <Image
              src="/logo.png" // Sadece lo.png kullanılıyor
              boxSize="100px"
              alt="Lovixa"
              mx="auto"
            />
          </Box>

          {/* Giriş Formu */}
          <Box w="full" maxW="md">
            <AuthForm />
          </Box>
        </VStack>
      </Container>
    </Flex>
  );
};

export default AuthPage;
