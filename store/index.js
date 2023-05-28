import Vue from "vue";
import Vuex from "vuex";
import {
	getCache,
	setCache
} from "@/utils/cache.js";
import {
	login,
	getLoginStatus
} from "@/api/modules/user.js";
import {
	serverLogin,
	serverLogout
} from "@/api/modules/musicApi.js";
import {
	getMusicUrl
} from "@/api/modules/search.js";
import {
	musicSearchUrl,
	musicSearch,
	addRecord
} from "@/api/modules/musicApi.js";
import {
	audio
} from "@/plugins/audio/index.js";
import {
	musicConvert
}
from "@/utils/config.js"
import _ from 'lodash'
import moment from 'moment'
Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		userInfo: getCache("USER_INFO"),
		cookie: getCache("COOKIE"),
		historyList: getCache("HISTORY") || [],
		paused: true,
		playInfo: getCache("PLAY_INFO") || {},
		serverUserInfo: getCache("SERVER_USER_INFO") || {},
		loginType: getCache("LOGIN_TYPE") || 0,
	},
	mutations: {
		SET_USERINFO(state, val) {
			state.userInfo = val;
			setCache("USER_INFO", val);
		},
		SET_LOGIN_TYPE(state, val) {
			state.loginType = val;
			setCache("LOGIN_TYPE", val);
		},
		SET_COOKIE(state, cookie) {
			state.cookie = cookie;
		},
		SET_HISROTY(state, val) {
			if (state.historyList.indexOf(val) == -1) {
				state.historyList.unshift(val);
				setCache("HISTORY", state.historyList);
			}
		},
		CLEAR_HISTORY(state) {
			state.historyList = [];
			setCache("HISTORY", []);
		},
		SET_PLAY_INFO(state, playInfo) {
			state.playInfo = playInfo;
			setCache("PLAY_INFO", playInfo);
		},
		SET_PASUED(state, paused) {
			state.paused = paused;
		},
		SERVER_USER_INFO(state, serverUserInfo) {
			state.serverUserInfo = serverUserInfo;
			setCache("SERVER_USER_INFO", serverUserInfo);
		},
		CLEAR_COOKIE(state) {
			state.cookie = "";
			setCache("COOKIE", "");
		},
		CLEAR_SERVER_USER_INFO(state) {
			state.serverUserInfo = {};
			setCache("SERVER_USER_INFO", {});
		},
	},
	actions: {
		login({
			commit
		}, userInfo) {
			const timestamp = new Date().getTime();
			return new Promise(async (resolve, reject) => {
				// 游客登录，获取cookie，使用系统账号登录
				let res = await serverLogin(userInfo);
				if (res.code === 200) {
					commit("SERVER_USER_INFO", res.data);
					login()
						.then((res) => {
							if (res.account) {
								commit("SET_USERINFO", res.account);
							} else if (res.userId) {
								commit("SET_USERINFO", {
									id: res.userId
								});
							}
							setCache("COOKIE", res.cookie);
							commit("SET_COOKIE", res.cookie);
							commit("SET_LOGIN_TYPE", 0);
							resolve("success");
						})
						.catch((err) => {
							console.log(err);
							reject(err);
						});
				} else {
					resolve("error");
				}
			});
		},
		async logout({
			commit
		}) {
			return new Promise(async (resolve, reject) => {
				let res = await serverLogout();
				commit("CLEAR_SERVER_USER_INFO");
				commit("CLEAR_COOKIE");
				commit("CLEAR_HISTORY");
				resolve(res.data);
			});
		},
		async qrCodeLoginCookie({
			commit
		}, cookieData) {
			setCache("COOKIE", cookieData);
			commit("SET_COOKIE", cookieData);
			let res = await getLoginStatus();
			if (res.data.account) {
				commit("SET_USERINFO", res.data.account);
			} else if (res.data.userId) {
				commit("SET_USERINFO", {
					id: res.data,
					userId
				});
			}
			commit("SET_LOGIN_TYPE", 1);
		},
		addHistoryList({
			commit
		}, val) {
			commit("SET_HISROTY", val);
		},
		clearHistoryList({
			commit
		}) {
			commit("CLEAR_HISTORY");
		},
		changePlay({
			state,
			commit,
			dispatch
		}, count) {
			if (audio.audiolist.length == 1) {
				audio.operate(0);
				commit("SET_PASUED", false);
				return;
			}
			// audio.changeplay(count);
			let playIndex = audio.audiolist.findIndex(
				(item) => item.id == state.playInfo.id
			);
			let tempIndex = -1;
			if (count === 1) {
				//下一首
				if (playIndex == audio.audiolist.length - 1) {
					tempIndex = 0;
				} else {
					tempIndex = playIndex + 1;
				}
			} else {
				if (playIndex == 0) {
					tempIndex = audio.audiolist.length - 1;
				} else {
					tempIndex = playIndex - 1;
				}
			}
			dispatch("playMusic", audio.audiolist[tempIndex]);
		},
		//从对应歌曲列表中删除 当前歌曲
		removeMusic({
			state,
			commit
		}, val) {
			let audioList = [...audio.audiolist];
			let index = audioList.findIndex((item) => item.id == val.id);
			audioList.splice(index, 1);
			audio.setAudio(audioList);
			setCache("PLAY_LIST", audioList);
			if (audioList.length == 0) {
				commit("SET_PASUED", true);
				commit("SET_PLAY_INFO", {});
			}
		},

		//播放全部
		async playAllMUsic({
			state,
			commit
		}, list) {
			const data = await getMusic(list[0]);
			list[0] = data;
			audio.setAudio(list);
			setCache("PLAY_LIST", list);
			audio.operate(0);
			commit("SET_PLAY_INFO", list[0]);
			commit("SET_PASUED", false);
		},

		//点击播放
		async playMusic({
			state,
			commit
		}, val) {
			let audioList = [...audio.audiolist];
			let index = audioList.findIndex((item) => item.id === val.id);
			//如果当前播放列表不存在当前音乐
			if (index === -1) {

				const data = await getMusic(val);
				val = data;

				let playIndex = 0;
				if (state.playInfo) {
					playIndex = audioList.findIndex(
						(item) => item.id == state.playInfo.id
					);
				}
				audioList.splice(playIndex + 1, 0, val);
				audio.setAudio(audioList);
				setCache("PLAY_LIST", audioList);
				audio.operate(playIndex === -1 ? 0 : playIndex + 1);
				commit("SET_PLAY_INFO", val);
				commit("SET_PASUED", false);
			} else {
				//如果不存在src
				if (!val.src) {
					const data = await getMusic(val);
					val = data;
					audioList[index] = val;
					audio.setAudio(audioList);
					setCache("PLAY_LIST", audioList);
				}
				audio.operate(index);
				commit("SET_PLAY_INFO", audioList[index]);
				commit("SET_PASUED", false);
			}

			if (state.loginType === 0) {
				let recordData = {
					userid: state.serverUserInfo.userId,
					name: val.title,
					singer: val.singer,
					quality: _.isNil(val.quality) ? 'HD' : val.quality,
					pic: val.coverImgUrl,
					platform: val.type,
					playtime: moment().format('YYYY-MM-DD HH:mm:ss'),
				};
				let recordRes = await addRecord(recordData);
			}
		},
	},
});

