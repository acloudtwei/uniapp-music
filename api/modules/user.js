import request from '@/utils/request'

import {
	baseURL
} from '@/utils/config.js'

/**
 *  扫码登录
 *  @param  {String} timerstamp 
 *  @return {Object}
 */
export const getKey = params => {
	return request.get('/login/qr/key', params)
}

/**
 *  扫码登录
 *  @param  {String} timerstamp 
 *  @param  {Boolean} qrimg 
 *  @param  {String} key 
 *  @return {Object}
 */
export const loginQqr = params => {
	return request.get('/login/qr/create', params)
}

/**
 *  扫码登录
 *  @param  {String} timerstamp 
 *  @param  {Boolean} withCredentials 
 *  @param  {String} key 
 *  @return {Object}
 */
export const qrCheck = params => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: `${baseURL}/login/qr/check`,
			data: params,
			header: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			success: (response) => {
				let res = response.data
				resolve(res)
			},
			fail: (error) => {
				if (error && error.response) {
					reject(error.response)
				}
			},
		})
	})
}


/**
 *  游客登录
 *  @return {Array}
 */
export const login = params => {
	return request.get('/register/anonimous', params)
}

/**
 *  获取登录状态
 */
export const getLoginStatus = params => {
	return request.get('/login/status', params)
}

/**
 *  喜欢音乐 或取消喜欢
 */
export const likeMusic = params => {
	return request.get('/like', params)
}

/**
 *  喜欢音乐列表
 */
export const likeData = params => {
	return request.get('/likelist', params)
}

/**
 *  获取用户喜欢的歌单
 */
export const getUserInfo = params => {
	return request.get('/user/playlist', params)
}

/**
 *  获取用户最近播放记录
 */
export const getUserHistory = params => {
	return request.get('/user/record', params)
}