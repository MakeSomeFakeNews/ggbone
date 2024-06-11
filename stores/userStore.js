import {
	observable,
	action
} from "mobx-miniprogram"
import {
	getStorage,
	setStorage
} from "../utils/storage.js"
export const userStore = observable({
	token: getStorage("token") || "",
	setToken: action(function (data) {
		this.token = data
		setStorage("token", data)
	})
})