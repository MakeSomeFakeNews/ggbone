import {
	observable,
	action
} from "mobx-miniprogram"
import {
	getStorage,
	setStorage
} from "../utils/storage.js"
export const settingStore = observable({
	tx: getStorage("tx") || "",
	setTx: action(function (data) {
		this.tx = data
		setStorage("tx", data)
	})
})