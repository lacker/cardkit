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

export function makeId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// pick a random oject from list
export function choice(list) {
  return list[Math.floor(Math.random() * list.length)]
}