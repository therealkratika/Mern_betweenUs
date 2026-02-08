import api from "./api"; 
export const createSpace = async () => {
  const res = await api.post("/spaces/create");
  return res.data;
};
export const cancelInvite = async () => {
  const res = await api.post("/spaces/invite/cancel");
  return res.data;
};

export const acceptInvite = async (token) => {
  const res = await api.post(`/spaces/accept/${token}`);
  return res.data;
};

export const getSpaceStatus = async () => {
  const res = await api.get("/spaces/status");
  return res.data;
};

export const sendInvite = (email) => {
  return api.post("/spaces/#invite", {
    partnerEmail: email
  });
};


export const resendInvite = async () => {
  const res = await api.post("/spaces/invite/resend");
  return res.data;
};
