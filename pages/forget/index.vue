<template>
	<view class="forget-container">
		<top-bar title="返回"></top-bar>
		<image src="../../static/loginBg.png" class="background-img"></image>
		<view class="absolve-wrapper">
			<view class="logo"><image src="../../static/logo.png" class="logo-img"></image></view>
			<view class="text-title">忘记密码</view>
			<view class="forget-main">
				<u-form labelPosition="left" :model="forgetInfo" :rules="rules" ref="forgetForm">
					<view class="input-wrapper">
						<u-form-item prop="userInfo.email" ref="email">
							<i class="iconfont icon-email icon"></i>
							<u-input type="text" placeholder="请输入邮箱" v-model="forgetInfo.userInfo.email" clearable border="none"></u-input>
						</u-form-item>
					</view>
					<view class="input-wrapper">
						<u-form-item prop="userInfo.password" ref="password">
							<i class="iconfont icon-password icon"></i>
							<u-input type="password" placeholder="请输入密码" v-model="forgetInfo.userInfo.password" clearable border="none"></u-input>
						</u-form-item>
					</view>
					<view class="input-wrapper">
						<u-form-item prop="verificationCode" ref="verificationCode">
							<i class="iconfont icon-verificationCode icon"></i>
							<u-input type="number" placeholder="请输入验证码" v-model="forgetInfo.verificationCode" maxlength="4" clearable border="none">
								<template slot="suffix">
									<u-code ref="uCode" @change="codeChange" seconds="60" changeText="X秒后重新获取"></u-code>
									<u-button @tap="getCode" :text="tips" type="success" size="mini"></u-button>
								</template>
							</u-input>
						</u-form-item>
					</view>
				</u-form>
				<button class="cu-btn round forget-button lg cu-load" :class="{ loading: loading }" @click="forgetUser">确认</button>
			</view>
		</view>
	</view>
</template>

<script>
	import _ from 'lodash';
	import topBar from '@/components/topBar/index.vue';
	import { verifyCode } from '../../api/modules/musicApi';
	export default {
		data() {
			return {
				loading: false,
				tips: '',
				forgetInfo: {
					userInfo: {
						email: '',
						password: '',
					},
					verificationCode: '',
				},
				rules: {
					'userInfo.email': {
						type: 'email',
						required: true,
						message: '请输入正确的邮箱',
						trigger: ['blur', 'change'],
					},
					'userInfo.password': {
						type: 'string',
						required: true,
						message: '请填写密码',
						pattern: /^[0-9a-zA-Z]*$/g,
						trigger: ['blur'],
					},
					'verificationCode': {
						type: 'number',
						required: true,
						len: 4,
						trigger: ['blur', 'change'],
						validator: (rule, value, callback) => {
							if (this.$refs.uCode.canGetCode) {
								uni.$u.toast('请获取验证码!');
							} else {
								return true;
							}
						},
					},
				},
			};
		},
		components: { topBar },
		methods: {
			forgetUser() {
				this.$refs.forgetForm
					.validate()
					.then(async (status) => {
						if (_.isEmpty(this.forgetInfo.verificationCode)) {
							uni.$u.toast('请先获取验证码');
							return;
						}
						let forgetInfo = _.cloneDeep(this.forgetInfo);
						let codeRes = await this.$api.verifyCode({ code: forgetInfo.verificationCode });
						if (codeRes.code != 200) {
							uni.$u.toast(codeRes.msg);
							return;
						}
						let forgetRes = await this.$api.serverForget(forgetInfo);
						let showToastObj =
							forgetRes.code === 200
								? {
										title: forgetRes.data,
										complete: (res) => {
											uni.navigateTo({
												url: '/pages/login/index',
											});
										},
								  }
								: { title: forgetRes.msg };
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
				if (this.$refs.uCode.canGetCode) {
					// 调用发送验证码API
					let email = this.forgetInfo.userInfo.email;
					let res = await this.$api.getCode('register', { email });
					uni.showLoading({
						title: '正在获取验证码',
					});
					setTimeout(() => {
						uni.hideLoading();
						uni.$u.toast('验证码已发送');
						this.emailOrCode = '请输入验证码';
						this.$refs.uCode.start();
					}, 2000);
				} else {
					uni.$u.toast('倒计时结束后再发送!');
				}
			},
		},
	};
</script>

<style lang="scss" scoped>
	.forget-container {
		width: 100%;
		height: 100vh;
		position: relative;
		overflow: hidden;
		// background: url(../../static/forgetBg.png) no-repeat;
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
		.forget-main {
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
			.forget-button {
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
