import api from "./api";

/* =========================
   CREATE SPACE
========================= */
export const createSpace = async () => {
  const res = await api.post("/spaces/create");
  return res.data;
};

/* =========================
   SEND INVITE
========================= */
export const sendInvite = async (email) => {
  const res = await api.post("/spaces/invite", {
    partnerEmail: email,
  });
  return res.data;
};

/* =========================
   ACCEPT INVITE
========================= */
export const acceptInvite = async (inviteToken) => {
  const res = await api.post(`/spaces/accept/${inviteToken}`);
  return res.data;
};

/* =========================
   SPACE STATUS
========================= */
export const getSpaceStatus = async () => {
  const res = await api.get("/spaces/status");
  return res.data;
};

/* =========================
   CANCEL INVITE
========================= */
export const cancelInvite = async () => {
  const res = await api.post("/spaces/invite/cancel");
  return res.data;
};

/* =========================
   RESEND INVITE
========================= */
export const resendInvite = async () => {
  const res = await api.post("/spaces/invite/resend");
  return res.data;
};
