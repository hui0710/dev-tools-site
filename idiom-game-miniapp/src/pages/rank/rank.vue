<template>
  <view class="rank-page">
    <view class="rank-header">
      <text class="rank-title">🏆 排行榜</text>
    </view>

    <!-- 切换Tab -->
    <view class="rank-tabs">
      <view
        class="rank-tab"
        :class="{ 'rank-tab--active': rankType === 'daily' }"
        @tap="rankType = 'daily'"
      >
        <text class="rank-tab-text">日榜</text>
      </view>
      <view
        class="rank-tab"
        :class="{ 'rank-tab--active': rankType === 'weekly' }"
        @tap="rankType = 'weekly'"
      >
        <text class="rank-tab-text">周榜</text>
      </view>
    </view>

    <!-- 排行列表 -->
    <view class="rank-list">
      <view
        v-for="item in displayList"
        :key="item.rank"
        class="rank-item"
        :class="{ 'rank-item--top': item.rank <= 3 }"
      >
        <view class="rank-item__position">
          <text v-if="item.rank <= 3" class="rank-medal">{{ medalEmoji(item.rank) }}</text>
          <text v-else class="rank-num">{{ item.rank }}</text>
        </view>
        <view class="rank-item__avatar">
          <text class="avatar-placeholder">{{ item.nickname.slice(0, 1) }}</text>
        </view>
        <view class="rank-item__info">
          <text class="rank-item__name">{{ item.nickname }}</text>
          <text class="rank-item__combo">连击{{ item.combo }}</text>
        </view>
        <text class="rank-item__score">{{ item.score }}分</text>
      </view>
    </view>

    <!-- 我的排名 -->
    <view class="my-rank">
      <text class="my-rank-label">我的排名</text>
      <text class="my-rank-value">{{ myRank > 0 ? `第${myRank}名` : '暂无排名' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RankItem, RankType } from '@/types'
import { getStorage } from '@/utils/storage'

const rankType = ref<RankType>('daily')

const dailyList = ref<RankItem[]>(getStorage<RankItem[]>('rank_daily', [
  { rank: 1, nickname: '成语大师', avatar: '', score: 2800, combo: 8 },
  { rank: 2, nickname: '才华横溢', avatar: '', score: 2400, combo: 6 },
  { rank: 3, nickname: '学富五车', avatar: '', score: 2100, combo: 5 },
  { rank: 4, nickname: '博古通今', avatar: '', score: 1800, combo: 4 },
  { rank: 5, nickname: '出口成章', avatar: '', score: 1500, combo: 3 },
]))

const weeklyList = ref<RankItem[]>(getStorage<RankItem[]>('rank_weekly', [
  { rank: 1, nickname: '才高八斗', avatar: '', score: 15600, combo: 12 },
  { rank: 2, nickname: '满腹经纶', avatar: '', score: 12800, combo: 10 },
  { rank: 3, nickname: '妙笔生花', avatar: '', score: 10200, combo: 9 },
  { rank: 4, nickname: '出口成章', avatar: '', score: 9600, combo: 7 },
  { rank: 5, nickname: '才华横溢', avatar: '', score: 8400, combo: 6 },
]))

const displayList = computed(() => {
  return rankType.value === 'daily' ? dailyList.value : weeklyList.value
})

const myRank = computed(() => {
  return 0 // TODO: 接入后端后获取真实排名
})

function medalEmoji(rank: number): string {
  switch (rank) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return ''
  }
}
</script>

<style lang="scss" scoped>
.rank-page {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: 120rpx;
}

.rank-header {
  text-align: center;
  padding: 48rpx 32rpx 24rpx;
}

.rank-title {
  font-size: 44rpx;
  font-weight: 900;
  color: $color-primary;
}

.rank-tabs {
  display: flex;
  margin: 0 32rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.rank-tab {
  flex: 1;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: all 0.2s ease;

  &--active {
    background: $color-primary;
    box-shadow: 0 2rpx 8rpx rgba(245, 158, 11, 0.3);
  }
}

.rank-tab-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #6b7280;

  .rank-tab--active & {
    color: #fff;
  }
}

.rank-list {
  padding: 24rpx 32rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  &--top {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 2rpx solid #fde68a;
  }
}

.rank-item__position {
  width: 64rpx;
  text-align: center;
  flex-shrink: 0;
}

.rank-medal {
  font-size: 40rpx;
}

.rank-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #9ca3af;
}

.rank-item__avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20rpx;
  flex-shrink: 0;
}

.avatar-placeholder {
  font-size: 28rpx;
  font-weight: 700;
  color: $color-primary;
}

.rank-item__info {
  flex: 1;
}

.rank-item__name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.rank-item__combo {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}

.rank-item__score {
  font-size: 32rpx;
  font-weight: 800;
  color: $color-primary;
  flex-shrink: 0;
}

.my-rank {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f3f4f6;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.my-rank-label {
  font-size: 28rpx;
  color: #6b7280;
}

.my-rank-value {
  font-size: 32rpx;
  font-weight: 700;
  color: $color-primary;
}
</style>
