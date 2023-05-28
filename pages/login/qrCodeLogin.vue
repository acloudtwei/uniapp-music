<template>
	<view class="login-container">
		<top-bar title="返回"></top-bar>
		<image src="../../static/loginBg.png" class="background-img"></image>
		<view class="absolve-wrapper">
			<view class="logo"><image src="../../static/logo.png" class="logo-img"></image></view>
			<view class="text-title">扫码登录</view>
			<view class="login-main">
				<u-row class="img-style" justify="space-between">
					<u-col span="6"><u--image :src="music163Url" width="300rpx" height="500rpx" shape="square"></u--image></u-col>
					<u-col span="6"><u--image :src="qrimgs" width="300rpx" height="300rpx" shape="square"></u--image></u-col>
				</u-row>
				<u-loading-icon :show="showLoading" :text="showLoadingText"></u-loading-icon>
				<button class="cu-btn round login-button lg cu-load" :class="{ loading: loading }" @click="getUserInfo">登录</button>
			</view>
		</view>
	</view>
</template>

<script>
	import _ from 'lodash';
	import { mapState, mapActions } from 'vuex';
	import { music163Url } from '@/utils/config.js';
	import topBar from '@/components/topBar/index.vue';
	export default {
		data() {
			return {
				unikey: '',
				qrimgs: '',
				qrCheckData: {},
				loading: false,
				isLogin: false,
				showLoading: true,
				showLoadingText: '加载中...',
				music163Url,
			};
		},
		components: { topBar },
		mounted() {
			this.main();
		},
		computed: {
			...mapState(['userInfo', 'cookie']),
		},
		methods: {
			...mapActions(['qrCodeLoginCookie']),
			async main() {
				uni.showLoading({
					title: '正在加载二维码...',
				});
				let keyData = await this.$api.getKey({ timerstamp: new Date().getTime() });
				this.unikey = keyData.data.unikey;
				let qrData = await this.$api.loginQqr({
					timerstamp: new Date().getTime(),
					qrimg: true,
					key: this.unikey,
				});
				this.qrimgs = qrData.data.qrimg;
				this.qrCheck();
				uni.hideLoading();
			},
			async qrCheck() {
				let qrCheckData = await this.$api.qrCheck({
					key: this.unikey,
					timerstamp: new Date().getTime(),
					withCredentials: true,
				});
				this.qrCheckData = qrCheckData;
				this.isLogin = true;
			},
			saveCk(ck) {
				this.qrCodeLoginCookie(ck);
				// console.log(this.cookie);
			},
		},
		watch: {
			isLogin: function () {
				let times = setInterval(async () => {
					this.qrCheck();
					let code = this.qrCheckData.code;
					if (code === 800) {
					} else if (code === 801) {
						this.showLoading = true;
						this.showLoadingText = '等待扫码...';
					} else if (code === 802) {
						this.showLoading = true;
						this.showLoadingText = '待确认...';
					} else if (code === 803) {
						clearInterval(times);
						this.saveCk(this.qrCheckData.cookie);
						uni.navigateTo({
							url: '../index/index',
						});
					}
				}, 3000);
			},
		},
	};
</script>

<style lang="scss" scoped>
	.login-container {
		width: 100%;
		height: 100vh;
		position: relative;
		overflow: hidden;
		// background: url(../../static/loginBg.png) no-repeat;
		// background-size: contain;
		.absolve-wrapper {
			position: absolute;
			top: 0;
			bottom: 0;
			right: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
		.background-img {
			width: 100%;
			height: 100%;
		}
		.logo {
			text-align: center;
			margin-top: 12%;
			.logo-img {
				width: 100px;
				height: 100px;
			}
		}
		.text-title {
			font-size: 48rpx;
			margin-top: 5%;
			text-align: center;
			color: #fffefe;
		}
		.login-main {
			box-sizing: border-box;
			position: absolute;
			top: 67%;
			transform: translateY(-50%);
			left: 10%;
			right: 10%;
			.img-style {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;
				padding-bottom: 10rpx;
				position: relative;
			}
			.login-button {
				width: 100%;
				color: #fff;
				background-image: linear-gradient(to right, #ffa6b6, #ff7c93);
				letter-spacing: 2px;
				height: 90rpx;
				margin-top: 75rpx !important;
			}
		}
		/deep/ {
			.input-placeholder {
				color: rgb(194, 194, 194);
				font-size: 30rpx;
			}
		}
	}
</style>
