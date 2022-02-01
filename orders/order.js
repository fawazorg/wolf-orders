const { Validator } = require("wolf.js");
const { api } = require("../bot");
const db = require("./db");
/**
 *
 * @param {import("wolf.js").CommandObject} command
 */
const Check = async (command) => {
  let gid = checkNumber(command.argument.trim());
  if (!gid) {
    await reply(command, getPhrase("number_not_valid", command));
    return;
  }
  let group = await api.group().getById(gid);
  if (!group.exists) {
    await reply(command, getPhrase("group_not_found", command));
    return;
  }
  let group_db = await db.findGroup(group.id);
  if (group_db.length !== 0) {
    await reply(command, groupExists(group_db, command));
    return;
  }
  let ordersRoom = await api.group().getSubscriberList(command.targetGroupId);
  let groupStats = await api.group().getStats(gid);
  let r = groupinfo(group, command);
  r += OwnerCheck(group, ordersRoom, command);
  r += MemberCountCheck(group, command);
  r += StatsCheck(groupStats, command);
  r += await OneRoomCheck(group.owner.id, command);
  r += CheckEntryLevel(group, command);
  r += CheckPassworded(group, command);
  await reply(command, r);
  if (await validToAdd(command, group, ordersRoom, groupStats)) {
    await db.addGroup(group.id, group.owner.id);
    await reply(command, getPhrase("group_added", command));
  }
};
/**
 *
 * @param {import("wolf.js").CommandObject} command
 */
const JoinBot = async (command) => {
  let gid = checkNumber(command.argument.trim());
  if (!gid) {
    await reply(command, getPhrase("number_not_valid", command));
    return;
  }
  let group_db = await db.findGroup(gid);
  if (group_db.length === 0) {
    await reply(command, getPhrase("order_not_found", command));
    return;
  }
  if (group_db[0].joined) {
    await reply(command, getPhrase("order_already_joined", command));
    return;
  }
  await db.groupJoind(gid, command.sourceSubscriberId);
  return await reply(command, await orderDone(command));
};
/**
 *
 * @param {import("wolf.js").CommandObject} command
 */
const Count = async (command) => {
  let orders = await db.AllOrders();
  if (orders.length === 0) {
    await reply(command, getPhrase("orders_not_found", command));
    return;
  }
  return await reply(command, PrrintOrders(command, orders));
};
/**
 *
 * @param {import("wolf.js").GroupObject} group
 * @param {import("wolf.js").GroupSubscriberObject[]} ordersGroup
 * @param {import("wolf.js").CommandObject} command
 */
const OwnerCheck = (group, ordersGroup, command) => {
  let phrase = getPhrase("check_onwer", command);
  if (ordersGroup.some((s) => s.id === group.owner.id)) {
    return `\n(y) ${phrase}`;
  }
  return `\n(n) ${phrase}`;
};
/**
 *
 * @param {import("wolf.js").GroupObject} group
 * @param {import("wolf.js").CommandObject} command
 */
const MemberCountCheck = (group, command) => {
  let phrase = api.utility().string().replace(getPhrase("check_members_count", command), {
    count: group.members,
  });
  if (group.members >= 500) {
    return `\n(y) ${phrase}`;
  }
  return `\n(n) ${phrase}`;
};
/**
 *
 * @param {import("wolf.js").GroupStatsObject} groupStats
 * @param {import("wolf.js").CommandObject} command
 */
const StatsCheck = (groupStats, command) => {
  let phrase = api
    .utility()
    .string()
    .replace(getPhrase("check_status", command), {
      count: groupStats?.trends[1]?.lineCount ?? "0",
    });
  if (groupStats && groupStats.trends[1].lineCount >= 500) {
    return `\n(y) ${phrase}`;
  }
  return `\n(n) ${phrase}`;
};
/**
 *
 * @param {Number} id
 * @param {import("wolf.js").CommandObject} command
 */
