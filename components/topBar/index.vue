<template>
	<u-navbar :leftText="title" @leftClick="leftClick" bgColor="#FFFFFF00"></u-navbar>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default: '返回',
			},
		},
		methods: {
			leftClick() {
				if (getCurrentPages().length < 2 && 'undefined' !== typeof __wxConfig) {
					let url = '/' + __wxConfig.pages[0];
					return uni.redirectTo({ url });
				}
				uni.navigateBack({
					delta: 1,
				});
			},
		},
	};
</script>

<style></style>
