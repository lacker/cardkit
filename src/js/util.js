/*
 * Takes a BEM block classname and an array of kebab-case element classnames,
 * returns an object with camelCase keys mapped to kebab-case values in block__element
 * format
 */
export function buildElementClasses(block, elements) {
	let bemClasses = {};

	const makeName = (name) => {
		return name.replace(/-([a-z])/g, (replaceChar) => {
			return replaceChar[1].toUpperCase();
		});
	};

	elements.forEach((element) => {
		bemClasses[makeName(element)] = block + '__' + element;
	});

	return bemClasses;
}

// pick a random oject from list
export function choice(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// these gets repeated in SCSS, smelly
export const gameHeight = 768
export const gameWidth = 1024
export const  cardWidth = 80
export const  cardHeight = 120
export const  playerHeight = 120