const OneRoomCheck = async (id, command) => {
  let phrase = getPhrase("check_one_room", command);
  let OneRoom = await db.findOwner(id);
  if (OneRoom.length !== 0) {
    return `\n(n) ${phrase}`;
  }
  return `\n(y) ${phrase}`;
};

/**
 *
 * @param {import("wolf.js").GroupObject} group
 * @param {import("wolf.js").CommandObject} command
 */
const groupinfo = (group, command) => {
  let phrase = api.utility().string().replace(getPhrase("group_info", command), {
    name: group.name,
  });
  return `${phrase}\n`;
};
/**
 *
 * @param {import("wolf.js").GroupObject} group
 * @param {import("wolf.js").CommandObject} command
 */
const CheckEntryLevel = (group, command) => {
  let phrase = api.utility().string().replace(getPhrase("check_entry_level", command), {
    level: group.extended.entryLevel,
  });
  if (group.extended.entryLevel > 6) {
    return `\n⚠️ ${phrase}`;
  }
  return "";
};
/**
 *
 * @param {import("wolf.js").GroupObject} group
 * @param {import("wolf.js").CommandObject} command
 */
const CheckPassworded = (group, command) => {
  let phrase = getPhrase("check_passworded", command);
  if (group.extended.passworded) {
    return `\n⚠️ ${phrase}`;
  }
  return "";
};
/**
 *
 * @param {*} group
 * @param {import("wolf.js").CommandObject} command
 */
const groupExists = (group, command) => {
  let phrase = api
    .utility()
    .string()
    .replace(getPhrase("group_exists", command), {
      date: new Date(group[0].created_at).toLocaleDateString("en-US"),
      stats: group[0].joined ? "منتهي" : "معلق",
    });
  return phrase;
};
/**
 *
 * @param {import("wolf.js").CommandObject} command
 */
const orderDone = async (command) => {
  let user = await api.subscriber().getById(command.sourceSubscriberId);
  let phrase = api.utility().string().replace(getPhrase("order_done", command), {
    id: user.id,
    nickname: user.nickname,
  });
  return phrase;
};
/**
 *
 * @param {import("wolf.js").CommandObject} command
 * @param {Array} orders
 */
const PrrintOrders = (command, orders) => {
  let phrase = api
    .utility()
    .string()
    .replace(getPhrase("orders_message", command), {
      total: orders.length,
      COrders: orders.filter((itme) => itme.joined === true).length,
      POrders: orders.filter((itme) => itme.joined === false).length,
    });
  return phrase;
};
/**
 *
 * @param {import("wolf.js").CommandObject} command
 * @param {import("wolf.js").GroupObject} group
 * @param {import("wolf.js").GroupSubscriberObject[]} ordersGroup
 * @param {import("wolf.js").GroupStatsObject} groupStats
 */
const validToAdd = async (command, group, ordersGroup, groupStats) => {
  let add = false;
  let owner = await db.findOwner(group.owner.id);
  if (
    ordersGroup.some((s) => s.id === group.owner.id) &&
    group.members >= 500 &&
    groupStats &&
    groupStats.trends[1].lineCount >= 500 &&
    owner.length === 0
  ) {
    add = true;
  }
  return add;
};
/**
 *
 * @param {String} phrase
 * @param {import("wolf.js").CommandObject} command
 */
const getPhrase = (phrase, command) => {
  return api.phrase().getByLanguageAndName(command.language, `${api.config.keyword}_${phrase}`);
};
/**
 *
 * @param {String} content
 * @param {import("wolf.js").CommandObject} command
 */
const reply = async (command, content) => {
  await api.messaging().sendMessage(command, content);
};
/**
 *
 * @param {Number} number
 */
const checkNumber = (number) => {
  let n = api.utility().number().toEnglishNumbers(number);
  if (Validator.isValidNumber(n)) {
    n = parseInt(n);
    return n;
  }
  return null;
};
module.exports = { Check, JoinBot, Count };
