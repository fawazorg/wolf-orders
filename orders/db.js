const { supabase } = require("../bot");

const findGroup = async (id) => {
  const { data, error } = await supabase.from("orders").select().eq("groupID", id);
  if (!error) {
    return data;
  }
  return null;
};

const AllOrders = async () => {
  const { data, error } = await supabase.from("orders").select();
  if (!error) {
    return data;
  }
  return null;
};

const findOwner = async (id) => {
  const { data, error } = await supabase.from("orders").select().eq("ownerID", id);
  if (!error) {
    return data;
  }
  return null;
};

const addGroup = async (groupID, ownerID, botType = "o") => {
  const { data, error } = await supabase
    .from("orders")
    .insert([{ groupID, ownerID, bot_type: botType }]);
  if (!error) {
    return data;
  }
  return null;
};

const groupJoind = async (groupID, join_by) => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      join_by,
      joined: true,
      join_at: new Date().toISOString().toLocaleString("en-US"),
    })
    .match({ groupID });
  if (!error) {
    return data;
  }
  return null;
};

module.exports = { findGroup, findOwner, addGroup, groupJoind, AllOrders };
