function hex(x,short) {
	if (short) return (parseInt(x).toString(16))[0].toUpperCase();
	return ("0" + parseInt(x).toString(16)).slice(-2).toUpperCase();
}
export function from_rgb(rgb, short) {
	if (rgb.search("rgb") == -1) {
		if (short) return "#" + (rgb[1] + rgb[3] + rgb[5]).toUpperCase();
		return rgb.toUpperCase();
	} else {
		rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);


		return "#" + (hex(rgb[1], short) + hex(rgb[2], short) + hex(rgb[3])).toUpperCase();
	}
}
export function inverse(hex) {
	var hexVdec = {
		"0": 0,
		"1": 1,
		"2": 2,
		"3": 3,
		"4": 4,
		"5": 5,
		"6": 6,
		"7": 7,
		"8": 8,
		"9": 9,
		"A": 10,
		"B": 11,
		"C": 12,
		"D": 13,
		"E": 14,
		"F": 15,
		"a": 10,
		"b": 11,
		"c": 12,
		"d": 13,
		"e": 14,
		"f": 15
	};
	var decVhex = Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F", 0);
	return "#" + decVhex[Math.abs(hexVdec[hex[1]] - 15)] + decVhex[Math.abs(hexVdec[hex[2]] - 15)] + decVhex[Math.abs(hexVdec[hex[3]] - 15)];
}