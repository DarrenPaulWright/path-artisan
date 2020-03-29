import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Cubic from '../../src/commands/Cubic.js';

describe('Cubic', () => {
	const currentPoint = Object.freeze(new Point(10, 10));

	describe('controlPoint', () => {
		it('should return diff to the second controlPoint', () => {
			const cubic = new Cubic(['0,2 4,2 4,0']);

			assert.equal(cubic.controlPoint(), new Point(0, -2));
		});
	});

	describe('shorthand', () => {
		let settings;

		beforeEach(() => {
			settings = {
				toAbsolute: true,
				currentPoint
			};
		});

		it('should reflect the last control point from a previous Cubic', () => {
			const previous = new Cubic(['0,-2 4,-2 4,0']);
			const cubic = new Cubic(['4,2 4,0'], previous, currentPoint);

			assert.equal(cubic.export(settings, []), 'C 10,12 14,12 14,10');
			assert.equal(settings.currentPoint, new Point(14, 10));
		});

		it('should reflect the last control point from a previous Cubic when this is absolute', () => {
			const previous = new Cubic(['0,-2 4,-2 4,0']);
			const cubic = new Cubic(['18,12 18,10'], previous, new Point(14, 10), true);

			settings.previous = previous;

			assert.equal(cubic.export(settings, []), 'C 14,12 18,12 18,10');
			assert.equal(settings.currentPoint, new Point(18, 10));
		});

		it('should use the currentPoint if no previous Cubic is provided', () => {
			const cubic = new Cubic(['4,2 4,0'], null, new Point());

			assert.equal(cubic.export(settings, []), 'S 14,12 14,10');
			assert.equal(settings.currentPoint, new Point(14, 10));
		});
	});

	describe('isLine', () => {
		describe('isAbsolute', () => {
			it('should return true if both handles are the same as the points', () => {
				const cubic = new Cubic(['10,10 15,15 15,15'], null, null, true);

				assert.equal(cubic.isLine(currentPoint), true);
			});

			it('should return true if the first handle is the same and the second is in line', () => {
				const cubic = new Cubic(['10,10 14,14 16,16'], null, null, true);

				assert.equal(cubic.isLine(currentPoint), true);
			});

			it('should return true if the second handle is the same and the first is in line', () => {
				const cubic = new Cubic(['12,12 16,16 16,16'], null, null, true);

				assert.equal(cubic.isLine(currentPoint), true);
			});

			it('should return true if both handles are in line', () => {
				const cubic = new Cubic(['12,12 14,14 16,16'], null, null, true);

				assert.equal(cubic.isLine(currentPoint), true);
			});

			it('should return false if the first handle is not in line', () => {
				const cubic = new Cubic(['12,12.1 14,14 16,16'], null, null, true);

				assert.equal(cubic.isLine(currentPoint), false);
			});

			it('should return false if the second handle is not in line', () => {
				const cubic = new Cubic(['12,12 14,14.1 16,16'], null, null, true);

				assert.equal(cubic.isLine(currentPoint), false);
			});

			it('should return false if the first handle is not between the points', () => {
				const cubic = new Cubic(['0,0 5,5 5,5'], null, null, true);

				assert.equal(cubic.isLine(currentPoint), false);
			});
		});

		describe('isRelative', () => {
			it('should return true if both handles are the same as the points', () => {
				const cubic = new Cubic(['0,0 5,5 5,5']);

				assert.equal(cubic.isLine(), true);
			});

			it('should return true if the first handle is the same and the second is in line', () => {
				const cubic = new Cubic(['0,0 4,4 6,6']);

				assert.equal(cubic.isLine(), true);
			});

			it('should return true if the second handle is the same and the first is in line', () => {
				const cubic = new Cubic(['2,2 6,6 6,6']);

				assert.equal(cubic.isLine(), true);
			});

			it('should return true if both handles are in line', () => {
				const cubic = new Cubic(['2,2 4,4 6,6']);

				assert.equal(cubic.isLine(), true);
			});

			it('should return false if the first handle is not in line', () => {
				const cubic = new Cubic(['2,2.1 4,4 6,6']);

				assert.equal(cubic.isLine(), false);
			});

			it('should return false if the second handle is not in line', () => {
				const cubic = new Cubic(['2,2 4,4.1 6,6']);

				assert.equal(cubic.isLine(), false);
			});
		});
	});

	describe('export', () => {
		describe('toAbsolute', () => {
			let settings;

			beforeEach(() => {
				settings = {
					toAbsolute: true,
					currentPoint
				};
			});

			it('should convert from relative', () => {
				const cubic = new Cubic(['1,2 3,4 5,6']);

				assert.equal(cubic.export(settings, []), 'C 11,12 13,14 15,16');
				assert.equal(settings.currentPoint, new Point(15, 16));
			});

			it('should convert from absolute', () => {
				const cubic = new Cubic(['1,2 3,4 5,6'], null, null, true);

				assert.equal(cubic.export(settings, []), 'C 1,2 3,4 5,6');
				assert.equal(settings.currentPoint, new Point(5, 6));
			});
		});

		describe('toRelative', () => {
			let settings;

			beforeEach(() => {
				settings = {
					toAbsolute: false,
					currentPoint
				};
			});

			it('should convert from absolute', () => {
				const cubic = new Cubic(['11,12 13,14 15,16'], null, null, true);

				assert.equal(cubic.export(settings, []), 'c 1,2 3,4 5,6');
				assert.equal(settings.currentPoint, new Point(15, 16));
			});

			it('should convert from relative', () => {
				const cubic = new Cubic(['1,2 3,4 5,6']);

				assert.equal(cubic.export(settings, []), 'c 1,2 3,4 5,6');
				assert.equal(settings.currentPoint, new Point(15, 16));
			});
		});
	});
});
