const CONST = {
  // card deck array for distribute
  // prettier-ignore
  deckOne: [
    'H-1-0', 'H-2-0', 'H-3-0', 'H-4-0', 'H-5-0', 'H-6-0', 'H-7-0', 'H-8-0', 'H-9-0', 'H-10-0', 'H-11-0', 'H-12-0', 'H-13-0',
    'S-1-0', 'S-2-0', 'S-3-0', 'S-4-0', 'S-5-0', 'S-6-0', 'S-7-0', 'S-8-0', 'S-9-0', 'S-10-0', 'S-11-0', 'S-12-0', 'S-13-0',
    'D-1-0', 'D-2-0', 'D-3-0', 'D-4-0', 'D-5-0', 'D-6-0', 'D-7-0', 'D-8-0', 'D-9-0', 'D-10-0', 'D-11-0', 'D-12-0', 'D-13-0',
    'C-1-0', 'C-2-0', 'C-3-0', 'C-4-0', 'C-5-0', 'C-6-0', 'C-7-0', 'C-8-0', 'C-9-0', 'C-10-0', 'C-11-0', 'C-12-0', 'C-13-0',
  ],

  // table status
  PLAYING: 'PLAYING',
  LOCKED: 'LOCKED',
  RESTART: 'RESTART',
  // GAME_START_TIMER: "GAME_START_TIMER",
  LOCK_IN_PERIOD: 'LOCK_IN_PERIOD',
  WAITING: 'WAITING',
  BOT_WAITING: 'BOT_WAITING',
  ROUND_STARTED: 'RoundStated',
  ROUND_START_TIMER: 'GameStartTimer',
  ROUND_COLLECT_BOOT: 'CollectBoot',
  ROUND_END: 'RoundEndState',
  ROUND_LOCK: 'RoundLock',
  GAMEPLAY: 'GAMEPLAY',
  CARD_DEALING: 'CardDealing',

  // SPENN Paymnent Key
  API_KEY: 'Owiv+7//L9E3TsxkJuBHAInUSPHYfVJIw2KKcPjpyrZA4bBxxnDFHbL7c0yAyRADbO/REty9bwU=',

  // Entry Fee
  CHAT_MESSAGES: ['Hi All', 'Welcome', 'Please Play Fast', 'Well done!', 'Good turn', 'Bye', 'Try next time', 'Where are you from? I am from ', 'Finally I won'],

  POOL_DETAIL_OF_101: '101POOL',
  POOL_DETAIL_OF_201: '201POOL',
  //--------------------------------------------------------------------------------------------
  //Login && Signup
  //--------------------------------------------------------------------------------------------
  LOGIN: 'LOGIN',
  SIGNUP: 'SIGNUP',
  VERIFY_OTP: 'VOTP',
  RESEND_OTP: 'ROTP',
  CHECK_REFERAL_CODE: 'CRC',
  CHECK_MOBILE_NUMBER: 'CMN',
  OLD_SESSION_RELEASE: 'OSR',
  DASHBOARD: 'DASHBOARD',
  WALLET_UPDATE: 'WU',
  BANNER: 'BANNER',

  // LUDO :::::::::::::::::::::::::
  JOINLUDO: "JOINLUDO",
  RollDice: "RollDice",
  MOVEKUKARI: "MOVEKUKARI",
  KILLKUKARI: "KILLKUKARI",
  WINNERLUDO: "WINNERLUDO",
  CLPT: "CLPT",
  JPTL: "JPTL",
  SPLT:"SPLT",
  JTOFC: "JTOFC",
  GET_LUDO_ROOM_LIST:"GLRL",
  //================


  //JANTA =============================================
  JANTA_GAME_PLAYGAME: 'JGPG',
  JANTA_ROUND_START_TIMER: 'JantaGameStartTimer',
  JANTA_JOIN_TABLE: "JJT",
  JANTA_GAME_TABLE_INFO: 'JGTI',
  JANTAWINNER: "JW",
  JANTA_GAME_START_TIMER: 'JGST',
  ACTIONJANTA: "ACTIONJANTA",
  LEAVETABLESJANTA: "LEAVETABLESJANTA",
  RECONNECTJANTA: "RECONNECTJANTA",
  //===================================================

  ROULETTE_GAME_JOIN_TABLE: "RGJT",
  ROULETTE_GAME_TABLE_INFO: "RGTI",
  ROULETTE_JOIN_TABLE: "RJT",
  STARTSPINNER: "STARTSPINNER",
  ROULETTEWINNER: "ROULETTEWINNER",
  ROULETTE_GAME_JOIN_TABLE: "RGJT",
  ROULETTE_GAME_TABLE_INFO: "ROULETTEGTI",
  ROULETTE_JOIN_TABLE: "RJT",
  ROULETTE_GAME_START_TIMER: "RGST",
  START_ROULETTE: "START_ROULETTE",
  ROULETTEWINNER: "ROULETTEWINNER",
  ACTIONROULETTE: "ACTIONROULETTE",
  REMOVEBETROULETTE: "REMOVEBETROULETTE",

  ClearBet: "ClearBet",
  DoubleBet: "DoubleBet",
  LEAVETABLEROULETTE: "LEAVETABLEROULETTE",
  RECONNECTROULETTE: "RECONNECTROULETTE",
  BLUETABLETIMER: 40,
  GREENTABLETIMER: 60,
  HISTORY: "HISTORY",
  NEIGHBORBET: "NEIGHBORBET",
  PASTBET: "PASTBET",

  SPINNER_GAME_PLAYGAME: 'SGPG',
  SPINNER_GAME_ROUND_START_TIMER: 'SpinnerGameStartTimer',

  SPINNERLOGIC: "Client",
  ACTIONSPINNNER: "ACTIONSPINNNER",
  GAME_START_TIMER: 'GST',
  RECONNECTSPINNER: "RECONNECTSPINNER",
  LEAVETABLESPINNER: "LEAVETABLESPINNER",
  ClearBet: "ClearBet",
  DoubleBet: "DoubleBet",
  Spinner_GAME_START_TIMER: "SGAT",


  // Socket events names

  JOIN_TABLE: "JT",
  USER_JOIN_IN_TABLE: "UJIT",
  COLLECT_BOOT: "CB",
  USER_CARD: "UC",
  TABLE_CARD_DEAL: "TCD",
  PACK: "PACK",
  WINNER: "WINNER",
  SEE_CARD_INFO: "SCI",
  SEE_CARD: "SC",
  CHAL: "CHAL",
  SHOW: "SHOW",
  TABLE_USER_WALLET_UPDATE: "TUWU",
  JOIN: 'JOIN',
  JOIN_SIGN_UP: 'SP',
  GAME_TABLE_INFO: 'GTI',
  PING: 'PING',
  PICK_CARD: 'PIC',
  DISCARD: 'DIC',
  CARD_GROUP: 'CG',
  DECLARE: 'DEC',
  FINISH: 'FNS',
  FINISH_TIMER_SET: 'FTS',
  INVALID_DECLARE: 'IND',
  PLAYER_CARD_ACTION: 'PCA',
  INVALID_PLAYER_CARD_ACTION: 'IPCA',
  GAME_CARD_DISTRIBUTION: 'GCD',
  DONE: 'DONE',
  ERROR: 'ERROR',
  PONG: 'PONG',
  USER_TURN_START: 'UTS',
  GAME_TIME_START: 'GTS',
  INSUFFICIENT_CHIPS: 'IC',
  WIN: 'WIN',
  GAME_SCORE_BOARD: 'GSB',
  USER_TIME_OUT: 'UTO',
  USER_FINAL_TIMEOUT: 'UFTO',
  SEND_MESSAGE_TO_TABLE: 'MSGTT',
  LEAVE: 'LEAVE',
  SWITCH_TABLE: 'SWITCH',
  GAME_REPORT_PROBLEM: 'GRP',
  STAND_UP: 'STANDUP',
  LAST_GAME_SCORE_BOARD: 'LGSB',
  PLAYER_INFORMATION: 'PI',
  UPDATE_GAME_COIN: 'UGC',
  REGISTER_USER: 'RU',
  SIGN_IN: 'SI',
  OPEN_CHAT_PANEL: 'OCP',
  SEND_MESSAGE: 'SM',
  AUTO_LOGIN: 'AL',
  MANUAL_LOGIN: 'ML',
  PRIVATE_TABLE: 'PT',
  CREATE_PRIVATE_TABLE_ID: 'CPTI',
  JOIN_PRIVATE_TABLE: 'JPT',

  PRIVATE_TABLE_NOT_FOUND: 'PTNF',
  TOURNAMENT_LIST: 'TL',
  TOURNAMENT_INFORMATION: 'TI',
  TOURNAMENT_END: 'TE',
  REGISTRATION_TOURNAMENT: 'RT',
  FRIEND_REQUEST_RESULT: 'FRR',
  RECEIVE_FRIEND_REQUEST: 'RFR',
  UNFRIEND_REQUEST: 'UFR',
  LOCAL_FRIEND_LIST: 'LFL',
  FRIEND_LEADERBOARD: 'FLB',
  SEND_OTP: 'SOTP',
  PRIVATE_TABLE_START: 'PTS',
  INAPP_PURCHASE_DONE: 'IAPD',
  USER_UPDATE_PROFILE: 'UUP',
  LOGOUT: 'LOGOUT',
  EXIT: 'EXIT',
  VALIDATE_CARD: 'VC',
  GET_BET_LIST: 'GBL',
  POOL_GET_BET_LIST: 'PGBL',
  RECONNECT: 'RE',
  PLAYER_BALANCE: 'PB',
  DEPOSITE_AMOUNT: 'DA',
  INVALID_EVENT: 'IE',
  COUNTER: 'COUNTER',
  FLUTTERWAVE_WITHDRAW: 'FW',
  UPDATE_WALLET: 'UW',
  SPENN_DEPOSIT: 'SD',
  SPENN_RECEIVE: 'SR',
  PLAYER_PAYMENT_HISTORY: 'PH',
  SPENN_NOTIFICATION: 'SN',
  BORROW_USER_CHIPS: 'BUC',
  DECLARE_TIMER_SET: 'DTS',
  RESTART_GAME_TABLE: 'RT',
  PLAYER_FINISH_DECLARE_TIMER: 'PFDT',
  // new


  USER_JOIN_IN_TABLE: 'UJIT',
  TABLE_FULL_DATA: 'TFD',
  GAME_START_TIMER: 'GST',
  COLLECT_BOOT: 'CB',
  LEAVE_TABLE: 'LT',
  TURN_START: 'TS',
  PACK: 'PACK',
  WINNER: 'WINNER',
  TABLE_USER_WALLET_UPDATE: 'TUWU',
  KILL: 'KILL',
  FLUTTERWAVE_MOBILE_MONEY_DEPOSIT: 'FMMD',
  WEB_VIEW_CLOSE: 'WVC',
  LAST_POOL_POINT: 'LPP',
  DEMO_LAST_POOL_POINT: 'DEMOLPP',

  // Player Status
  WATCHING: 'WATCHING',
  DECLARED: 'DECLARED',
  LEFT: 'LEFT',
  INVALID_DECLARED: 'INVALID_DECLARED',
  VALID_DECLARED: 'VALID_DECLARED',
  DROPPED: 'DROP',
  LOST: 'LOST',
  WON: 'WON',
  FINISHED: 'FINISHED',
  EXPELED: 'EXPELED',
  LEADER_BOARD: 'LB',
  ADD_FRIEND: 'AF',
  CHANGE_PASWORD: 'CP',
  FORGOT_PASWORD: 'FP',
  USER_PROFILE_DETAILS: 'UPD',
  USER_PROFILE_UPDATE: 'UUP',
  STOP_GAME_TIMER: 'SGT',
  UPDATE_CARD_STATUS: 'UCS',
  NOTIFICATION: 'NOTIFICATION',
  FLUTTERWAVE_BENEFICIARY: 'FB',
  PAYMENT_NOTIFICATION: 'PN',
  FLUTTERWAVE_KYC: 'FK',
  FLUTERWAVE_SAVE_DATA: 'FSD',
  INSUFFICIENT_MONEY: 'IM',
  FLUTTERWAVE_MOBILE_ADD_MONEY: 'FMAM',
  RE_JOIN_UPDATE_SCORE: 'RJUS',
  REMOVE_USERSOCKET_FROM_TABLE: 'RUFT',
  REGISTER_TOURNAMENT: 'TR',
  JOIN_TOURNAMENT: 'JTR',
  WITHDRAW_TOURNAMENT: 'WTR',

  RE_JOIN: 'RE_JOIN',
  DISCONNECT: 'DISCONNECT',
  GET_MY_TOURNAMENT: 'MT',

  //Teen Patti
  TEEN_PATTI_SIGN_UP: 'TPSP',
  GET_TEEN_PATTI_ROOM_LIST: 'TPRL',
  TEEN_PATTI_JOIN_TABLE: 'TPJT',
  TEEN_PATTI_GAME_TABLE_INFO: 'TPGTI',
  TEEN_PATTI_GAME_START_TIMER: 'TPGST',
  TEEN_PATTI_COLLECT_BOOT: 'TPCB',
  TEEN_PATTI_WALLET_UPDATE: 'TPWU',
  TEEN_PATTI_GAME_ROUND_START_TIMER: 'TPGRST',
  TEEN_PATTI_GAME_CARD_DISTRIBUTION: 'TPGCD',
  TEEN_PATTI_PACK: 'TPPACK',
  TEEn_PATTI_SHOW: 'TPSHOW',
  TEEN_PATTI_CHAL: 'TPCHAL',
  TEEN_PATTI_LEAVE_TABLE: 'TPLT',
  TEEN_PATTI_WINNER: 'TPWINNER',
  TEEN_PATTI_USER_TURN_START: 'TPUTS',
  TEEN_PATTI_CARD_SEEN: 'TPCS',
  TEEN_PATTI_SEE_CARD_INFO: 'TPSCI',

  //TEEN Private Table
  CREATE_TEEN_PRIVATE_TABLE_ID: 'CTPTI',
  T_JOIN_PRIVATE_TABLE: 'TJPT',
  T_PRIVATE_TABLE_START: 'TPTS',



  //Rummy
  R_GET_BET_LIST: "RGBL",
  R_JOIN_SIGN_UP: "RSP",
  R_JOIN_TABLE: "RJT",
  R_GAME_TABLE_INFO: 'RGTI',
  R_USER_TURN_START: "RUTS",
  R_PICK_CARD: "RPIC",
  R_DISCARD: "RDIC",
  R_CARD_GROUP: "RCG",
  R_DECLARE: "RDEC",
  R_DROPPED: "RDROP",
  R_PLAYER_FINISH_DECLARE_TIMER: "RPFDT",
  R_FINISH: "RFNS",
  R_LEAVE: "RLEAVE",
  R_GAME_START_TIMER: 'RGST',
  R_COLLECT_BOOT: "RCB",
  R_GAME_TIME_START: "RGTS",
  R_DECLARE_TIMER_SET: "RDTS",
  R_INVALID_DECLARE: 'RIND',
  R_FINISHED: 'RFINISHED',
  R_WIN: "RWIN",
  R_GAME_SCORE_BOARD: 'RGSB',
  R_LAST_GAME_SCORE_BOARD: 'RLGSB',
  R_LEAVE_TABLE: "RLT",
  R_RECONNECT: "RRE",
  R_GAME_CARD_DISTRIBUTION: 'RGCD',
  R_FINISH_TIMER_SET: 'RFTS',

  //Rummy Private Table
  R_CREATE_RUMMY_PRIVATE_TABLE_ID: 'CRPTI',
  R_JOIN_PRIVATE_TABLE: 'RJPT',
  R_PRIVATE_TABLE_START: 'RPTS',
  R_PRIVATE_TABLE_INFO: 'RPTI',


  // Timer
  userTurnTimer: 30,
  gameStartTime: 10,
  gameCardDistributeDelayTime: 1,
  finishTimer: 20,
  rsbTimer: 4,
  restartTimer: 5,

  // commission
  commission: 10,
  POOL_COMMISSION: 15,

  // TOURNAMENT COIN
  TOURNAMENT_COIN: 500,



  // Timer
  userTurnTimer: 30,
  gameStartTime: 10,
  gameCardDistributeDelayTime: 1,
  finishTimer: 20,
  rsbTimer: 4,
  restartTimer: 5,

  // commission
  commission: 10,
  POOL_COMMISSION: 15,

  // TOURNAMENT COIN
  TOURNAMENT_COIN: 500,

  // player score
  PLAYER_SCORE: 80,
  GAME_PLAY_COST: 3,
  PLAYER_LEAVE_SCORE: 20,
  FIRST_DROP: 16,
  SECOND_DROP: 30,
  TIME_TURN_OUT_COUNTER: 3,
  COMPUTER_TIME_TURN_OUT_COUNTER: 3,

  // Player
  TOTAL_PLAYER: 5,
  COMPUTER_TOTAL_PLAYER: 2,
  TOTAL_PLAYER_FOR_COMPUTER: 2,
  SIGN_UP_PLAYER_COIN: 500,
  // AVAILABLE_SEAT_POSITION: [5, 4, 3, 2, 1, 0],

  // Variable Name
  TOTAL_PLYING_POINT: 'TPP',
  TOTAL_WINNING_POINT: 'TWP',

  TOTAL_PLYING_POOL: 'TPPO',
  TOTAL_WINNING_POOL: 'TWPP',

  TOTAL_PLYING_DEAL: 'TPD',
  TOTAL_WINNING_DEAL: 'TWD',

  COIN_TRANSACTION: {
    MATCH_WON: 'Match Won',
    AD_VIEWED: 'Ad Viewed',
    DEFAULT: 'Registration',

    MATCH_LOST: 'Match Lost',
    DECLARED: 'Invalid Declared',
    DECLARED_WON: 'Declared Won',
    GAME_LEAVE: 'Leave Game',
  },

  // friendship status
  // 1 for pending 2 for approved,3 for decline

  FRIENDSHIP: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECT: 'decline',
  },

  LOGIN_TYPE: {
    LOGIN: 'login',
    SIGNUP: 'signup',
  },


  GAME_TYPE: {
    POINT_RUMMY: 'pointrummy',
    POOL_RUMMY: 'poolrummy',
    DEAL_RUMMY: 'dealrummy',
    PRIVATE_RUMMY: 'RummyPrivateTable',
  },

  TEEN_GAME_TYPE: {
    SIMPLE_TEEN: 'Simple',
    PRIVATE_TEEN: 'TeenPrivateTable',
  },

  COUNTRY_CODE: process.env.COUNTRY_CODE || '+91',

  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

module.exports = CONST;
