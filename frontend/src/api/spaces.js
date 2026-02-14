import api from "./api";

/* =========================
   CREATE SPACE
========================= */
export const createSpace = async (token) => {
  const res = await api.post(
    "/spaces/create",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/* =========================
   SEND INVITE
========================= */
export const sendInvite = async (email, token) => {
  const res = await api.post(
    "/spaces/invite",
    { partnerEmail: email },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/* =========================
   ACCEPT INVITE
========================= */
export const acceptInvite = async (inviteToken, token) => {
  const res = await api.post(
    `/spaces/accept/${inviteToken}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/* =========================
   SPACE STATUS
========================= */
export const getSpaceStatus = async (token) => {
  const res = await api.get("/spaces/status", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

/* =========================
   CANCEL INVITE
========================= */
export const cancelInvite = async (token) => {
  const res = await api.post(
    "/spaces/invite/cancel",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/* =========================
   RESEND INVITE
========================= */
export const resendInvite = async (token) => {
  const res = await api.post(
    "/spaces/invite/resend",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
