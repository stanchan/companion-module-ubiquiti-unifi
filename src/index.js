const instance_skel = require('../../../instance_skel');

const actions = require('./actions');
const configs = require('./configs');
const errors = require('./errors');

const unifi = require('node-unifi');
const async = require('async');

class UnifiInstance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config);

		Object.assign(this, {
			...actions,
			...configs,
			...errors,
		})

		this.config = config

		this.commandQueue = [];
		this.waiting = false;
		this.hostTimeout = 10000;

		this.initActions()
	}

	init() {
		this.updateConfig()
	}

	updateConfig(config) {
		if (config) {
			this.config = config
		}

		this.status(this.STATE_OK);

		if (this.controller !== undefined) {
			delete this.controller;
		}

		this.controller = new unifi.Controller({
			host: this.config.host,
			port: this.config.port,
			sslverify: this.config.sslverify,
			site: this.config.site
		});

		if (!config) {
			this.startTransmitTimer();
		}
	}

	destroy() {
		this.debug("destroy");
		if (this.controller !== undefined) {
			this.controller.logout();
		}
		this.stopTransmitTimer();
	}

	startTransmitTimer() {
		var timeout = 100;

		// Stop the timer if it was already running
		this.stopTransmitTimer();

		this.log('debug', "Starting transmit timer");
		// Create a timer to transmit commands to the controller
		this.transmitTimer = setInterval(() => {
			if (!this.waiting) {
				if (this.commandQueue.length > 0) {
					this.waiting = true;
					let currentCommand = this.commandQueue.shift();
					currentCommand['function'].apply(this, currentCommand['args']);
					this.waiting = false;
				}
			}
		}, timeout);
	}

	stopTransmitTimer() {
		if (this.transmitTimer !== undefined) {
			this.log('debug', "Stopping connection timer");
			clearInterval(this.transmitTimer);
			delete this.transmitTimer;
		}
	}

	dologin() {
		const timeoutError = Symbol();

		const timeoutTimer = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearInterval(timer));
		}

		const LoginWithTimeout = async () => {
			await this.controller.login(this.config.username, this.config.password);
			return;
		}

		(async () => {
			try {
				await this.timeoutTimer(LoginWithTimeout(), this.hostTimeout, timeoutError);
				return;
			} catch (err) {
				if (err === timeoutError) {
					throw new Error('Host_Timeout');
				} else {
					throw err;
				}
			}
		})();
	}

	doLogout() {
		const timeoutError = Symbol();

		const timeoutTimer = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearInterval(timer));
		}

		const LogoutWithTimeout = async () => {
			await this.controller.logout();
			return;
		}

		(async () => {
			try {
				await this.timeoutTimer(LogoutWithTimeout(), this.hostTimeout, timeoutError);
				return;
			} catch (err) {
				if (err === timeoutError) {
					throw new Error('Host_Timeout');
				} else {
					throw err;
				}
			}
		})();
	}

	doPowerCyclePort(mac, port) {
		const timeoutError = Symbol();

		const timeoutTimer = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearInterval(timer));
		}

		const PowerCyclePortWithTimeout = async () => {
			await this.controller.powerCycleSwitchPort(mac, port);
			return;
		}

		(async () => {
			try {
				await this.timeoutTimer(PowerCyclePortWithTimeout(), this.hostTimeout, timeoutError);
				return;
			} catch (err) {
				if (err === timeoutError) {
					throw new Error('Host_Timeout');
				} else {
					throw err;
				}
			}
		})();
	}

	doGetPortOverrides(mac) {
		const timeoutError = Symbol();

		const timeoutTimer = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearInterval(timer));
		}

		const GetPortOverridesWithTimeout = async () => {
			let device = await this.controller.getAccessDevices('');
			if (device !== undefined && device.length > 0) {
				if ((device[0] !== undefined) && (device[0].length > 0)) {
					if (device[0][0] !== undefined && device[0][0]['_id'] !== undefined) {
						let portOverrides = { 'port_overrides': device[0][0]['port_overrides'] };
						return({ 'id': device[0][0]['_id'], 'portOverrides': portOverrides });
					}
					else {
						throw new Error('api.err.UnknownDevice');
					}
				}
				else {
					throw new Error('api.err.UnknownDevice');
				}
			}
			else {
				throw new Error('api.err.UnknownDevice');
			}
		}

		(async () => {
			try {
				await this.timeoutTimer(GetPortOverridesWithTimeout(), this.hostTimeout, timeoutError);
				return;
			} catch (err) {
				if (err === timeoutError) {
					throw new Error('Host_Timeout');
				} else {
					throw err;
				}
			}
		})();
	}

	doGetPortProfileConfig(profile) {
		const timeoutError = Symbol();

		const timeoutTimer = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearInterval(timer));
		}

		const GetPortProfileConfigWithTimeout = async () => {
			let data = await this.controller.customApiRequest("/api/s/<SITE>/rest/portconf");
			data.forEach(site => {
				site.forEach(profile_entry => {
					if (profile_entry["name"] == profile) {
						return(profile_entry);
					}
				})
			})
			throw new Error('api.err.UnknownProfile');
		}

		(async () => {
			try {
				await this.timeoutTimer(GetPortProfileConfigWithTimeout(), this.hostTimeout, timeoutError)
			} catch (err) {
				if (err === timeoutError) {
					throw new Error('Host_Timeout');
				} else {
					throw err;
				}
			}
		})();
	}

	doSetPortProfileConfig(profile_id, obj) {
		const timeoutError = Symbol();

		const timeoutTimer = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearInterval(timer));
		}

		const SetPortProfileConfigWithTimeout = async () => {
			await this.controller.customApiRequest("/api/s/<SITE>/rest/portconf/" + profile_id);
		}

		(async () => {
			try {
				await this.timeoutTimer(SetPortProfileConfigWithTimeout(), this.hostTimeout, timeoutError)
			} catch (err) {
				if (err === timeoutError) {
					throw new Error('Host_Timeout');
				} else {
					throw err;
				}
			}
		})();
	}

	doSetDeviceSettings(id, portOverrides) {
		const timeoutError = Symbol();

		const timeoutTimer = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearInterval(timer));
		}

		const SetDeviceSettingsWithTimeout = async () => {
			await this.controller.setDeviceSettingsBase(id, portOverrides);
			return;
		}

		(async () => {
			try {
				await this.timeoutTimer(SetDeviceSettingsWithTimeout(), this.hostTimeout, timeoutError);
				return;
			} catch (err) {
				if (err === timeoutError) {
					throw new Error('Host_Timeout');
				} else {
					throw err;
				}
			}
		})();
	}

	async PowerCyclePort(mac, switchPort) {
		let attributes = {
			'mac': mac,
			'switchPort': switchPort
		}

		try {
			await this.controller.dologin(this.config.username, this.config.password);
			await this.doPowerCyclePort(mac, switchPort);
			this.status(this.OK);
			await this.doLogout();
			return;
		} catch (err) {
			this.handleErrors(err, attributes);
			return;
		}
	}

	async changePOEMode(mac, switchPort, poeMode) {
		let attributes = {
			'mac': mac,
			'switchPort': switchPort
		}

		try {
			await this.controller.dologin(this.config.username, this.config.password);
			let overrides = await this.controller.doGetPortOverrides(mac);
			let found = false;
			for (let port of overrides['portOverrides']['port_overrides']) {
				if (port['port_idx'] == switchPort) {
					found = true;
					port['poe_mode'] = poeMode;
					break;
				}
			}
			if (!found) {
				overrides['portOverrides']['port_overrides'].push(
					{
						'port_idx': Number(switchPort),
						'poe_mode': poeMode
					}
				);
			}
			await this.doSetDeviceSettings(overrides['id'], overrides['portOverrides']);
			this.status(this.OK);
			await this.doLogout();
			return;
		} catch (err) {
			this.handleErrors(err, attributes);
			return;
		}
	}

	async changePortProfilePOEMode(profile, poeMode) {
		let attributes = {
			'profile': profile,
			'poeMode': poeMode
		}

		try {
			await this.controller.dologin(this.config.username, this.config.password);
			let profiles = await this.doGetPortProfileConfig(mac, switchPort);
			profiles["poe_mode"] = poeMode
			await this.doSetPortProfileConfig(profiles["_id"], profiles)
			this.status(this.OK);
			await this.doLogout();
			return;
		} catch (err) {
			this.handleErrors(err, attributes);
			return;
		}
	}
}

module.exports = UnifiInstance
