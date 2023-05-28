<template>
	<view class="my-container">
		<view class="mask-container" :style="{'backgroundImage':'url('+backImg+')'}">
			<div class="cover-mask" style="opacity: 0.6"></div>
			<cu-custom bgColor="unset"><block slot="content">我的</block></cu-custom>
			<image :src="userIcon" mode="" class="head-img"></image>
			<view class="username">{{ userName }}</view>
		</view>
		<view class="recommend-main">
			<div class="tabs flex">
				<view class="tab-item" :class="{ active: currentType == 'history' }" @click="changeType">最近</view>
				<view class="tab-item"><u-button type="error" :plain="true" :hairline="true" text="注销登录" @click="logoutUser"></u-button></view>
				<view class="tab-item" :class="{ active: currentType == 'like' }" @click="changeType">喜欢</view>
			</div>
			<view class="music-title" @click="handlePlayAllMusic">
				<view v-if="showPlay">
					<text class="iconfont icon-kaishi3 basic-icon-color playIcon"></text>
					全部播放
					<text class="light-text">(共{{ musicList.length }}首)</text>
				</view>
				<view v-else>
					<text class="iconfont icon-record basic-icon-color playIcon"></text>
					所有记录
				</view>
			</view>
			<scroll-view scroll-y scroll-with-animation style="height: calc(100% - 100px)">
				<view
					class="music-item flex"
					:class="{ active: item.id == playInfo.id }"
					v-for="(item, index) in musicList"
					:key="item.id"
					@click="handlePlayMusic(item)"
				>
					<image :src="item.coverImgUrl" mode="widthFix" class="music-img" lazy-load="true"></image>
					<view class="music-info">
						<view class="music-name text-overflow">{{ item.title }}</view>
						<view class="music-singer text-overflow flex">
							<span class="small-icon">{{ item.quality }}</span>
							{{ item.detail }}
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<tab-bar currentPage="my" />
	</view>
</template>

<script>
	import { getImage, getName } from '@/utils/index.js';
	import { mapState } from 'vuex';
	import { backgroundImgUrl } from '@/utils/config.js';
	import _ from 'lodash';
	import { mapActions } from 'vuex';
	export default {
		data() {
			return {
				currentType: 'history',
				userName: '凌晨四点的惠院',
				userIcon: '../../static/logo.png',
				backImg: backgroundImgUrl,
				musicList: [],
				showPlay: true,
			};
		},
		computed: {
			...mapState({
				playInfo: (state) => state.playInfo,
				paused: (state) => state.paused,
				userInfo: (state) => state.userInfo,
				serverUserInfo: (state) => state.serverUserInfo,
				loginType: (state) => state.loginType,
			}),
		},
		onShow() {
			this.showPlay = this.loginType === 0 ? false : true;
			this.getUserMsg();
			if (this.currentType == 'history') {
				this.getUserHistory();
			} else {
				this.getUserInfo();
			}
		},
		methods: {
			...mapActions(['logout']),
			// 注销登录
			async logoutUser() {
				let data = await this.logout();
				uni.$u.toast(data);
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/index',
					});
				}, 1000);
			},
			// 获取用户基本信息
			async getUserMsg() {
				try {
					// 要改一下
					if (this.loginType === 1) {
						const res = await this.$api.getLoginStatus();
						this.userName = res.data.profile['nickname'];
						this.userIcon = res.data.profile['avatarUrl'];
						this.backImg = res.data.profile['backgroundUrl'];
					}
				} catch (e) {
					console.log(e);
				}
			},
			//获取用户喜欢的音乐
			async getUserInfo() {
				if (this.loginType === 1) {
					const uid = this.userInfo.id;
					const timestamp = new Date().getTime();
					const data = await this.$api.getUserInfo({ uid, timestamp });
					const id = data.playlist[0].id;
					uni.showLoading({
						title: '加载中...',
					});
					const list = await this.$api.getPlayListData({ id, timestamp });
					const arr = list.playlist.trackIds.map((item) => item.id).join(',');
					this.musicList = [];
					if (arr) {
						const temp = await this.$api.getPlayDetail({ ids: arr, timestamp });
						const list = temp.songs || [];
						this.musicList = this.covertList('netease', list);
					}
					uni.hideLoading();
				} else {
					const collectRes = await this.$api.getCollect({ userid: this.serverUserInfo.userId });
					this.musicList = this.covertList('collect', collectRes.data);
				}
			},

			//获取用户播放记录
			async getUserHistory() {
				if (this.loginType === 1) {
					const uid = this.userInfo.id;
					const timestamp = new Date().getTime();
					const data = await this.$api.getUserHistory({ uid, timestamp, type: 0 });
					const list = data.allData.map((item) => item.song);
					this.musicList = this.covertList('netease', list);
				} else {
					const recordRes = await this.$api.getRecord({ userid: this.serverUserInfo.userId });
					this.musicList = this.covertList('record', recordRes.data);
				}
			},

			changeType() {
				this.currentType = this.currentType == 'history' ? 'like' : 'history';
				if (this.currentType == 'history') {
					this.getUserHistory();
				} else {
					this.getUserInfo();
				}
			},

			//播放全部
			handlePlayAllMusic() {
				if (this.showPlay) {
					if (this.musicList.length === 0) return;
					const list = _.map(this.musicList, (item) => {
						return { ..._.omit(item, ['detail']) };
					});
					this.$store.dispatch('playAllMUsic', list);
				} else {
					return;
				}
			},

			//点击播放
			handlePlayMusic(val) {
				if (this.showPlay) {
					if (this.playInfo.id == val.id) {
						uni.navigateTo({
							url: '../play/index',
						});
						return;
					}
					this.$store.dispatch('playMusic', { ..._.omit(val, ['detail']) });
				} else {
					return;
				}
			},

			covertList(type, list) {
				if (type === 'netease') {
					return _.map(list, (item) => {
						return {
							id: item.id,
							title: item.name,
							singer: getName(item),
							coverImgUrl: `${getImage(item)}?param=60y60`,
							quality: item.id % 2 == 0 ? 'SQ' : 'HD',
							detail: `${item.ar ? item.ar.map((item) => item.name).join('/') : ''} - ${item.al.name}`,
							src: '',
							type: 'netease',
							prefix: '',
						};
					});
				} else {
					return _.map(list, (item) => {
						return {
							id: Math.round(Math.random() * 10000 + 10),
							title: item.name,
							coverImgUrl: item.pic,
							quality: item.quality,
							detail: item.singer,
						};
					});
				}
			},
		},
	};
