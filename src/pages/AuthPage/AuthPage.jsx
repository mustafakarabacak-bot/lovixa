import { Flex, Container, VStack, Box, Image, Text, Heading } from "@chakra-ui/react";
import AuthForm from "../../components/AuthForm/AuthForm";

const AuthPage = () => {
  return (
    <Flex minH="100vh" bg="black" color="white" justify="center" align="center" px={4}>
      <Container maxW="container.md" p={0}>
        <Flex justify="center" align="center" gap={10} direction={{ base: "column", md: "row" }}>
          {/* Sol: Logo ve Slogan */}
          <VStack align="center" spacing={4} display={{ base: "none", md: "flex" }}>
            <Image src="/icons/icon-192.png" boxSize="120px" alt="Lovixa logo" />
            <Heading size="lg" fontWeight="bold">LOVIXA</Heading>
            <Text fontSize="md" color="gray.400" px={6} textAlign="center">
              Sosyal keşif yeniden tanımlanıyor. Şimdi katıl.
            </Text>
          </VStack>

          {/* Sağ: Giriş Formu */}
          <VStack spacing={6} align="stretch" w="full" maxW="md">
            <AuthForm />
            <Text textAlign="center" fontSize="sm" color="gray.400">
              Mobil uygulamamız yakında yayınlanacak.
            </Text>
            <Flex gap={5} justify="center">
              <Image src="/playstore.png" h="10" alt="Playstore logo" />
              <Image src="/microsoft.png" h="10" alt="Microsoft logo" />
            </Flex>
          </VStack>
        </Flex>
      </Container>
    </Flex>
  );
};

export default AuthPage;
