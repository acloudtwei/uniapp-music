<template>
	<view>
		<view class="cu-custom" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar fixed" :style="style" :class="[bgImage!=''?'none-bg text-white bg-img':'',bgColor]">
				<view class="music-head-icon">
					<view class="action" @tap="BackPage" v-if="isBack">
						<text class="cuIcon-back"></text>
						<slot name="backText"></slot>
					</view>
					<view class="action" @tap="BackHome" v-if="isBack" style="margin-left: 20rpx">
						<text class="cuIcon-home"></text>
						<slot name="backHome"></slot>
					</view>
				</view>
				<view class="content" :style="[{top:StatusBar + 'px'}]">
					<slot name="content"></slot>
				</view>
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
			};
		},
		name: 'cu-custom',
		computed: {
			style() {
				let StatusBar = this.StatusBar;
				let CustomBar = this.CustomBar;
				let bgImage = this.bgImage;
				let style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
				if (this.bgImage) {
					style = `${style}background-image:url(${bgImage});`;
				}
				return style;
			},
		},
		props: {
			bgColor: {
				type: String,
				default: '',
			},
			isBack: {
				type: [Boolean, String],
				default: false,
			},
			bgImage: {
				type: String,
				default: '',
			},
		},
		methods: {
			BackPage() {
				if (getCurrentPages().length < 2 && 'undefined' !== typeof __wxConfig) {
					let url = '/' + __wxConfig.pages[0];
					return uni.redirectTo({ url });
				}
				uni.navigateBack({
					delta: 1,
				});
			},
			BackHome() {
				uni.navigateTo({
					url: '/pages/index/index',
				});
			},
		},
	};
</script>

<style scoped>
	.music-head-icon {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
	}
</style>
