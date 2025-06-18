import Joi from "joi";

export const createCommentDmAutomationSchema = Joi.object({
  channelId: Joi.string().required(),
  postId: Joi.string().required(),
  triggerWords: Joi.array().items(Joi.string()).min(1).required(),
  matchType: Joi.string().valid("any", "all").required(),
  dmMessage: Joi.object({
    opening: Joi.object({
      enabled: Joi.boolean().required(),
      text: Joi.when("enabled", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
      }),
    }).required(),
    main: Joi.object({
      text: Joi.string().required(),
      buttons: Joi.array()
        .items(
          Joi.object({
            label: Joi.string().required(),
            url: Joi.string().uri().required(),
          })
        )
        .min(1)
        .required(),
    }).required(),
  }).required(),
});
