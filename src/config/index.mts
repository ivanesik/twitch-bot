import {type infer as ZodInfer} from 'zod';

import {FileHelper} from '../file/FileHelper.mjs';

import {
    configSchema,
    templateSchema,
    opositeRewardsSchema,
    templateInfoSchema,
} from './validator.mjs';

export type TRewardTemplate = ZodInfer<typeof templateSchema>;
export type TRewardTemplateInfo = ZodInfer<typeof templateInfoSchema>;
export type TOpositeRewardInfo = ZodInfer<typeof opositeRewardsSchema>;
export type TRewardRatingConfig = ZodInfer<typeof configSchema>;

const REWARD_RATINGS_CONFIG = FileHelper.readJsonFile('.', 'config.json');

export const config = configSchema.parse(REWARD_RATINGS_CONFIG);
