import { assert } from 'type-enforcer';
import { optimizeSvgPaths } from '../index.js';

describe('optimizeSvgPaths', () => {
	it('should optimize an svg', () => {
		const input = `<svg width="100" height="100">
	<polyline points="50,60 72,8 90,100"/>
	<polygon points="30,40 53,60 70,80"/>
	<path d="m 0,0 L10,10 L 20,30 z"/>
	<path d="m 0,0 L70,10 L 20,30 z"/>
</svg>`;

		const output = `<svg width="100" height="100">
	<polyline points="5,6 7.2.8 9,10"/>
	<polygon points="3,4 5.3,6 7,8"/>
	<path d="m0,0L1,1 2,3z"/>
	<path d="m0,0L7,1 2,3z"/>
</svg>`;

		return optimizeSvgPaths(input, { compress: true, scale: 0.1 })
			.then((result) => {
				assert.is(result, output);
			});
	});
});
