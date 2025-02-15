import {type infer as ZodInfer} from 'zod';

import {FileHelper} from '../file/FileHelper.mjs';

import {
    configSchema,
    templateSchema,
    oppositeRewardsSchema,
    templateInfoSchema,
} from './validator.mjs';

export type TRewardTemplate = ZodInfer<typeof templateSchema>;
export type TRewardTemplateInfo = ZodInfer<typeof templateInfoSchema>;
export type TOppositeRewardInfo = ZodInfer<typeof oppositeRewardsSchema>;
export type TRewardRatingConfig = ZodInfer<typeof configSchema>;

const REWARD_RATINGS_CONFIG = FileHelper.readJsonFile(process.cwd(), 'config.json');

export const config = configSchema.parse(REWARD_RATINGS_CONFIG);