</script>

<style lang="scss" scoped>
	.my-container {
		width: 100%;
		height: 100%;
		position: relative;
		.mask-container {
			overflow: hidden;
			position: absolute;
			height: 30%;
			width: 100%;
			background-size: cover;
			background-position: center;
			&:after {
				content: '';
				position: absolute;
				width: 130%;
				height: 130%;
				left: 0;
				top: 0;
				z-index: 1;
				filter: blur(1px);
				transform: translate(-3rem, -3rem);
				background: inherit;
				background-size: 100% 100%;
			}
			.cover-mask {
				position: absolute;
				height: 100%;
				width: 100%;
				z-index: 3;
				background-color: rgba(0, 0, 0, 0.8);
			}
			.head-img {
				width: 108px;
				height: 108px;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				z-index: 99;
				border-radius: 50%;
				overflow: hidden;
			}
			.username {
				position: absolute;
				left: 50%;
				bottom: 20px;
				transform: translateX(-50%);
				z-index: 99;
				color: #fff;
				font-size: 36rpx;
			}
		}
		.recommend-main {
			width: 100%;
			position: absolute;
			top: 30%;
			bottom: 50px;
			.tabs {
				box-shadow: 0 0 0.8px rgb(0, 0, 0 / 10%);
				width: 100%;
				height: 45px;
				align-items: center;
				.tab-item {
					flex: 1;
					font-size: 32rpx;
					text-align: center;
					color: rgba(0, 0, 0, 0.5);
					&.active {
						color: rgb(248, 78, 81);
					}
				}
			}
			.music-title {
				padding-left: 20px;
				margin: 15px 0;
				box-sizing: border-box;
				color: #000;
				font-size: 32rpx;
				font-weight: 600;
				.playIcon {
					margin-right: 8px;
					font-size: 40rpx;
				}
				.light-text {
					font-size: 24rpx;
					margin-left: 6px;
					color: rgba(0, 0, 0, 0.5);
				}
			}
			.music-item {
				height: 70px;
				box-sizing: border-box;
				padding: 0 20px;
				align-items: center;
				margin-bottom: 10px;
				position: relative;
				&:last-of-type {
					margin-bottom: 0;
				}
				&.active {
					background-image: linear-gradient(to right, rgba(247, 73, 79, 0.1), rgba(247, 73, 79, 0.05));
					.music-info {
						.music-name,
						.small-icon,
						.music-singer {
							color: #f84e51 !important;
						}
						&::before {
							content: '';
							width: 4px;
							height: 65px;
							background-image: linear-gradient(to bottom, rgb(253, 117, 102), rgb(247, 73, 79));
							position: absolute;
							left: 0px;
							top: 3px;
						}
					}
				}
				.music-img {
					width: 58px !important;
					height: 58px !important;
					border-radius: 6px;
				}
				.music-info {
					margin-right: 15px;
					margin-left: 15px;
					width: calc(100vw - 135px);
					text-align: left;
					.music-name {
						font-size: 30rpx;
						margin-bottom: 7px;
						color: #000;
					}
					.music-singer {
						color: rgba(0, 0, 0, 0.5);
						font-size: 24rpx;
						align-items: center;
						.small-icon {
							margin-right: 6px;
							transform: scale(0.9);
							color: rgba(0, 0, 0, 0.5);
							font-size: 12px;
							padding: 1px 3px;
							border: 1px solid rgba(0, 0, 0, 0.2);
							border-radius: 4px;
						}
					}
				}
			}
		}
	}
</style>
