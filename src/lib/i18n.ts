export type Language = 'en' | 'zh-TW'

export const LANGUAGES: { key: Language; label: string; native: string }[] = [
  { key: 'en',    label: 'English',  native: 'English' },
  { key: 'zh-TW', label: 'Chinese',  native: '繁體中文' },
]

const t: Record<Language, Record<string, string>> = {
  en: {
    // Home
    my_rewards: 'My Rewards',
    stamp_chart: 'Stamp Chart',
    who_is_earning: "Who's earning stamps today? 🌟",
    no_children: 'No children yet',
    add_first_child: 'Add your first child in Settings',
    add_child: 'Add Child',
    stamps_progress: '{active} of {goal} stamps',

    // Stamp chart
    spin_wheel: '🎡 Spin the Wheel!',
    more_stamps: '{count} more stamps to spin',
    award_stamp: '＋ Award a Stamp',
    what_did_do: 'What did {name} do? 🌟',
    pick_stamp_icon: 'Pick a stamp icon',
    no_tasks_hint: 'No tasks set up. Add some in Settings → Tasks.',

    // Spin page
    spin_the_wheel: 'Spin the Wheel!',
    spinning: 'Spinning…',
    spin_btn: 'SPIN! 🎡',
    you_won: 'You won!',
    claim_hint: 'Show this to a parent to claim your reward 🎉',
    awesome: 'Awesome! 🏆',
    no_rewards_hint: "No rewards on the wheel yet. Ask a parent to add some in Settings!",

    // Settings hub
    settings: 'Settings',
    sign_out: 'Sign Out',
    children: 'Children',
    children_desc: 'Profiles & avatars',
    wheel_rewards: 'Wheel Rewards',
    wheel_rewards_desc: 'Prizes on the wheel',
    tasks: 'Tasks',
    tasks_desc: 'What earns a stamp',
    style: 'Style',
    style_desc: 'App theme & colours',
    parent_settings: 'Parent Settings',
    enter_pin: 'Enter your 4-digit PIN',

    // Children settings
    name: 'Name',
    color: 'Color',
    upload_photo: '📷 Upload Photo',
    uploading: 'Uploading…',
    remove: 'Remove',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    add_child_btn: '＋ Add Child',
    delete_child_confirm: 'Delete this child and all their stamps?',
    childs_name: "Child's name",
    tap_to_adjust: 'tap to adjust',
    drag_hint: '1 finger pan · 2 fingers zoom',

    // Rewards settings
    reward_name: 'Reward Name',
    eg_ice_cream: 'e.g. Ice Cream',
    slice_color: 'Slice Color',
    rare: 'Rare',
    common: 'Common',
    rarity: 'Rarity',
    rarity_very_rare: 'Very Rare',
    rarity_rare: 'Rare',
    rarity_common: 'Common',
    rarity_likely: 'Likely',
    rarity_very_likely: 'Very Likely',
    rarity_custom: 'Custom',
    add_reward_btn: '＋ Add Reward',
    no_rewards_yet: 'No rewards yet. Add some!',
    delete_reward_confirm: 'Remove this reward from the wheel?',

    // Tasks settings
    task_name: 'Task Name',
    eg_made_bed: 'e.g. Made bed',
    add_task_btn: '＋ Add Task',
    no_tasks_yet: 'No tasks yet.',
    delete_task_confirm: 'Delete this task?',

    // Style settings
    app_theme: 'App Theme',
    stamp_goal_label: 'Stamp Goal',
    stamps_to_spin: 'stamps to earn a spin',
    settings_pin: 'PIN',
    pin_desc: 'Change your settings PIN',
    save_changes: 'Save Changes',
    saved: '✓ Saved!',
    language: 'Language',
    language_desc: 'English · 繁體中文',

    // Theme names
    theme_bright: 'Bright & Playful',
    theme_pastel: 'Soft Pastel',
    theme_space: 'Space Adventure',
    theme_nature: 'Nature & Animals',
    theme_ocean: 'Ocean & Sea',
    theme_candy: 'Candy Land',
    theme_sunset: 'Sunset',
    theme_midnight: 'Midnight',

    // Login
    welcome_back: 'Welcome back!',
    create_account_desc: 'Create your family account',
    email: 'Email',
    password: 'Password',
    create_account: 'Create Account',
    sign_in: 'Sign In',
    already_have_account: 'Already have an account? Sign in',
    new_here: 'New here? Create an account',
  },

  'zh-TW': {
    // Home
    my_rewards: '我的獎勵',
    stamp_chart: '集印章表',
    who_is_earning: '今天誰在集印章？🌟',
    no_children: '還沒有孩子',
    add_first_child: '在設定中新增第一個孩子',
    add_child: '新增孩子',
    stamps_progress: '{active} / {goal} 個印章',

    // Stamp chart
    spin_wheel: '🎡 轉動轉盤！',
    more_stamps: '再集 {count} 個印章才能轉盤',
    award_stamp: '＋ 獎勵印章',
    what_did_do: '{name} 做了什麼好事？🌟',
    pick_stamp_icon: '選擇印章圖案',
    no_tasks_hint: '還沒有設定任務，請到設定 → 任務新增。',

    // Spin page
    spin_the_wheel: '轉動轉盤！',
    spinning: '轉動中…',
    spin_btn: '轉！🎡',
    you_won: '恭喜！',
    claim_hint: '給爸爸媽媽看，領取你的獎勵 🎉',
    awesome: '太棒了！🏆',
    no_rewards_hint: '轉盤上還沒有獎勵，請家長到設定中新增！',

    // Settings hub
    settings: '設定',
    sign_out: '登出',
    children: '孩子',
    children_desc: '個人檔案與頭像',
    wheel_rewards: '轉盤獎勵',
    wheel_rewards_desc: '轉盤上的獎勵',
    tasks: '任務',
    tasks_desc: '賺取印章的事項',
    style: '樣式',
    style_desc: '應用程式主題與顏色',
    parent_settings: '家長設定',
    enter_pin: '請輸入 4 位數密碼',

    // Children settings
    name: '名稱',
    color: '顏色',
    upload_photo: '📷 上傳照片',
    uploading: '上傳中…',
    remove: '移除',
    save: '儲存',
    saving: '儲存中…',
    cancel: '取消',
    add_child_btn: '＋ 新增孩子',
    delete_child_confirm: '確定刪除此孩子及所有印章？',
    childs_name: '孩子的名字',
    tap_to_adjust: '點擊調整',
    drag_hint: '一指拖移・雙指縮放',

    // Rewards settings
    reward_name: '獎勵名稱',
    eg_ice_cream: '例如：冰淇淋',
    slice_color: '區塊顏色',
    rare: '稀有',
    common: '普通',
    rarity: '稀有度',
    rarity_very_rare: '非常稀有',
    rarity_rare: '稀有',
    rarity_common: '普通',
    rarity_likely: '較常見',
    rarity_very_likely: '非常常見',
    rarity_custom: '自訂',
    add_reward_btn: '＋ 新增獎勵',
    no_rewards_yet: '還沒有獎勵，快新增吧！',
    delete_reward_confirm: '確定從轉盤移除此獎勵？',

    // Tasks settings
    task_name: '任務名稱',
    eg_made_bed: '例如：整理床鋪',
    add_task_btn: '＋ 新增任務',
    no_tasks_yet: '還沒有任務。',
    delete_task_confirm: '確定刪除此任務？',

    // Style settings
    app_theme: '應用程式主題',
    stamp_goal_label: '集印章目標',
    stamps_to_spin: '個印章可轉一次',
    settings_pin: '密碼',
    pin_desc: '更改設定密碼',
    save_changes: '儲存變更',
    saved: '✓ 已儲存！',
    language: '語言',
    language_desc: 'English · 繁體中文',

    // Theme names
    theme_bright: '明亮活潑',
    theme_pastel: '柔和粉彩',
    theme_space: '太空冒險',
    theme_nature: '自然動物',
    theme_ocean: '海洋世界',
    theme_candy: '糖果樂園',
    theme_sunset: '夕陽餘暉',
    theme_midnight: '午夜星空',

    // Login
    welcome_back: '歡迎回來！',
    create_account_desc: '建立家庭帳號',
    email: '電子郵件',
    password: '密碼',
    create_account: '建立帳號',
    sign_in: '登入',
    already_have_account: '已有帳號？登入',
    new_here: '第一次使用？建立帳號',
  },
}

export function translate(lang: Language, key: string, vars?: Record<string, string>): string {
  let str = t[lang]?.[key] ?? t['en']?.[key] ?? key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v) })
  }
  return str
}
