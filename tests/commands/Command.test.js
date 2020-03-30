import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Command from '../../src/commands/Command.js';

describe('Command', () => {
	describe('.clean', () => {
		it('should parse a single point', () => {
			assert.equal(Command.clean('1,2'), ['1', '2']);
		});

		it('should parse mulitple points', () => {
			assert.equal(Command.clean('1,2 3,4 5,9'), ['1', '2', '3', '4', '5', '9']);
		});

		it('should parse a single point with a negative value', () => {
			assert.equal(Command.clean('1,-2'), ['1', '-2']);
		});

		it('should parse a single point with a negative value and no comma', () => {
			assert.equal(Command.clean('1-2'), ['1', '-2']);
		});

		it('should parse mulitple points with negative values', () => {
			assert.equal(Command.clean('1,2-3,-4 5-9'), ['1', '2', '-3', '-4', '5', '-9']);
		});

		it('should handle extra whitespace between points', () => {
			assert.equal(Command.clean('1,2-3-4   5-9'), ['1', '2', '-3', '-4', '5', '-9']);
		});

		it('should handle single extra whitespace at the ends', () => {
			assert.equal(Command.clean(' 1,2-3-4   5-9 '), ['1', '2', '-3', '-4', '5', '-9']);
		});

		it('should handle multiple extra whitespace at the ends', () => {
			assert.equal(Command.clean('  1,2-3-4   5-9  '), ['1', '2', '-3', '-4', '5', '-9']);
		});

		it('should handle numbers with multiple digits', () => {
			assert.equal(Command.clean('  1,22-333-4444   55555-999999999  '), ['1',
				'22',
				'-333',
				'-4444',
				'55555',
				'-999999999']);
		});

		it('should handle fraction digits', () => {
			assert.equal(Command.clean('123.456-0.6'), ['123.456', '-0.6']);
		});

		it('should ignore returns', () => {
			assert.equal(Command.clean('1,\r-2'), ['1', '-2']);
		});

		it('should ignore newlines', () => {
			assert.equal(Command.clean('1,\n2'), ['1', '2']);
		});

		it('should ignore tabs', () => {
			assert.equal(Command.clean('1,\t2'), ['1', '2']);
		});
	});

	describe('.parseArgs', () => {
		it('should parse a single point', () => {
			assert.equal(Command.parseArgs([' 1,2']), new Point(1, 2));
		});

		it('should parse mulitple points', () => {
			assert.equal(Command.parseArgs([' 1,2-3-4   5-9 ']), [new Point(1, 2),
				new Point(-3, -4),
				new Point(5, -9)]);
		});
	});

	describe('label', () => {
		it('should add a space at the end', () => {
			assert.is(Command.label('Z', 'z', {}), 'z ');
		});

		it('should not add a space at the end if compress = true', () => {
			assert.is(Command.label('Z', 'z', { compress: true, toAbsolute: true }), 'Z');
		});

		it('should add a newline if commandsOnNewLines = true', () => {
			assert.is(Command.label('Z', 'z', { commandsOnNewLines: true }), '\nz ');
		});

		it('should do both', () => {
			assert.is(Command.label('Z', 'z', { compress: true, commandsOnNewLines: true }), '\nz');
		});
	});

	describe('.pointToString', () => {
		const currentPoint = new Point();

		it('should process a point without settings', () => {
			assert.equal(Command.pointToString(new Point(1, 2), { currentPoint }), '1,2');
		});

		it('should have a comma when y is negative and compress is not set', () => {
			assert.equal(Command.pointToString(new Point(1, -2), { currentPoint }), '1,-2');
		});

		it('should remove the comma when y is negative and compress=true', () => {
			assert.equal(Command.pointToString(new Point(1, -2), { compress: true, currentPoint }), '1-2');
		});

		it('should not round if fractionDigits is not set', () => {
			assert.equal(Command.pointToString(new Point(1.123, -2.456), { currentPoint }), '1.123,-2.456');
		});

		it('should round if fractionDigits is set', () => {
			const point = new Point(1.123, -2.456);
			const output = point.clone();

			assert.equal(Command.pointToString(point, { fractionDigits: 2, currentPoint }), '1.12,-2.46');
			assert.equal(point, output);
		});

		it('should scale if scale is set', () => {
			const point = new Point(1.123, -2.456);
			const output = point.clone();

			assert.equal(Command.pointToString(point, {
				scale: { x: 1.5, y: 2 },
				fractionDigits: 2,
				currentPoint
			}), '1.68,-4.91');
			assert.equal(point, output);
		});

		it('should translate if translate is set', () => {
			const point = new Point(1.123, -2.456);
			const output = point.clone();

			assert.equal(Command.pointToString(point, {
				translate: { x: 1.5, y: 2 },
				fractionDigits: 2,
				currentPoint
			}), '2.62,-0.46');
			assert.equal(point, output);
		});

		it('should translate before scaling', () => {
			const point = new Point(10, -10);
			const output = point.clone();

			assert.equal(Command.pointToString(point, {
				translate: { x: 5, y: -5 },
				scale: { x: 2, y: 4 },
				fractionDigits: 2,
				compress: true,
				currentPoint
			}), '30-60');
			assert.equal(point, output);
		});

		it('should add a space at the beginning if followsPoint is true', () => {
			const point = new Point(10, -10);
			const output = point.clone();

			assert.equal(Command.pointToString(point, {
				translate: { x: 5, y: -5 },
				scale: { x: 2, y: 4 },
				fractionDigits: 2,
				compress: true,
				currentPoint
			}, true), ' 30-60');
			assert.equal(point, output);
		});
	});

	describe('.isInline', () => {
		it('should return true for three points in a line', () => {
			assert.equal(Command.isInline(
				new Point(1, 2),
				new Point(2, 3),
				new Point(3, 4)
			), true);
		});

		it('should return true for four points in a line', () => {
			assert.equal(Command.isInline(
				new Point(1, 2),
				new Point(2, 3),
				new Point(3, 4),
				new Point(4, 5)
			), true);
		});

		it('should return true for three points in a line and a duplicate', () => {
			assert.equal(Command.isInline(
				new Point(2, 3),
				new Point(2, 3),
				new Point(3, 4),
				new Point(4, 5)
			), true);
		});
	});
});
