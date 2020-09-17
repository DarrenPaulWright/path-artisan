import { castArray, isString } from 'type-enforcer';
import Path from './Path.js';

const processNode = (node, settings) => {
	if (node.nodeName === 'path') {
		return Promise.all(castArray(node.attributes).map((attribute) => {
			if (attribute.name === 'd') {
				return new Path(attribute.value)
					.export({
						...settings,
						async: true
					})
					.then((value) => {
						attribute.value = value;
					});
			}

			return Promise.resolve();
		}));
	}

	if (node.nodeName === 'polygon' || node.nodeName === 'polyline') {
		return Promise.all(castArray(node.attributes).map((attribute) => {
			if (attribute.name === 'points') {
				return new Path(attribute.value)
					.export({
						...settings,
						toPolygon: true,
						async: true
					})
					.then((value) => {
						attribute.value = value;
					});
			}

			return Promise.resolve();
		}));
	}

	return Promise.resolve();
};

/**
 * Optimize all the paths in an svg file. Currently supports the `d` attribute in the `path` element and the `points` attribute in both `polygon` and `polyline` elements.
 *
 * @example
 * ``` javascript
 * import { optimizeSvgPaths } from 'pathinator';
 *
 * const svg = document.querySelector('svg');
 *
 * optimizeSvgPaths(svg, { compress: true })
 *     .then((result) => {
 *         // do something
 *     });
 * ```
 *
 * @function optimizeSvgPaths
 *
 * @param {string|Document} input - Can be the string content of an svg or a DOM Document.
 * @param {object} [settings] - See [Path.export]{@link Path#export}. Settings are applied to each path found in the svg.
 *
 * @returns {Promise<string|Document>} Resolves with the optimized svg in the same format provided.
 */
export default function optimizeSvgPaths(input, settings = {}) {
	return new Promise((resolve) => {
		const isInputString = isString(input);

		if (isInputString) {
			input = new DOMParser().parseFromString(input, 'text/xml');
		}

		processNode(input, settings)
			.then(() => {
				return Promise.all(castArray(input.childNodes).map((child) => {
					if (child.nodeType === 1) {
						return optimizeSvgPaths(child, settings);
					}

					return Promise.resolve();
				}));
			})
			.then(() => {
				resolve(isInputString ? new XMLSerializer().serializeToString(input) : input);
			});
	});
}
