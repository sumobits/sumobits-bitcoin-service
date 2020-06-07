/**
 * @format
 */
import crypto from 'crypto';

class Block {
	constructor (props) {
		const {
			index,
			timestamp,
			transactions,
			proof,
			previousHash,
		} = props;

		this.index = index;
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.proof = proof;
		this.previousHash =previousHash;
	}

	getIndex = () => {
		return this.index;
 	};

	getTimestamp = () => {
		return this.timestamp;
	};

	getTransactions = () => {
		return this.transactions;
	};

	getProof = () => {
		return this.proof;
	};

	getPreviousHash = () => {
		return this.previousHash;
	};
};

class BlockChain {
	constructor (storage) {
		this.storage = storage;
		this.chain = [];
		this.blocks = new Set();
		this.currentTransactions = [];
		this.initialBlock = this.generateBlock(100, 1);
	}

	getChain = () => {
		return this.chain;
	};

	getBlocks = () => {
		return this.blocks;
	};

	getCurrentTransactions = () => {
		return this.currentTransactions;
	};

	setCurrentTransactions = transactions => {
		this.currentTransactions = transactions;
	};

	generateBlock = (proof, previousHash = null) => {
		const now = new Date();
		let previousIndex;
		
		if (this.chain.length === 0) {
			previousIndex = 0;
		} else {
			previousIndex = (this.chain.length - 1);
		}

		let pHash;
		if (this.previousHash === 0) {
			pHash = this.previousHash;
		} else {
			pHash = this.generateHash(this.chain[previousIndex]);
		}

		const block = new Block({
			index: (this.chain.length + 1),
			previousHash: pHash,
			timestamp: now,
			transactions: this.currentTransactions,
		});

		this.storage.write(`${JSON.stringify(block)}\r`);
		this.setCurrentTransactions([]);
		this.chain.push(block);
		return block;
	};

	getLastBlock = () => {
		if (this.chain.length === 0) {
			retun;
		}

		return this.chain[this.chain.length - 1];
	};

	generateNewTransaction = (sender, receipent, amount) => {
		this.currentTransactions.push({
			sender,
			receipent,
			amount,
		});

		if (this.chain.length === 0) {
			return 1;
		} else {
			return this.chain[this.chain.length - 1].index + 1;
		}
	};

	proofOfWork = lastProof => {
		let proof = 0;

		while (!this.validateProof(lastProof, proof)) {
			proof += 1;
		}

		return proof;
	};

	validateProof = (lastProof, proof) => {
		const verifiableProof =
			(Buffer.from(proof.toString()).toString('base64') +
				Buffer.from(lastProof.toString()).toString('base64')),
			hash = crypto.createHash('sha256')
				.update(verifiableProof)
				.digest('base64');
		return hash.startsWith('0000');
	};

	generateHash (block) {
		if (!block) return;
		
		const blockString = JSON.stringify(block);
		const encodedBlock =
			Buffer.from(blockString.toString()).toString('base64');
		const hash = crypto.createHash('sha256')
			.update(encodedBlock)
			.digest('base64');

		return hash;
	};

	valididateChain (chain) {
		let currentIndex = 1;
		let [ lastBlock ] = chain;

		while (currentIndex < chain.length) {
			const block = chain[currentIndex];

			if (block.previousHash !== this.generateHash(block)) {
				return false;
			}

			if (!this.validateProof(lastBlock.proof, block.proof)) {
				return false;
			}

			lastBlock = block;
			currentIndex += 1;
		}

		return true;
	};

	close = () => {
		Storage.close();
	};
};

export default BlockChain;
