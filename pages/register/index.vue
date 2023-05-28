<template>
	<view class="register-container">
		<top-bar title="返回"></top-bar>
		<image src="../../static/loginBg.png" class="background-img"></image>
		<view class="absolve-wrapper">
			<view class="logo"><image src="../../static/logo.png" class="logo-img"></image></view>
			<view class="text-title">用户注册</view>
			<view class="register-main">
				<u-form labelPosition="left" :model="registerInfo" :rules="rules" ref="registerForm">
					<view class="input-wrapper">
						<u-form-item prop="userInfo.username" ref="username">
							<i class="iconfont icon-user icon"></i>
							<u-input type="text" placeholder="请输入用户名" v-model="registerInfo.userInfo.username" clearable border="none"></u-input>
						</u-form-item>
					</view>
					<view class="input-wrapper">
						<u-form-item prop="userInfo.password" ref="password">
							<i class="iconfont icon-password icon"></i>
							<u-input type="password" placeholder="请输入密码" v-model="registerInfo.userInfo.password" clearable border="none"></u-input>
						</u-form-item>
					</view>
					<view class="input-wrapper">
						<u-form-item prop="userInfo.passwordAgain" ref="passwordAgain">
							<i class="iconfont icon-againpassword icon"></i>
							<u-input
								type="password"
								placeholder="请再一次输入密码"
								v-model="registerInfo.userInfo.passwordAgain"
								clearable
								border="none"
							></u-input>
						</u-form-item>
					</view>
					<view class="input-wrapper">
						<u-form-item prop="userInfo.email" ref="email">
							<i :class="emailOrCodeIcon"></i>
							<u-input
								type="text"
								:placeholder="emailOrCode"
								v-model="registerInfo.userInfo.email"
								:maxlength="verificationCodeNum"
								clearable
								border="none"
							>
								<template slot="suffix">
									<u-code ref="uCode" @change="codeChange" seconds="60" changeText="X秒后重新获取"></u-code>
									<u-button @tap="getCode" :text="tips" type="success" size="mini"></u-button>
								</template>
							</u-input>
						</u-form-item>
					</view>
				</u-form>
				<button class="cu-btn round register-button lg cu-load" :class="{ loading: loading }" @click="registerUser">注册</button>
			</view>
		</view>
	</view>
</template>

<script>
	import _ from 'lodash';
	import topBar from '@/components/topBar/index.vue';
	import { getCode } from '../../api/modules/musicApi';
	export default {
		data() {
			return {
				loading: false,
				tips: '',
				emailOrCode: '请输入邮箱',
				emailOrCodeIcon: 'iconfont icon-email icon',
				tempEmail: '',
				verificationCodeNum: -1,
				registerInfo: {
					userInfo: {
						username: '',
						password: '',
						passwordAgain: '',
						email: '',
					},
					verificationCode: '',
				},
				rules: {
					'userInfo.username': {
						type: 'string',
						required: true,
						message: '请填写用户名',
						pattern: /[A-Za-z0-9_\-\u4e00-\u9fa5]+/,
						trigger: ['blur'],
					},
					'userInfo.password': {
						type: 'string',
						required: true,
						message: '请填写密码',
						pattern: /^[0-9a-zA-Z]*$/g,
						trigger: ['blur'],
					},
					'userInfo.passwordAgain': {
						type: 'string',
						required: true,
						message: '请再一次填写相同密码',
						pattern: /^[0-9a-zA-Z]*$/g,
						trigger: ['blur', 'change'],
						validator: (rule, value, callback) => {
							return _.isEmpty(value) ? false : _.isEqual(value, this.registerInfo.userInfo.password);
						},
					},
					'userInfo.email': {
						type: 'string',
						required: true,
						message: '请填写正确的邮箱/验证码',
						trigger: ['blur', 'change'],
						validator: (rule, value, callback) => {
							let matchingModel = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
							let re = new RegExp(matchingModel);
							let judgeBool = re.test(value) ? true : _.size(value) === 4 ? true : false;
							return judgeBool;
						},
					},
				},
			};
		},
		components: { topBar },
		methods: {
			registerUser() {
				if (_.isEmpty(this.tempEmail)) {
					uni.$u.toast('请获取验证码!');
					return;
				}
				this.$refs.registerForm
					.validate()
					.then(async (res) => {
						let registerInfo = _.cloneDeep(this.registerInfo);
						registerInfo.verificationCode = this.registerInfo.userInfo.email;
						registerInfo.userInfo.email = this.tempEmail;
						this.$delete(registerInfo.userInfo, 'passwordAgain');
						let registerRes = await this.$api.serverRegister(registerInfo);
						let showToastObj =
							registerRes.code === 200
								? {
										title: registerRes.data,
										complete: (res) => {
											uni.navigateTo({
												url: '/pages/login/index',
											});
										},
								  }
								: { title: registerRes.msg };
						uni.showToast({ icon: 'none', ...showToastObj });
					})
					.catch((errors) => {
						uni.$u.toast('请填写完整的信息!');
					});
			},
			codeChange(text) {
				this.tips = text;
			},
			async getCode() {
				if (_.size(this.registerInfo.userInfo.email) === 0) {
					uni.$u.toast('请输入邮箱!');
					return;
				}
				if (this.$refs.uCode.canGetCode) {
					// 调用发送验证码API
					let email = this.registerInfo.userInfo.email;
					let res = await this.$api.getCode('register', { email });
					uni.showLoading({
						title: '正在获取验证码',
					});
					if (res.code === 200) {
						setTimeout(() => {
							uni.hideLoading();
							uni.$u.toast('验证码已发送');
							this.emailOrCode = '请输入验证码';
							this.emailOrCodeIcon = 'iconfont icon-verificationCode icon';
							this.tempEmail = this.registerInfo.userInfo.email;
							this.registerInfo.userInfo.email = '';
							this.verificationCodeNum = 4;
							this.$refs.uCode.start();
						}, 2000);
					} else {
						uni.showToast({
							title: '服务器错误',
							icon: 'error',
						});
					}
				} else {
					uni.$u.toast('倒计时结束后再发送!');
				}
			},
		},
		onReady() {
			this.$refs.registerForm.setRules(this.rules);
		},
	};
</script>

<style lang="scss" scoped>
	.register-container {
		width: 100%;
		height: 100vh;
		position: relative;
		overflow: hidden;
		// background: url(../../static/registerBg.png) no-repeat;
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
			margin-top: 35rpx;
			text-align: center;
			color: #fffefe;
		}
		.register-main {
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
			.register-button {
				width: 100%;
				color: #fff;
				background-image: linear-gradient(to right, #ffa6b6, #ff7c93);
				letter-spacing: 2px;
				height: 45px;
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
