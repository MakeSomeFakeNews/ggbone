const {
	miniProgram
} = wx.getAccountInfoSync()

const {
	envVersion
} = miniProgram

let env = {
	baseURL: "https://ggbone.superbaby.cc"
}
switch (envVersion) {
	case "develop":
		env.baseURL = "https://ggbone.superbaby.cc"
		break
	case "trial":
		env.baseURL = "https://ggbone.superbaby.cc"
		break
	case "release":
		env.baseURL = "https://ggbone.superbaby.cc"
		break
}

export {
	env
}