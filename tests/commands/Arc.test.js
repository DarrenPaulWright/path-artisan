import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Arc from '../../src/commands/Arc.js';

describe('Arc', () => {
	const currentPoint = Object.freeze(new Point(10, 10));

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
				const arc = new Arc(['10,10 0 0 0 5,6']);

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
	});
});
