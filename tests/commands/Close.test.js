import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Close from '../../src/commands/Close.js';

describe('Close', () => {
	it('should parse an initial string', () => {
		const line = new Close(['1,2']);
		const settings = {
			toAbsolute: false
		};

		assert.is(line.export(settings, []), 'z');
	});

	it('should parse initial numbers', () => {
		const line = new Close([3, 4]);
		const settings = {
			toAbsolute: false
		};

		assert.is(line.export(settings, []), 'z');
	});

	describe('.split', () => {
		it('should return an empty array when an empty string is provided', () => {
			assert.equal(Close.split(''), [[]]);
		});

		it('should return an empty array when one point is provided', () => {
			assert.equal(Close.split('1,2'), [[]]);
		});

		it('should return an empty array when multiple are provided', () => {
			assert.equal(Close.split('1,2 3,4 5,6'), [[]]);
		});
	});

	describe('toAbsolute', () => {
		it('should convert from absolute', () => {
			const line = new Close([], null, null, true);
			const nextCommands = [];
			const settings = {
				toAbsolute: true,
				subPathStart: new Point(10, 12)
			};

			assert.equal(line.export(settings, nextCommands), 'Z');
			assert.equal(settings.currentPoint, new Point(10, 12));
			assert.equal(nextCommands.length, 0);
		});
	});

	describe('toRelative', () => {
		it('should convert from absolute', () => {
			const line = new Close([], null, null, true);
			const nextCommands = [];
			const settings = {
				toAbsolute: false,
				subPathStart: new Point(10, 12)
			};

			assert.equal(line.export(settings, nextCommands), 'z');
			assert.equal(settings.currentPoint, new Point(10, 12));
			assert.equal(nextCommands.length, 0);
		});
	});
});
