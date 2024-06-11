export const setStorage = (key, value) => {
	try {
		wx.setStorageSync(key, value);
	} catch (error) {
		console.log(`存储${key},发生错误`, error);
	}
}
export const getStorage = (key) => {
	try {
		return wx.getStorageSync(key);
	} catch (error) {
		console.log(`读取${key},发生错误`, error);
	}
}

export const removeStorage = (key) => {
	try {
		wx.removeStorageSync(key)
	} catch (error) {
		console.log(`移除${key},发生错误`, error);
	}
}

export const clearStorage = () => {
	try {
		wx.clearStorageSync();
	} catch (error) {
		console.log(`清除,发生错误`, error);
	}
}