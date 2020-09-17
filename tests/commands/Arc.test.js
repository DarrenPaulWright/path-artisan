import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Arc from '../../src/commands/Arc.js';

describe('Arc', () => {
	const currentPoint = Object.freeze(new Point(10, 10));

	describe('.split', () => {
		it('should return an empty array when an empty string is provided', () => {
			assert.equal(Arc.split(['']), []);
		});

		it('should return an empty array when one point is provided', () => {
			assert.equal(Arc.split(['1,2']), []);
		});

		it('should return 2 points when 2 points are provided', () => {
			assert.equal(Arc.split(['10,10 0 0 0 5,6']), [
				[new Point(10, 10), 0, 0, 0, new Point(5, 6)]
			]);
		});

		it('should return multiple Points when multiple are provided', () => {
			assert.equal(Arc.split(['10,10 0 0 0 5,6 10,10 0 0 0 5,6']), [
				[new Point(10, 10), 0, 0, 0, new Point(5, 6)],
				[new Point(10, 10), 0, 0, 0, new Point(5, 6)]
			]);
		});

		it('should handle compressed data', () => {
			assert.equal(Arc.split(['10,10 0 005,6']), [
				[new Point(10, 10), 0, 0, 0, new Point(5, 6)]
			]);
		});
	});

	describe('export', () => {
		describe('toAbsolute', () => {
			let settings = {};

			beforeEach(() => {
				settings = {
					toAbsolute: true,
					currentPoint
				};
			});

			it('should convert from relative', () => {
				const arc = new Arc(['10,10 0 005,6']);

				assert.equal(arc.export(settings, []), 'A 10,10 0 0 0 15,16');
				assert.equal(settings.currentPoint, new Point(15, 16));
			});

			it('should convert from absolute', () => {
				const arc = new Arc(['10,10 0 0 0 5,6'], null, null, true);

				assert.equal(arc.export(settings, []), 'A 10,10 0 0 0 5,6');
				assert.equal(settings.currentPoint, new Point(5, 6));
			});
		});

		describe('toRelative', () => {
			let settings = {};

			beforeEach(() => {
				settings = {
					toAbsolute: false,
					currentPoint
				};
			});

			it('should convert from absolute', () => {
				const arc = new Arc(['10,10 0 0 0 15,16'], null, null, true);

				assert.equal(arc.export(settings, []), 'a 10,10 0 0 0 5,6');
				assert.equal(settings.currentPoint, new Point(15, 16));
			});

			it('should convert from relative', () => {
				const arc = new Arc(['10,10 0 0 0 5,6']);

				assert.equal(arc.export(settings, []), 'a 10,10 0 0 0 5,6');
				assert.equal(settings.currentPoint, new Point(15, 16));
			});
		});

		it('should remove whitespace when compress=true and angle is negative', () => {
			const arc = new Arc(['10,10 -45 005,6']);
			const settings = {
				toAbsolute: true,
				compress: true,
				currentPoint
			};

			assert.equal(arc.export(settings, []), 'A10,10-45,0015,16');
			assert.equal(settings.currentPoint, new Point(15, 16));
		});

		it('should remove whitespace when compress=true and angle is a fraction', () => {
			const arc = new Arc(['10,10 0.45 005,6']);
			const settings = {
				toAbsolute: true,
				compress: true,
				fractionDigits: 1,
				currentPoint
			};

			assert.equal(arc.export(settings, []), 'A10,10.5,0015,16');
			assert.equal(settings.currentPoint, new Point(15, 16));
		});

		it('should not remove whitespace when compress=true and angle is positive', () => {
			const arc = new Arc(['10,10 45 005,6']);
			const settings = {
				toAbsolute: true,
				compress: true,
				currentPoint
			};

			assert.equal(arc.export(settings, []), 'A10,10,45,0015,16');
			assert.equal(settings.currentPoint, new Point(15, 16));
		});

		it('should not remove whitespace when compress=true and angle is 0', () => {
			const arc = new Arc(['10,10 0 005,6']);
			const settings = {
				toAbsolute: true,
				compress: true,
				currentPoint
			};

			assert.equal(arc.export(settings, []), 'A10,10,0,0015,16');
			assert.equal(settings.currentPoint, new Point(15, 16));
		});
	});
});
