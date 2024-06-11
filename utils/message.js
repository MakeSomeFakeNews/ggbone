module.exports = {
	onMessage(callBackFunc) {
		this.common.messageCallBackFunc = callBackFunc;
	},
	messageListen(params) {
		if (this.common.messageCallBackFunc) {
			this.common.messageCallBackFunc(params);
		}
	},
	common: {
		messageCallBackFunc: null,
	},
}