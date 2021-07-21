/* eslint-disable global-require */
export const ICONS = {
  // social icons
  GITHUB: require('../../assets/images/icons/github.svg'),
  TWITTER: require('../../assets/images/icons/twitter.svg'),
  TELEGRAM: require('../../assets/images/icons/telegram.svg'),
  DISCORD: require('../../assets/images/icons/discord.svg'),
  DISCORD_FULL: require('../../assets/images/icons/discord-full.svg'),
  PORTIS: require('../../assets/images/icons/portis.svg'),

  // UI
  ARROW_DOWN: require('../../assets/images/icons/arrow_down.svg'),
  ARROW_UP: require('../../assets/images/icons/arrow_up.svg'),
  ARROW_LEFT: require('../../assets/images/icons/arrow_left.svg'),
  ARROW_RIGHT: require('../../assets/images/icons/arrow_right.svg'),
  CHECK: require('../../assets/images/icons/check.svg'),
  CHECK_ACTIVE: require('../../assets/images/icons/check_active.svg'),
  EDIT: require('../../assets/images/icons/edit.svg'),
  INFO: require('../../assets/images/icons/info.svg'),
  INFO_ACTIVE: require('../../assets/images/icons/info_active.svg'),
  WARNING: require('../../assets/images/icons/warning.svg'),
  WARNING_ACTIVE: require('../../assets/images/icons/warning_active.svg'),
  QUESTION: require('../../assets/images/icons/question.svg'),
  QUESTION_ACTIVE: require('../../assets/images/icons/question_active.svg'),
  EXTERNAL_LINK: require('../../assets/images/icons/external_link.svg'),
  FEEDBACK: require('../../assets/images/icons/feedback.svg'),
  REFRESH: require('../../assets/images/icons/refresh.svg'),
  SUPPORT: require('../../assets/images/icons/support.svg'),
  CLOSE: require('../../assets/images/icons/close.svg'),
  COPY: require('../../assets/images/icons/copy.svg'),
  SETTINGS: require('../../assets/images/icons/settings.svg'),
  CROCO_EMOJI: require('../../assets/images/icons/croco_emoji.svg'),
  CROCO_LOGO: require('../../assets/images/icons/croco_logo.svg'),
  HEART: require('../../assets/images/icons/heart.svg'),
  FILTER: require('../../assets/images/icons/filter.svg'),
  POOLS: require('../../assets/images/icons/pools.svg'),
  DASHBOARD: require('../../assets/images/icons/dashboard.svg'),
  HAMBURGER_MENU: require('../../assets/images/icons/hamburger_menu.svg'),
  UNKNOWN_TOKEN: require('../../assets/images/icons/unknown_token.svg'),
  PLUS: require('../../assets/images/icons/plus.svg'),
  SWITCH: require('../../assets/images/icons/switch.svg'),

  // themes
  LIGHT_MODE: require('../../assets/images/icons/light-mode.svg'),
  DARK_MODE: require('../../assets/images/icons/dark-mode.svg'),
}

export type IconType = keyof typeof ICONS
