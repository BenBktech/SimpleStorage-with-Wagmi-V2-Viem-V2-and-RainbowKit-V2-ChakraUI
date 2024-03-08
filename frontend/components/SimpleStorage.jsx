// On utilise useState ou useEffect ou ChakraUI, donc on met un use client.
'use client'
import { useEffect, useState } from 'react'
import { Flex, Text, Input, Button, useToast, Heading, Spinner } from '@chakra-ui/react'

// On importe les données du contrat
import { contractAddress, contractAbi } from '@/constants'

// On importe les éléments de Wagmi qui vont nous permettre de :
/*
useReadContract : Lire les données d'un contrat
useAccount : Récupérer les données d'un compte connecté à la DApp via RainbowKit
useWriteContract : Ecrire des données dans un contrat
useWaitForTransactionReceipt : Attendre que la transaction soit confirmée (équivalent de transaction.wait() avec ethers)
useWatchContractEvent : Récupérer en temps réel si un évènement a été émis
*/
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'

import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react'

// Permet de parser l'event
import { parseAbiItem } from 'viem'
// On importe le publicClient créé (voir ce fichier pour avoir les commentaires sur ce que fait réellement ce publicClient)
import { publicClient } from '../utils/client'

const SimpleStorage = () => {
    // On récupère l'adresse connectée à la DApp
    const { address } = useAccount();

    // Un State pour stocker le nombre de l'input
    const [number, setNumber] = useState(null);
    // Un State pour stocker les events
    const [events, setEvents] = useState([])

    // Permet d'afficher des toasts (voir chakraUI)
    const toast = useToast();

    // Lis des données d'un contrat
    // data renommé en numberGet : le nombre sur la blockchain
    // error renommé en getError : Il y a-t-il une erreur lors de la lecture du nombre dans le contrat ?
    // isPending renommé en getIsPending : Pour savoir si on est en train de fetch le nombre
    // refetch (pas renommé) : Permet de rappeler par la suite cette fonction
    const { data: numberGet, error: getError, isPending: getIsPending, refetch } = useReadContract({
        // adresse du contrat
        address: contractAddress,
        // abi du contrat
        abi: contractAbi,
        // nom de la fonction dans le smart contract
        functionName: 'retrieve',
        // qui appelle la fonction ?
        account: address
    })

    // Permet d'écrire dans un contrat (et donc de faire une transaction)
    // data renommé en hash : le hash de la transaction
    // error (non renommé) : il y a t-il une erreur ?
    // isPending renommé en setIsPending : est-on en train d'écrire dans le contrat ?
    // writeContract : on pourra appeler cette fonction pour ensuite vraiment écrire dans le contrat plus tard
    const { data: hash, error, isPending: setIsPending, writeContract } = useWriteContract({
        mutation: {
            // Si ça a marché d'écrire dans le contrat
            onSuccess: () => {
                //Faire quelque chose ici si succès, par exemple un refetch
                refetch();
                getEvents();
                toast({
                    title: "Votre nombre a été inscrit dans la Blockchain",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            },
            // Si erreur
            onError: (error) => {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            },
        },
    });

    // Lorsque l'utilisateur clique sur le bouton set
    const setTheNumber = async() => {
        // alors on écrit vraiment dans le contrat intelligent (fonction store du contrat)
        writeContract({ 
            address: contractAddress, 
            abi: contractAbi,
            functionName: 'store', 
            args: [number], 
        }) 
    }

    // Equivalent de transaction.wait() en ethersjs, on récupère si la transaction est en train d'être intégré dans un bloc (isConfirming) et si ça a marché au final (isConfirmed), il faut passer en paramètre le hash de la transaction (voir ci-dessus)
    const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    })

    // Check en direct si un évènement particulier est émis (vous pouvez décommenter pour voir le résultat au besoin)
    // useWatchContractEvent({
    //     address: contractAddress,
    //     abi: contractAbi,
    //     eventName: 'NumberChanged',
    //     onLogs(logs) {
    //         toast({
    //             title: "Un nouvel event est arrivé !",
    //             status: "success",
    //             duration: 3000,
    //             isClosable: true,
    //         });
    //     },
    // })

    // Get all the events 
    
    // Récupère tous les events, pour cela getLogs de Viem est de loin le plus efficace
    const getEvents = async() => {
        // On récupère tous les events NumberChanged
        const numberChangedLog = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event NumberChanged(uint oldValue, uint newValue)'),
            // du premier bloc
            fromBlock: 0n,
            // jusqu'au dernier
            toBlock: 'latest' // Pas besoin valeur par défaut
        })
        // Et on met ces events dans le state "events" en formant un objet cohérent pour chaque event
        setEvents(numberChangedLog.map(
            log => ({
                oldValue: log.args.oldValue.toString(),
                newValue: log.args.newValue.toString()
            })
        ))
    }

    // Lorsque l'on a qqn qui est connecté, on fetch les events
    useEffect(() => {
        const getAllEvents = async() => {
            if(address !== 'undefined') {
                await getEvents();
            }
        }
        getAllEvents()
    }, [address])

    return (
    <Flex 
        direction="column"
        width="100%"
    >
        <Heading as='h4' size='md' mb="1rem">
            Get
        </Heading>
        <Flex>
            {/* Est ce qu'on est en train de récupérer le nombre ? */}
            {getIsPending ? (
                <Spinner />
            ) : (
                <Text>Result : {numberGet?.toString()}</Text>
            )}
        </Flex>
        <Heading as='h4' size='md' mt="2rem" mb="1rem">
            Set
        </Heading>
        <Flex direction="column">
            {hash && 
                <Alert status='success' mt="1rem" mb="1rem">
                    <AlertIcon />
                    Transaction Hash: {hash}
                </Alert>
            }
            {isConfirming && 
                <Alert status='success' mt="1rem" mb="1rem">
                    <AlertIcon />
                    Waiting for confirmation...
                </Alert>
            }
            {isConfirmed && 
                <Alert status='success' mt="1rem" mb="1rem">
                    <AlertIcon />
                    Transaction confirmed.
                </Alert>
            }
            {error && (
                <Alert status='error' mt="1rem" mb="1rem">
                    <AlertIcon />
                    Error: {(error).shortMessage || error.message}
                </Alert>
            )} 
        </Flex>
        <Flex>
            <Input placeholder='Your number' onChange={(e) => setNumber(e.target.value)} />
            <Button disabled={setIsPending} onClick={setTheNumber}>{setIsPending ? 'Confirming...' : 'Set'} </Button>
        </Flex>
        <Heading as='h4' size='md' mt="2rem" mb="1rem">
            Events
        </Heading>
        <Flex 
            direction='column'
        >
            {/* Ici, il faut afficher la liste des events si on a des events. Il faut toujours avoir une clé unique au niveau des éléments d'un map dans reactjs, pour cela on peut utiliser aussi crypto.randomUUID() */}
            {events && events.map((event) => {
                return <Flex key={crypto.randomUUID()}>
                    Old Value : {event.oldValue} - New Value : {event.newValue}
                </Flex>
            })}
        </Flex>
    </Flex>
  )
}

export default SimpleStorage