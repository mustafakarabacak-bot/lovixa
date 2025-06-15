import { Box, Flex, Image, Text, VStack } from "@chakra-ui/react";
import GoogleAuth from "./GoogleAuth";

const AuthForm = () => {
  return (
    <Box maxW="400px" mx="auto" mt={10}>
      <Box border="1px solid gray" borderRadius={4} padding={5} mb={4}>
        <VStack spacing={4}>
          <Image 
            src="/logo.png" 
            h={24} 
            alt="Lovixa Logo"
            mx="auto"
          />
          
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Lovixa'ya Hoş Geldiniz
          </Text>
          
          <GoogleAuth prefix="Continue with" />
          
          <Text fontSize="sm" color="gray.400" mt={4} textAlign="center">
            Google hesabınızla giriş yaparak hizmet şartlarımızı ve gizlilik politikamızı kabul etmiş olursunuz.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default AuthForm;
