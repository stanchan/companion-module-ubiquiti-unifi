module.exports = {
	initActions() {
		const actions = {
			POECycle: {
				label: 'Power Cycle POE Switchport',
				options: [
					{
						type: 'textinput',
						label: 'Switch Mac Address',
						id: 'mac',
						default: ''
					},
					{
						type: 'textinput',
						label: 'Port',
						id: 'port',
						default: ''
					}
				]
			},
			POEMode: {
				label: 'Switchport POE Mode',
				options: [
					{
						type: 'textinput',
						label: 'Switch Mac Address',
						id: 'mac',
						default: ''
					},
					{
						type: 'textinput',
						label: 'Port',
						id: 'port',
						default: ''
					},
					{
						type: 'dropdown',
						label: 'Mode',
						id: 'mode',
						choices: [
							{ id: 'auto', label: 'Auto' },
							{ id: 'pasv24', label: '24V Passive' },
							{ id: 'off', label: 'Off' }
						]
					}
				]
			},
			ProfilePOEMode: {
				label: 'Profile POE Mode',
				options: [
					{
						type: 'textinput',
						label: 'Profile Name',
						id: 'profile',
						default: ''
					},
					{
						type: 'dropdown',
						label: 'Mode',
						id: 'mode',
						choices: [

							{ id: 'auto', label: 'Auto' },
							{ id: 'pasv24', label: '24V Passive' },
							{ id: 'off', label: 'Off' }
						]
					}
				]
			}
		}

		this.setActions(actions)
	},

	action(action) {
		let opt = action.options;
		this.debug('action: ', action);

		switch (action.action) {
			case 'POECycle':
				this.commandQueue.push({ function: this.PowerCyclePort, args: [opt.mac, opt.port] });
				break;
			case 'POEMode':
				this.commandQueue.push({ function: this.changePOEMode, args: [opt.mac, opt.port, opt.mode] });
				break;
			case 'ProfilePOEMode':
				this.commandQueue.push({ function: this.changePortProfilePOEMode, args: [opt.profile, opt.mode] });
				break;
		}
	}
}
