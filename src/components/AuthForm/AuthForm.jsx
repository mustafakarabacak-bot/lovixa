import { Box, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import GoogleAuth from "./GoogleAuth";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box maxW="400px" mx="auto">
      <Box border="1px solid gray" borderRadius={4} padding={5} mb={4}>
        <VStack spacing={4}>
          <Image src="/logo.png" h={24} cursor="pointer" alt="Lovixa Logo" />

          {isLogin ? <Login /> : <Signup />}

          {/* ---------------- OR -------------- */}
          <Flex alignItems="center" justifyContent="center" my={4} gap={1} w="full">
            <Box flex={2} h="1px" bg="gray.400" />
            <Text mx={1} color="white">
              OR
            </Text>
            <Box flex={2} h="1px" bg="gray.400" />
          </Flex>

          <GoogleAuth prefix={isLogin ? "Log in" : "Sign up"} />
        </VStack>
      </Box>

      <Box border="1px solid gray" borderRadius={4} padding={5}>
        <Flex alignItems="center" justifyContent="center">
          <Text mx={2} fontSize={14}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Text>
          <Text
            onClick={() => setIsLogin(!isLogin)}
            color="blue.500"
            cursor="pointer"
            fontWeight="semibold"
          >
            {isLogin ? "Sign up" : "Log in"}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default AuthForm;