const getMusic = (data) => {
	return new Promise(async (resolve, reject) => {
		uni.showLoading({
			title: "获取播放链接..."
		})
		let type = data.type;
		let statusCode = 200;
		let tempMusicData = {
			type,
			..._.pick(data, ['id', 'title', 'singer', 'coverImgUrl', 'src'])
		};
		if (type === 'netease') {
			let res = await getMusicUrl({
				id: data.id
			});
			statusCode = res.code;
			tempMusicData.src = res.data[0].url || '';
		} else if (type === 'kg' || type === 'kw' || type === 'qq') {
			let params = type === 'qq' ? {
				prefix: data.prefix,
				musicId: data.id
			} : {
				musicId: data.id
			};
			let res = await musicSearchUrl(type, params);
			statusCode = res.code;
			tempMusicData.src = res.data;
		} else if (type === 'kg1' || type === 'migu' || type === 'maoer') {
			let params = type === 'maoer' ? {
				musicId: data.id
			} : {
				keyword: data.title,
				musicId: data.id
			};
			let res = await musicSearchUrl(type, params);
			statusCode = res.code;
			if (statusCode === 200) {
				tempMusicData.coverImgUrl = res.data.picUrl;
				tempMusicData.src = res.data.url;
			}
		} else {
			let res = await musicSearch(type, {
				keyword: data.title
			});
			statusCode = res.code;
			if (statusCode === 200) {
				tempMusicData.coverImgUrl = res.data[0].picUrl;
				tempMusicData.src = res.data[0].mp3;
				tempMusicData.id = Math.round(Math.random() * 1000 + 10);
			}
		}
		tempMusicData.quality = _.isNil(data.quality) ? 'HD' : data.quality;
		if (statusCode === 200) {
			resolve(tempMusicData);
			uni.hideLoading();
		} else {
			uni.showToast({
				title: "暂无该音乐版权",
				icon: "none",
				duration: 2000,
			});
			reject();
		}
	});
};

export default store;