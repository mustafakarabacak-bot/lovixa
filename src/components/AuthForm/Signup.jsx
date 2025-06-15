import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { useState } from "react";
import useSignUpWithEmailAndPassword from "../../hooks/useSignUpWithEmailAndPassword";

const Signup = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, signup } = useSignUpWithEmailAndPassword();

  return (
    <VStack spacing={4}>
      <Input
        placeholder="E-posta"
        fontSize={{ base: 12, md: 14 }}
        type="email"
        size="sm"
        value={inputs.email}
        onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
        bg="gray.700"
        color="white"
        _placeholder={{ color: "gray.400" }}
      />
      <Input
        placeholder="Kullanıcı Adı"
        fontSize={{ base: 12, md: 14 }}
        type="text"
        size="sm"
        value={inputs.username}
        onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
        bg="gray.700"
        color="white"
        _placeholder={{ color: "gray.400" }}
      />
      <Input
        placeholder="Tam Ad"
        fontSize={{ base: 12, md: 14 }}
        type="text"
        size="sm"
        value={inputs.fullName}
        onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
        bg="gray.700"
        color="white"
        _placeholder={{ color: "gray.400" }}
      />
      <InputGroup>
        <Input
          placeholder="Şifre"
          fontSize={{ base: 12, md: 14 }}
          type={showPassword ? "text" : "password"}
          value={inputs.password}
          size="sm"
          onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
          bg="gray.700"
          color="white"
          _placeholder={{ color: "gray.400" }}
        />
        <InputRightElement h="full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <ViewIcon color="gray.400" /> : <ViewOffIcon color="gray.400" />}
          </Button>
        </InputRightElement>
      </InputGroup>
      {error && (
        <Alert status="error" fontSize={{ base: 12, md: 13 }} p={2} borderRadius="md">
          <AlertIcon fontSize={12} />
          {error.message}
        </Alert>
      )}
      <Button
        w="full"
        colorScheme="blue"
        size="sm"
        fontSize={{ base: 12, md: 14 }}
        isLoading={loading}
        onClick={() => signup(inputs)}
      >
        Kayıt Ol
      </Button>
    </VStack>
  );
};

export default Signup;
