export default class {
	constructor(map) {
		Object.defineProperty(this, 'keys', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: {}
		});
		Object.defineProperty(this, '__map', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: map
		});
	}
	Register(keyvalue) {
		let that = this;
		if (!Object.isFrozen(this)) {
			for (let key in keyvalue) {
				let value = keyvalue[key];
				
				this.keys[key] = Object.create({
					mapmanager: true
				});
				
				Object.freeze(this.keys[key]);
				Object.defineProperty(this, key, {
					get: function () {
						return this.__map.get(that.keys[key]);
					},
					set: function (value) {
						this.__map.set(that.keys[key], value);
					}
				});
				this[key]=value;
			}
			delete this.Register;
			Object.freeze(this);
		}
	}
}