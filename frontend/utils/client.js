
/* 
createPublicClient : Une fonction utilisée pour créer un client qui peut interagir avec la blockchain sans nécessiter de compte utilisateur ou de clé privée. Cela est souvent utilisé pour lire des données d'un contrat intelligent.

http : Une fonction qui spécifie le mode de transport pour la communication avec la blockchain, dans ce cas, via des requêtes HTTP.

hardhat : Un objet qui représente la chaîne Hardhat, utilisée pour le développement et le test de contrats intelligents localement avant leur déploiement sur une chaîne publique.
*/
import { createPublicClient, http } from 'viem'
import { hardhat } from 'viem/chains'

/*
La fonction createPublicClient est appelée avec un objet de configuration qui spécifie deux propriétés :

chain : La chaîne de blocs avec laquelle le client doit interagir, ici spécifiée comme hardhat, ce qui indique que le client est destiné à communiquer avec une blockchain Hardhat locale.

transport : Le mode de transport utilisé pour envoyer et recevoir des données de la blockchain, spécifié ici comme http(), ce qui indique que les requêtes HTTP seront utilisées.
*/
export const publicClient = createPublicClient({ 
  chain: hardhat,
  transport: http()
})