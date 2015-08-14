export function buildElementClasses (block, elements) {
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