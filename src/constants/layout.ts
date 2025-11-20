import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const GRID_CONFIG = {
  COLUMNS: 4,
  PADDING: 20,
  ITEM_SPACING: 4,
} as const;

export const GRID_METRICS = {
  ITEM_SIZE: (SCREEN_WIDTH - GRID_CONFIG.PADDING * 2) / GRID_CONFIG.COLUMNS,
};
