module.exports = {
	handleErrors(err, attributes) {
		if (err == "api.err.Invalid") {
			this.log('error', 'Username or Password invalid');
			this.status(this.STATE_ERROR);
		}
		else if (err == 'api.err.LoginRequired') {
			this.log('error', 'Failed to login');
			this.status(this.STATE_ERROR);
		}
		else if (err == "api.err.NoSiteContext") {
			this.log('warn', 'Site "' + attributes['site'] + '" does not exist');
		}
		else if (err == "api.err.UnknownDevice") {
			this.log('warn', 'Device "' + attributes['mac'] + '" does not exist');
		}
		else if ((err == "api.err.InvalidPayload") || (err == "api.err.InvalidTargetPort")) {
			this.log('warn', 'Port "' + attributes['switchPort'] + '" does not exist or POE is not currently active on it');
		}
		else if (err == "api.err.UnknownProfile") {
			this.log('warn', 'Port Profile ' + attributes['profile'] + ' not found');
		}
		else if (err == 'Host_Timeout') {
			this.log('error', 'ERROR: Host Timedout');
			this.status(this.STATE_ERROR);
		}
		else if (err.message.includes('EHOSTDOWN')) {
			this.log('error', 'ERROR: Host not found');
			this.status(this.STATE_ERROR);
		}
		else {
			this.log('error', 'ERROR: ' + err);
			this.status(this.STATE_ERROR);
		}
	}
}
