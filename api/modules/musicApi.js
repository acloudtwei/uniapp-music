import serverRequest from '@/utils/serverRequest'

/**
 *  用户注册
 *  @param  {username,password,email,code} Object 
 *  @return {Object}
 */

export const serverRegister = datas => {
	return serverRequest.post('/api/user/register', datas)
}

/**
 *  用户登录
 *  @param  {username,password} Object 
 *  @return {Object}
 */

export const serverLogin = datas => {
	return serverRequest.post('/api/user/login', datas)
}

/**
 *  用户注销
 *  @param  {}  
 *  @return {Object}
 */

export const serverLogout = () => {
	return serverRequest.get('/api/user/logout')
}

/**
 *  找回密码
 *  @param  {email,password,code} Object 
 *  @return {Object}
 */

export const serverForget = datas => {
	return serverRequest.post('/api/user/forget', datas)
}


/**
 *  获取邮箱验证码
 *  @param  {}  
 *  @return {Object}
 */

export const getCode = (type, params) => {
	return serverRequest.get(`/api/email/${type}`, params)
}

/**
 *  判断邮箱验证码的准确性
 *  @param  {String } code  
 *  @return {Object}
 */

export const verifyCode = (params) => {
	return serverRequest.get('/api/email/verifyCode', params)
}

/**
 *  音乐搜索
 *  @param  {name or singer, type} Object 
 *  @return {Object}
 */

export const musicSearch = (type, params) => {
	return serverRequest.get(`/api/music/${type}/search`, params)
}

export const musicSearchUrl = (type, params) => {
	return serverRequest.get(`/api/music/${type}/url`, params)
}

export const getLyrics = (params) => {
	return serverRequest.get(`/api/music/getLyrics`, params)
}

/**
 *  音乐记录
 *  @param  {} 
 *  @return {Object}
 */

export const getRecord = (params) => {
	return serverRequest.get(`/api/user/getRecord`, params)
}
export const addRecord = (data) => {
	return serverRequest.post(`/api/user/addRecord`, data)
}
export const getCollect = (params) => {
	return serverRequest.get(`/api/user/getCollect`, params)
}
export const addCollect = (data) => {
	return serverRequest.post(`/api/user/addCollect`, data)
}
export const deleteCollect = (data) => {
	return serverRequest.post(`/api/user/deleteCollect`, data)
}
