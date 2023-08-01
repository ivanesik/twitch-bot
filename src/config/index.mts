import zod from 'zod';

import {FileHelper} from '../file/FileHelper.mjs';
import {configSchema, templateSchema, opositeRewardsSchema} from './validator.mjs';

export type TRewardTemplate = zod.infer<typeof templateSchema>;
export type TRewardRatingConfig = zod.infer<typeof configSchema>;
export type TOpositeRewardInfo = zod.infer<typeof opositeRewardsSchema>;

const REWARD_RATINGS_CONFIG = FileHelper.readJsonFile('.', 'config.json');

export const config = configSchema.parse(REWARD_RATINGS_CONFIG);
