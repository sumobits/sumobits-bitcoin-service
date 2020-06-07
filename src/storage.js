/**
 * @format
 */
import fs from 'fs-extra';
import path from 'path';

class Storage {

	constructor (props) {
		const { location = path.join(__dirname, 'data') } = props || {};

		this.filePath = path.join(location, 'sumobits.dat');
		this.currentPosition = 0;
	}

    close = async () => {
    	if (!this.file) {
    		return;
    	}

    	await this.file.close();
    	console.info('Successfully closed storage.');
    };

    open = async () => {
    	if (!this.filePath) {
    		return;
    	}
		
    	if (!this.file) {
    		fs.ensureFileSync(this.filePath);
    	}

    	this.file = await fs.open(this.filePath, 'w+');
    	console.info('Successfully opened storage.');
    };

    read = async () => {
    	if (!this.file) {
    		throw new Error(
    			`Storage does not exist @ ${this.filePath}. Please check previous message`);
    	}

    	await fs.read(this.file, Buffer.alloc(1000000));

    	// this.currentPosition = bytes.length;
    };

    write = async data => {
    	if (!this.file) {
    		throw new Error(
    			`Storage does not exist @ ${this.filePath}. Please check previous message`);
    	}

    	if(!data) {
    		return;
    	}

    	const { bytes } = await fs.write(this.file, Buffer.from(data), this.currentPosition);
    };
}

export default new Storage();
