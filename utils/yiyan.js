import {
	tenApi
} from '@/utils/config.js'

export function getYiyan() {
	return new Promise((resolve, reject) => {
		uni.request({
			url: `${tenApi}yiyan?format=json`,
			success: res => {
				if (res.data.code === 200 & res.data.msg === "success") {
					resolve(`${res.data.data.hitokoto}`);
				} else {
					resolve("生如蝼蚁当立鸿鹄之志,命薄似纸应有不屈之心,乾坤未定,你我皆是黑马");
				}
			},
			fail: res => {
				reject("生如蝼蚁当立鸿鹄之志,命薄似纸应有不屈之心,乾坤未定,你我皆是黑马")
				showError(res);
			}
		})
	})
}