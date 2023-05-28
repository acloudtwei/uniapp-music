<template>
	<view class="login-container">
		<image src="../../static/loginBg.png" class="background-img"></image>
		<view class="absolve-wrapper">
			<view class="logo"><image src="../../static/logo.png" class="logo-img"></image></view>
			<view class="text-title">我有故事和歌，你听吗？</view>
			<view class="login-main">
				<u-form labelPosition="left" :model="userInfo" :rules="rules" ref="loginForm">
					<view class="input-wrapper">
						<u-form-item prop="username" ref="email">
							<i class="iconfont icon-user icon"></i>
							<u-input type="text" placeholder="请输入用户名" v-model="userInfo.username" clearable border="none"></u-input>
						</u-form-item>
					</view>
					<view class="input-wrapper">
						<u-form-item prop="password" ref="password">
							<i class="iconfont icon-password icon"></i>
							<u-input v-if="isText" type="password" placeholder="请输入密码" v-model="userInfo.password" border="none"></u-input>
							<u-input v-else placeholder="请输入密码" v-model="userInfo.password" border="none"></u-input>
							<i class="iconfont eye" :class="isText ? 'icon-openEye' : 'icon-closeEye'" @click="isText = !isText"></i>
						</u-form-item>
					</view>
				</u-form>
				<view class="navi">
					<button class="cu-btn round login-button lg cu-load" :class="{ loading: loading }" @click="getUserInfo">登录</button>
					<view class="navi-style">
						<u-tag text="注册" size="mini" icon="plus" plain @click="registerNavi"></u-tag>
						<u-tag class="forget-style" text="忘记密码" size="mini" type="error" icon="warning" plain @click="forgetNavi"></u-tag>
					</view>
				</view>
			</view>
			<view class="other-login">
				<view class="other-text">第三方登录</view>
				<view class="login-list">
					<i class="iconfont icon-wangyi other-item" @click="neteaseCloudNavi"></i>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import _ from 'lodash';
	import { mapActions } from 'vuex';
	export default {
		data() {
			return {
				loading: false,
				isText: true,
				userInfo: {
					username: '',
					password: '',
				},
				rules: {
					username: {
						type: 'string',
						required: true,
						message: '请填写用户名',
						trigger: ['blur'],
					},
					password: {
						type: 'string',
						required: true,
						message: '请填写密码',
						trigger: ['blur'],
					},
				},
			};
		},
		methods: {
			...mapActions(['login']),
			getUserInfo() {
				let that = this;
				const userInfo = this.userInfo;
				that.$refs.loginForm
					.validate()
					.then(async (res) => {
						that.loading = true;
						let userInfo = _.cloneDeep(that.userInfo);
						let loginData = await that.login(userInfo);
						if (loginData === 'success') {
							that.loading = false;
							uni.navigateTo({
								url: '/pages/index/index',
							});
						} else {
							uni.showToast({
								title: '登录失败',
								icon: 'none',
								duration: 3000,
								complete: () => {
									setTimeout(() => {
										uni.hideToast();
									}, 3000);
								},
							});
							that.loading = false;
						}
					})
					.catch((errors) => {
						uni.$u.toast('请输入用户名或密码!');
					});
			},
			neteaseCloudNavi() {
				uni.navigateTo({
					url: '/pages/login/qrCodeLogin',
				});
			},
			registerNavi() {
				uni.navigateTo({
					url: '/pages/register/index',
				});
			},
			forgetNavi() {
				uni.navigateTo({
					url: '/pages/forget/index',
				});
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
			top: 60%;
			transform: translateY(-50%);
			left: 10%;
			right: 10%;
			.input-wrapper {
				// display: flex;
				align-items: center;
				margin-bottom: 10rpx;
				padding-bottom: 10rpx;
				border-bottom: 1px solid rgb(242, 242, 242);
				position: relative;
				.icon {
					margin-right: 10px;
					font-size: 16px;
				}
				.eye {
					float: right;
					position: absolute;
					right: 5px;
					font-size: 16px;
				}
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
		.navi {
			position: relative;
			.navi-style {
				position: absolute;
				display: flex;
				justify-content: right;
				top: 120rpx;
				width: 100%;
				height: 100%;
				.forget-style {
					margin-left: 15rpx;
				}
			}
		}
		.other-login {
			position: absolute;
			bottom: 5%;
			left: 10%;
			right: 10%;
			.other-text {
				text-align: center;
				color: rgba(0, 0, 0, 0.4);
				font-size: 28rpx;
				position: relative;
				&::before,
				&::after {
					position: absolute;
					background: rgba(0, 0, 0, 0.15);
					content: '';
					height: 1px;
					top: 50%;
					width: 100px;
				}
				&::before {
					left: 5px;
				}
				&::after {
					right: 5px;
				}
			}
			.login-list {
				margin-top: 15px;
				display: flex;
				justify-content: center;
				align-items: center;
				.other-item {
					flex: 1;
					font-size: 40px;
					text-align: center;
					&.icon-weixin {
						color: #17d874;
					}
					&.icon-qq {
						color: #32d6f5;
					}
					&.icon-weibo {
						color: rgb(234, 93, 92);
					}
				}
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
