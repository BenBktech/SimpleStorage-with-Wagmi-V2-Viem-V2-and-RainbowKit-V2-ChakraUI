'use client';
import {
    Alert,
    AlertIcon,
    Flex
} from '@chakra-ui/react'

const NotConnected = () => {
  return (
    <Flex w="100%" h="100%">
      <Alert status='warning'>
          <AlertIcon />
          Please connect your Wallet.
      </Alert>
    </Flex>
  )
}

export default NotConnected