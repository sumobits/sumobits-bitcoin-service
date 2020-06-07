/**
 * @format
 */
import { stable } from 'core-js';
import { runtime } from 'regenerator-runtime/runtime';
import Express from 'express';
import dotenv from 'dotenv';
import { uuid } from 'uuidv4';
import Blockchain from './blockchain';
import Storage from './storage';

dotenv.config();

let blockchain;

Storage.open().then(() => {
	Storage.read().then(() => {
		blockchain = new Blockchain(Storage);
	});
}).catch(e => {
	console.error(`Error opening storage: ${e.message}`);
});

const app = Express();
const nodeId = uuid();

app.get('/', (req, res) => {
	res.status(400).send('GET not supported');
});

app.get('/chain/list', (req, res) => {
	res.status(200).send(JSON.stringify(blockchain.getChain()));
});

app.get('/transaction/list', (req, res) => {
	const lastBlock = blockchain.getLastBlock();
	let lastProof;

	if(lastBlock === 0) {
		lastProof = 0;
	} else {
		lastProof = lastBlock.getProof();
	}

	const proof = blockchain.proofOfWork(lastProof);
	const index = blockchain.generateNewTransaction(0, nodeId, 1);

	console.log(`New transaction generated with index: ${index}`);

	const previousHash = blockchain.hash(lastBlock);
	const block = blockchain.generateBlock(proof, previousHash);

	res.status(200).send(JSON.stringify(block));
});

app.post('/transaction/create', (req, res) => {
	const {
		amount,
		recipient,
		sender,
	} = req.query;

	if (amount === '') {
		res.status(400).send('amount is required');
		return;
	} else if(recipient === '') {
		res.status(400).send('recipient is required');
		return;
	} else if (sender === '') {
		res.status(400).send('sender is required');
		return;
	}

	const index = blockchain.generateNewTransaction(req.query.sender,
		 req.query.recipient, req.query.ammount);
	res.status(200).send(`Transaction will be added to block ${  index}`);
});

app.post('/node/register', (req, res) => {
	const { nodes } = req.query;

	if (nodes) {
		res.status(400).send('No nodes provided to regester. Please check your request.');
	}
	nodes.forEach(element => {
		blockchain.registerNode(element);
	});

	res.status(200).send();
});

app.get('/node/resolve', (req, res) => {
	res.send(JSON.stringify(blockchain.resolveConflicts()));
});

const port = process.env.SERVER_PORT || 8080;
const server = app.listen(port, () => {
	console.log(`Blockchain API service listenting on ${port}`);
});

server.on('close', () => {
	blockchain.close();
});

process.on('SIGINT', () => {
	console.info('Caught interrupt signal');
	server.close(() => {
		process.exit();
	});
});
